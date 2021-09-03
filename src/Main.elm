port module Main exposing (main)

import Browser
import Character exposing (Character, currentLoc)
import Html exposing (Html, button, div, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import Loc exposing (Loc)
import Model exposing (Direction(..), Model, Msg(..), StateEnvelope)


init : () -> ( Model, Cmd Msg )
init _ =
    ( { grid =
            []
      , init =
            { currentY = 0
            , currentX = 0
            , maxY = 100
            , maxX = 100
            , finished = False
            }
      , characterList = []
      , playerCharacterId = 0
      }
    , Cmd.none
    )


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }



-- Inbound ports


port receiveState : (StateEnvelope -> msg) -> Sub msg


port moveLeft : (Bool -> msg) -> Sub msg


port moveRight : (Bool -> msg) -> Sub msg


port moveUp : (Bool -> msg) -> Sub msg


port moveDown : (Bool -> msg) -> Sub msg


port updateCharacter : (Character -> msg) -> Sub msg



-- Outbound ports


port initState : Model -> Cmd msg


port addCharacter : Character -> Cmd msg


port moveCharacter : Character -> Cmd msg


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ moveLeft (Move Left)
        , moveRight (Move Right)
        , moveUp (Move Up)
        , moveDown (Move Down)
        , receiveState RefreshState
        , updateCharacter UpdateCharacter
        ]


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        RefreshState envelope ->
            ( { model | grid = envelope.grid, characterList = envelope.characterList }, Cmd.none )

        GenerateNextCell loc ->
            let
                nextX =
                    if model.init.currentY == model.init.maxY then
                        model.init.currentX + 1

                    else
                        model.init.currentX

                finished =
                    model.init.currentX > model.init.maxX

                nextY =
                    if model.init.currentY == model.init.maxY then
                        if finished == True then
                            model.init.currentY

                        else
                            0

                    else
                        model.init.currentY + 1

                prevInit =
                    model.init

                nextInit =
                    { prevInit | currentX = nextX, currentY = nextY, finished = finished }

                newGrid =
                    if finished == True then
                        model.grid

                    else if model.init.currentY == 0 then
                        model.grid ++ [ [ loc ] ]

                    else
                        List.map
                            (\row ->
                                if List.length row > model.init.maxY then
                                    row

                                else
                                    row ++ [ loc ]
                            )
                            model.grid

                newModel =
                    { model | init = nextInit, grid = newGrid }
            in
            if finished then
                ( newModel, initState newModel )

            else
                update (GenerateNextCell { x = nextX, y = nextY }) newModel

        GenerateFirstCell ->
            update (GenerateNextCell { x = 0, y = 0 })
                { model
                    | characterList =
                        [ { id = 1
                          , loc = { x = 3, y = 3 }
                          , name = "Player"
                          , color = "red"
                          }
                        ]
                    , playerCharacterId = 1
                }

        Move direction _ ->
            let
                currentCharacter =
                    Character.getCharacter model.characterList model.playerCharacterId

                currentLoc =
                    currentCharacter.loc

                newLoc =
                    case direction of
                        Up ->
                            { x = currentLoc.x - 1, y = currentLoc.y }

                        Down ->
                            { x = currentLoc.x + 1, y = currentLoc.y }

                        Left ->
                            { x = currentLoc.x, y = currentLoc.y - 1 }

                        Right ->
                            { x = currentLoc.x, y = currentLoc.y + 1 }

                updatedCharacter =
                    { currentCharacter
                        | loc =
                            if isWithinBounds newLoc model && Character.inLoc model.characterList newLoc == False then
                                newLoc

                            else
                                currentLoc
                    }

                newCharacterList =
                    List.map
                        (\character ->
                            if character.id == model.playerCharacterId then
                                updatedCharacter

                            else
                                character
                        )
                        model.characterList
            in
            ( { model
                | characterList = newCharacterList
              }
            , moveCharacter updatedCharacter
            )

        AddNewCharacter ->
            let
                newCharacter =
                    { id = List.length model.characterList + 1
                    , loc = { x = 3, y = 3 }
                    , name = "New Character"
                    , color = "blue"
                    }

                newCharacterList =
                    model.characterList ++ [ newCharacter ]
            in
            ( { model
                | characterList = newCharacterList
                , playerCharacterId = newCharacter.id
              }
            , addCharacter newCharacter
            )

        UpdateCharacter updatedCharacter ->
            let
                characterExists =
                    List.any
                        (\character ->
                            character.id == updatedCharacter.id
                        )
                        model.characterList

                newCharacterList =
                    if characterExists then
                        List.map
                            (\oldCharacter ->
                                if oldCharacter.id == updatedCharacter.id then
                                    updatedCharacter

                                else
                                    oldCharacter
                            )
                            model.characterList

                    else
                        model.characterList ++ [ updatedCharacter ]
            in
            ( { model
                | characterList = newCharacterList
              }
            , Cmd.none
            )


view : Model -> Html Msg
view model =
    div []
        [ button
            [ onClick
                (if List.length model.grid > 0 then
                    AddNewCharacter

                 else
                    GenerateFirstCell
                )
            ]
            [ text "Start" ]
        , div []
            (List.map
                (displayRow model)
                model.grid
            )
        ]


displayRow : Model -> List Loc -> Html Msg
displayRow model row =
    div [ class "row" ]
        (List.map
            (displayCell model)
            row
        )


displayCell : Model -> Loc -> Html Msg
displayCell model loc =
    let
        currentLoc =
            Character.currentLoc model.characterList model.playerCharacterId

        hasCharacter =
            Character.hasCharacter model.characterList loc

        playerCharacter =
            Character.getCharacter model.characterList model.playerCharacterId
    in
    if isWithinRange currentLoc loc model then
        div
            [ class
                ("cell"
                    ++ (if currentLoc == loc then
                            " current"

                        else if hasCharacter then
                            " character"

                        else
                            ""
                       )
                )
            ]
            [ text
                (if currentLoc == loc then
                    playerCharacter.name

                 else
                    ""
                )
            ]

    else
        div [] []


isWithinRange : Loc -> Loc -> Model -> Bool
isWithinRange playerLoc cellLoc model =
    let
        xRange =
            if playerLoc.x < 5 then
                10 - playerLoc.x

            else if playerLoc.x > model.init.maxX - 5 then
                playerLoc.x - model.init.maxX + 10

            else
                5

        yRange =
            if playerLoc.y < 5 then
                10 - playerLoc.y

            else if playerLoc.y > model.init.maxY - 5 then
                playerLoc.y - model.init.maxY + 10

            else
                5
    in
    abs (playerLoc.x - cellLoc.x)
        <= xRange
        && abs (playerLoc.y - cellLoc.y)
        <= yRange


isWithinBounds : Loc -> Model -> Bool
isWithinBounds loc model =
    loc.x
        >= 0
        && loc.x
        <= model.init.maxX
        && loc.y
        >= 0
        && loc.y
        <= model.init.maxY
