module Model exposing (..)

import Character exposing (Character)
import Loc exposing (Loc)
import Structure exposing (Structure)


type Direction
    = Left
    | Right
    | Up
    | Down


type alias ChatMsg =
    { id : String
    , msg : String
    }


type alias Model =
    { grid : List (List Loc)
    , init : { currentY : Int, currentX : Int, maxX : Int, maxY : Int, finished : Bool }
    , characterList : List Character
    , structureList : List Structure
    , playerCharacterId : String
    , chatLog : List ChatMsg
    , chatInput : String
    }


type alias StateEnvelope =
    { grid : List (List Loc)
    , characterList : List Character
    }


type Msg
    = GetPlayerCharacterId String
    | RefreshState StateEnvelope
    | GenerateNextCell Loc
    | GenerateFirstCell
    | AddNewCharacter
    | Move Direction Bool
    | UpdateCharacter Character
    | UpdateCharacterName String
    | InputChat String
    | SendChatMsg
    | ReceiveChatMsg ChatMsg
