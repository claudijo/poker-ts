import { SeatIndex } from 'types/seat-index';
import { Chips } from 'types/chips';
import { SeatArray } from 'types/seat-array';
export default class Pot {
    private _eligiblePlayers;
    private _size;
    size(): Chips;
    eligiblePlayers(): SeatIndex[];
    add(amount: Chips): void;
    collectBetsFrom(players: SeatArray): Chips;
}
