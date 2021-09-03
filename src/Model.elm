module Model exposing (..)

import Character exposing (Character)
import Loc exposing (Loc)


type Direction
    = Left
    | Right
    | Up
    | Down


type alias Model =
    { grid : List (List Loc)
    , init : { currentY : Int, currentX : Int, maxX : Int, maxY : Int, finished : Bool }
    , characterList : List Character
    , playerCharacterId : Int
    }


type alias StateEnvelope =
    { grid : List (List Loc)
    , characterList : List Character
    }


type Msg
    = RefreshState StateEnvelope
    | GenerateNextCell Loc
    | GenerateFirstCell
    | AddNewCharacter
    | Move Direction Bool
    | UpdateCharacter Character
    | UpdateCharacterName String