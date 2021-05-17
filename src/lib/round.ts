import assert from 'assert';
import {SeatIndex} from 'types/seat-index';

export enum Action {
    LEAVE = 1 << 0,
    PASSIVE = 1 << 1,
    AGGRESSIVE = 1 << 2,
}

export default class Round {
    private readonly _activePlayers: Array<boolean>
    private _playerToAct: SeatIndex
    private _lastAggressiveActor: SeatIndex
    private _contested: boolean = false;
    private _firstAction: boolean = true;
    private _numActivePlayers: number = 0;

    constructor(activePlayers: Array<boolean>, firstToAct: SeatIndex) {
        this._activePlayers = activePlayers
        this._playerToAct = firstToAct;
        this._lastAggressiveActor = firstToAct;
        this._numActivePlayers = activePlayers.filter(player => player).length;

        assert(firstToAct < activePlayers.length)
    }

    activePlayers(): Array<boolean> {
        return this._activePlayers;
    }

    playerToAct(): SeatIndex {
        return this._playerToAct;
    }

    lastAggressiveActor(): SeatIndex {
        return this._lastAggressiveActor;
    }

    numActivePlayers(): number {
        return this._numActivePlayers;
    }

    inProgress(): boolean {
        return (this._contested || this._numActivePlayers > 1) && (this._firstAction || this._playerToAct !== this._lastAggressiveActor);
    }

    actionTaken(action: Action): void {
        assert(this.inProgress())
        assert(!(action & Action.PASSIVE && action & Action.AGGRESSIVE))
        if (this._firstAction) this._firstAction = false;
        // Implication: if there is aggressive action => the next player is contested
        if (action & Action.AGGRESSIVE) {
            this._lastAggressiveActor = this._playerToAct;
            this._contested = true;
        } else if (action & Action.PASSIVE) {
            this._contested = true;
        }
        if (action & Action.LEAVE) {
            this._activePlayers[this._playerToAct] = false;
            --this._numActivePlayers;
        }

        this.incrementPlayer();
    }

    private incrementPlayer(): void {
        do {
            ++this._playerToAct;
            if (this._playerToAct === this._activePlayers.length) this._playerToAct = 0
            if (this._playerToAct === this._lastAggressiveActor) break;
        } while (!this._activePlayers[this._playerToAct])
    }
}

