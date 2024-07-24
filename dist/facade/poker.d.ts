import ChipRange from '../lib/chip-range';
import { SeatIndex } from 'types/seat-index';
import { HandRanking } from '../lib/hand';
export declare type Card = {
    rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
    suit: 'clubs' | 'diamonds' | 'hearts' | 'spades';
};
export declare type AutomaticAction = 'fold' | 'check/fold' | 'check' | 'call' | 'call any' | 'all-in';
export declare type Action = 'fold' | 'check' | 'call' | 'bet' | 'raise';
export default class Poker {
    private _table;
    constructor(forcedBets: {
        ante?: number;
        bigBlind: number;
        smallBlind: number;
    }, numSeats?: number);
    playerToAct(): number;
    button(): number;
    seats(): ({
        totalChips: number;
        stack: number;
        betSize: number;
    } | null)[];
    handPlayers(): ({
        totalChips: number;
        stack: number;
        betSize: number;
    } | null)[];
    numActivePlayers(): number;
    pots(): {
        size: number;
        eligiblePlayers: number[];
    }[];
    forcedBets(): {
        ante: number;
        bigBlind: number;
        smallBlind: number;
    };
    setForcedBets(forcedBets: {
        ante?: number;
        bigBlind: number;
        smallBlind: number;
    }): void;
    numSeats(): number;
    startHand(): void;
    isHandInProgress(): boolean;
    isBettingRoundInProgress(): boolean;
    areBettingRoundsCompleted(): boolean;
    roundOfBetting(): 'preflop' | 'flop' | 'turn' | 'river';
    communityCards(): Card[];
    legalActions(): {
        actions: Action[];
        chipRange?: ChipRange;
    };
    holeCards(): (Card[] | null)[];
    actionTaken(action: 'fold' | 'check' | 'call' | 'bet' | 'raise', betSize?: number): void;
    endBettingRound(): void;
    showdown(): void;
    winners(): [SeatIndex, {
        cards: Card[];
        ranking: HandRanking;
        strength: number;
    }, Card[]][][];
    automaticActions(): (AutomaticAction | null)[];
    canSetAutomaticActions(seatIndex: number): boolean;
    legalAutomaticActions(seatIndex: number): AutomaticAction[];
    setAutomaticAction(seatIndex: number, action: AutomaticAction | null): void;
    sitDown(seatIndex: number, buyIn: number): void;
    standUp(seatIndex: number): void;
}
