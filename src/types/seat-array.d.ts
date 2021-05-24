import Player from "../lib/player";

export type SeatArray = Array<Player | null>

// TODO: Make class of this, including following functionality
/*

// Get first index of not null player
auto seat = seat_index{_hand_players.begin().index()};

// Iterate non null players with optional start index
auto it = seat_array::iterator{_hand_players, _button};
        ++it;
        if (it.index() == num_seats) {
            _button = _hand_players.begin().index();
        } else {
            _button = it.index();
        }
 */