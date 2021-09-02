module Model exposing (..)

type Direction
    = Left
    | Right
    | Up
    | Down

type alias Loc =
    { x : Int
    , y : Int
    }


type alias Model =
    { grid : List (List Loc)
    , init : { currentY : Int, currentX : Int, maxX : Int, maxY : Int, finished : Bool }
    , currentLoc: Loc
    }


type Msg
    = NoOp
    | GenerateNextCell Loc
    | GenerateFirstCell
    | Move Direction Bool