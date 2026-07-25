import Pot from './pot';
import { SeatArray } from 'types/seat-array';
import { SeatIndex } from 'types/seat-index';
export default class PotManager {
    private readonly _pots;
    private _aggregateFoldedBets;
    private _lastPotIsClosed;
    constructor();
    pots(): Pot[];
    betFolded(amount: any): void;
    playerFolded(seat: SeatIndex): void;
    collectBetsForm(players: SeatArray): void;
}
