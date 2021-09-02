module Character exposing (..)

import Loc exposing (Loc)


type alias Character =
    { id : Int
    , name : String
    , color : String
    , loc : Loc
    }


currentLoc : List Character -> Int -> Loc
currentLoc characterList id =
    case characterList of
        [] ->
            { x = -1, y = -1 }

        x :: xs ->
            if id == x.id then
                x.loc

            else
                currentLoc xs id


getCharacter : List Character -> Int -> Character
getCharacter characterList id =
    case characterList of
        [] ->
            { id = -1, name = "", color = "", loc = { x = -1, y = -1 } }

        x :: xs ->
            if id == x.id then
                x

            else
                getCharacter xs id
