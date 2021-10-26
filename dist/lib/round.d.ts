import { SeatIndex } from 'types/seat-index';
export declare enum Action {
    LEAVE = 1,
    PASSIVE = 2,
    AGGRESSIVE = 4
}
export default class Round {
    private readonly _activePlayers;
    private _playerToAct;
    private _lastAggressiveActor;
    private _contested;
    private _firstAction;
    private _numActivePlayers;
    constructor(activePlayers: boolean[], firstToAct: SeatIndex);
    activePlayers(): boolean[];
    playerToAct(): SeatIndex;
    lastAggressiveActor(): SeatIndex;
    numActivePlayers(): number;
    inProgress(): boolean;
    isContested(): boolean;
    actionTaken(action: Action): void;
    private incrementPlayer;
}
