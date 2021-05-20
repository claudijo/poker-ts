import assert from 'assert'
import ChipRange from './chip-range'
import { SeatIndex } from 'types/seat-index'
import { Chips } from 'types/chips'
import Round, { Action as RoundAction } from './round'
import { SeatArray } from 'types/seat-array'
import { ActionRange } from 'types/action-range'

// TODO: See https://stackoverflow.com/questions/32509056/can-you-set-a-static-enum-inside-of-a-typescript-class
//  for somewhat more convenient way to export static enum
export enum Action {
    LEAVE,
    MATCH,
    RAISE
}

export default class BettingRound {
    private readonly _players: SeatArray
    private _round: Round
    private _biggestBet: Chips
    private _minRaise: Chips

    constructor(players: SeatArray, firstToAct: SeatIndex, minRaise: Chips, biggestBet: Chips = 0) {
        this._round = new Round(players.map(player => !!player), firstToAct)
        this._players = players
        this._biggestBet = biggestBet
        this._minRaise = minRaise

        assert(firstToAct < players.length, 'Seat index must be in the valid range')
        assert(players[firstToAct], 'First player to act must exist')
    }

    inProgress(): boolean {
        return this._round.inProgress()
    }

    playerToAct(): SeatIndex {
        return this._round.playerToAct()
    }

    biggestBet(): Chips {
        return this._biggestBet
    }

    minRaise(): Chips {
        return this._minRaise
    }

    players(): SeatArray {
        return this._round.activePlayers().map((isActive, index) => {
            return this._players[index] || null
        })
    }

    activePlayers(): Array<boolean> {
        return this._round.activePlayers()
    }

    numActivePlayers(): number {
        return this._round.numActivePlayers()
    }

    legalActions(): ActionRange {
        const player = this._players[this._round.playerToAct()]
        assert(player !== null)
        const playerChips = player.totalChips()
        const canRaise = playerChips > this._biggestBet
        if (canRaise) {
            const minBet = this._biggestBet + this._minRaise
            const raiseRange = new ChipRange(Math.min(minBet, playerChips), playerChips)
            return { canRaise, chipRange: raiseRange }
        } else {
            return { canRaise }
        }
    }

    actionTaken(action: Action, bet: Chips = 0) {
        const player = this._players[this._round.playerToAct()]
        assert(player !== null)
        if (action === Action.RAISE) {
            assert(this.isRaiseValid(bet))
            player.bet(bet)
            this._minRaise = bet - this._biggestBet
            this._biggestBet = bet
            let actionFlag = RoundAction.AGGRESSIVE
            if (player.stack() === 0) {
                actionFlag |= RoundAction.LEAVE
            }
            this._round.actionTaken(actionFlag)
        } else if (action === Action.MATCH) {
            player.bet(Math.min(this._biggestBet, player.totalChips()))
            let actionFlag = RoundAction.PASSIVE
            if (player.stack() === 0) {
                actionFlag |= RoundAction.LEAVE
            }
            this._round.actionTaken(actionFlag)
        } else {
            assert(action === Action.LEAVE)
            this._round.actionTaken(RoundAction.LEAVE)
        }
    }

    private isRaiseValid(bet: Chips): boolean {
        const player = this._players[this._round.playerToAct()]
        assert(player !== null)
        const playerChips = player.stack() + player.betSize()
        const minBet = this._biggestBet + this._minRaise
        if (playerChips > this._biggestBet && playerChips < minBet) {
            return bet === playerChips
        }
        return bet >= minBet && bet <= playerChips
    }
}