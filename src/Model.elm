module Model exposing (..)

import Loc exposing (Loc)
import Character exposing (Character)


type Direction
    = Left
    | Right
    | Up
    | Down


type alias Model =
    { grid : List (List Loc)
    , init : { currentY : Int, currentX : Int, maxX : Int, maxY : Int, finished : Bool }
    , characterList: List Character
    , playerCharacterId: Int
    }


type Msg
    = NoOp
    | GenerateNextCell Loc
    | GenerateFirstCell
    | Move Direction Bool
