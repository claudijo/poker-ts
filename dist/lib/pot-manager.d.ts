import Pot from './pot';
import { SeatArray } from 'types/seat-array';
export default class PotManager {
    private readonly _pots;
    private _aggregateFoldedBets;
    constructor();
    pots(): Pot[];
    betFolded(amount: any): void;
    collectBetsForm(players: SeatArray): void;
}
