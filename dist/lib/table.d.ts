import { SeatArray } from 'types/seat-array';
import { SeatIndex } from 'types/seat-index';
import { ForcedBets } from 'types/forced-bets';
import CommunityCards, { RoundOfBetting } from './community-cards';
import { Action, ActionRange } from './dealer';
import Pot from './pot';
import { HoleCards } from 'types/hole-cards';
import { Chips } from 'types/chips';
import Hand from './hand';
export declare enum AutomaticAction {
    FOLD = 1,
    CHECK_FOLD = 2,
    CHECK = 4,
    CALL = 8,
    CALL_ANY = 16,
    ALL_IN = 32
}
export default class Table {
    private readonly _numSeats;
    private readonly _tablePlayers;
    private readonly _deck;
    private _handPlayers?;
    private _automaticActions?;
    private _firstTimeButton;
    private _buttonSetManually;
    private _button;
    private _forcedBets;
    private _communityCards?;
    private _dealer?;
    private _staged;
    constructor(forcedBets: ForcedBets, numSeats?: number);
    playerToAct(): SeatIndex;
    button(): SeatIndex;
    seats(): SeatArray;
    handPlayers(): SeatArray;
    numActivePlayers(): number;
    pots(): Pot[];
    forcedBets(): ForcedBets;
    setForcedBets(forcedBets: ForcedBets): void;
    numSeats(): number;
    startHand(seat?: number): void;
    handInProgress(): boolean;
    bettingRoundInProgress(): boolean;
    bettingRoundsCompleted(): boolean;
    roundOfBetting(): RoundOfBetting;
    communityCards(): CommunityCards;
    legalActions(): ActionRange;
    holeCards(): (HoleCards | null)[];
    actionTaken(action: Action, bet?: Chips): void;
    endBettingRound(): void;
    showdown(): void;
    winners(): [SeatIndex, Hand, HoleCards][][];
    automaticActions(): (AutomaticAction | null)[];
    canSetAutomaticAction(seat: SeatIndex): boolean;
    legalAutomaticActions(seat: SeatIndex): AutomaticAction;
    setAutomaticAction(seat: SeatIndex, action: AutomaticAction | null): void;
    sitDown(seat: SeatIndex, buyIn: Chips): void;
    standUp(seat: SeatIndex): void;
    private takeAutomaticAction;
    private amendAutomaticActions;
    private actPassively;
    private incrementButton;
    private clearFoldedBets;
    private updateTablePlayers;
    private singleActivePlayerRemaining;
    private standUpBustedPlayers;
}
