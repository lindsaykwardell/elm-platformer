port module Main exposing (main)

import Browser
import Html exposing (Html, button, div, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import Model exposing (Loc, Model, Msg(..), Direction(..))


init : () -> ( Model, Cmd Msg )
init _ =
    ( { grid =
            []
      , init =
            { currentY = 0
            , currentX = 0
            , maxY = 20
            , maxX = 20
            , finished = False
            }
      , currentLoc = { x = 10, y = 10 }
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
            update (GenerateNextCell { x = 0, y = 0 }) model

        Move direction _ ->
            let
                newLoc =
                    case direction of
                        Up ->
                            { x = model.currentLoc.x - 1, y = model.currentLoc.y }
                        Down ->
                            { x = model.currentLoc.x + 1, y = model.currentLoc.y }
                        Left ->
                            { x = model.currentLoc.x, y = model.currentLoc.y - 1 }
                        Right ->
                            { x = model.currentLoc.x, y = model.currentLoc.y + 1 }
            in        
                ( { model | currentLoc = newLoc }, Cmd.none )

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
    div
        [ class
            ("cell"
                ++ (if model.currentLoc == loc then
                        " current"

                    else
                        ""
                   )
            )
        ]
        [ text ("(" ++ String.fromInt loc.x ++ ", " ++ String.fromInt loc.y ++ ")")
        ]
