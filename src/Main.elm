port module Main exposing (main)

import Browser
import Character exposing (currentLoc)
import Html exposing (Html, button, div, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import Loc exposing (Loc)
import Model exposing (Direction(..), Model, Msg(..))


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


port moveLeft : (Bool -> msg) -> Sub msg


port moveRight : (Bool -> msg) -> Sub msg


port moveUp : (Bool -> msg) -> Sub msg


port moveDown : (Bool -> msg) -> Sub msg


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ moveLeft (Move Left)
        , moveRight (Move Right)
        , moveUp (Move Up)
        , moveDown (Move Down)
        ]


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

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
                ( newModel, Cmd.none )

            else
                update (GenerateNextCell { x = nextX, y = nextY }) newModel

        GenerateFirstCell ->
            update (GenerateNextCell { x = 0, y = 0 })
                { model
                    | characterList =
                        [ { id = 1
                          , loc = { x = 10, y = 10 }
                          , name = "Player"
                          , color = "red"
                          }
                        ]
                    , playerCharacterId = 1
                }

        Move direction _ ->
            let
                currentLoc =
                    Character.currentLoc model.characterList model.playerCharacterId

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

                newCharacterList =
                    List.map
                        (\character ->
                            if character.id == model.playerCharacterId then
                                { character
                                    | loc =
                                        if isWithinBounds newLoc model then
                                            newLoc

                                        else
                                            currentLoc
                                }

                            else
                                character
                        )
                        model.characterList
            in
            ( { model
                | characterList = newCharacterList
              }
            , Cmd.none
            )


view : Model -> Html Msg
view model =
    div []
        [ button [ onClick GenerateFirstCell ] [ text "Start" ]
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

        playerCharacter =
            Character.getCharacter model.characterList model.playerCharacterId
    in
    if isWithinRange currentLoc loc model then
        div
            [ class
                ("cell"
                    ++ (if currentLoc == loc then
                            " current"

                        else
                            ""
                       )
                )
            ]
            [ text (if currentLoc == loc then playerCharacter.name else "")
            ]

    else
        div [] []


isWithinRange : Loc -> Loc -> Model -> Bool
isWithinRange playerLoc cellLoc model =
    let
        xRange =
            if playerLoc.x < 10 then
                20 - playerLoc.x

            else if playerLoc.x > model.init.maxX - 10 then
                playerLoc.x - model.init.maxX + 20

            else
                10

        yRange =
            if playerLoc.y < 10 then
                20 - playerLoc.y

            else if playerLoc.y > model.init.maxY - 10 then
                playerLoc.y - model.init.maxY + 20

            else
                10
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
