import ChipRange from './chip-range';
import { SeatIndex } from 'types/seat-index';
import { Chips } from 'types/chips';
import { SeatArray } from 'types/seat-array';
export declare enum Action {
    LEAVE = 0,
    MATCH = 1,
    RAISE = 2
}
export declare class ActionRange {
    canRaise: boolean;
    chipRange: ChipRange;
    constructor(canRaise: boolean, chipRange?: ChipRange);
}
export default class BettingRound {
    private readonly _players;
    private _round;
    private _biggestBet;
    private _minRaise;
    constructor(players: SeatArray, firstToAct: SeatIndex, minRaise: Chips, biggestBet?: Chips);
    inProgress(): boolean;
    isContested(): boolean;
    playerToAct(): SeatIndex;
    biggestBet(): Chips;
    minRaise(): Chips;
    players(): SeatArray;
    activePlayers(): boolean[];
    numActivePlayers(): number;
    legalActions(): ActionRange;
    actionTaken(action: Action, bet?: Chips): void;
    private isRaiseValid;
}
