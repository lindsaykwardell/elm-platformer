module Character exposing (..)

import Loc exposing (Loc)


type Direction
    = Left
    | Right
    | Up
    | Down


type alias Character =
    { id : String
    , name : String
    , color : String
    , loc : Loc
    , direction : String
    }


currentLoc : List Character -> String -> Loc
currentLoc characterList id =
    case characterList of
        [] ->
            { x = -1, y = -1 }

        x :: xs ->
            if id == x.id then
                x.loc

            else
                currentLoc xs id


inLoc : List Character -> Loc -> Character
inLoc characterList loc =
    case characterList of
        [] ->
            { id = "", name = "", color = "", loc = { x = -1, y = -1 }, direction = "Down" }

        x :: xs ->
            if x.loc == loc then
                x

            else
                inLoc xs loc


getCharacter : List Character -> String -> Character
getCharacter characterList id =
    case characterList of
        [] ->
            { id = "", name = "", color = "", loc = { x = -1, y = -1 }, direction = "Down" }

        x :: xs ->
            if id == x.id then
                x

            else
                getCharacter xs id


hasCharacter : List Character -> Loc -> Bool
hasCharacter characterList loc =
    case characterList of
        [] ->
            False

        x :: xs ->
            if x.loc == loc then
                True

            else
                hasCharacter xs loc
