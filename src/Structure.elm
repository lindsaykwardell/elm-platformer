module Structure exposing (..)

import Loc exposing (Loc)


type alias Structure =
    { name : String
    , startLoc : Loc
    , endLoc : Loc
    }


existsInLoc : List Structure -> Loc -> Bool
existsInLoc structureList loc =
    case structureList of
        [] ->
            False

        x :: xs ->
            if (x.startLoc.x <= loc.x && loc.x <= x.endLoc.x) && (x.startLoc.y <= loc.y && loc.y <= x.endLoc.y) then
                True

            else
                existsInLoc xs loc
