import { SeatArray } from 'types/seat-array'
import { SeatIndex } from 'types/seat-index'
import { ForcedBets } from 'types/forced-bets'
import Deck from './deck'
import CommunityCards, { RoundOfBetting } from './community-cards'
import Dealer, { Action, ActionRange } from './dealer'
import assert from 'assert'
import Pot from './pot'
import { HoleCards } from 'types/hole-cards'
import { Chips } from 'types/chips'
import { bitCount } from '../util/bit'
import Player from './player'

export enum AutomaticAction {
    FOLD = 1 << 0,
    CHECK_FOLD = 1 << 1,
    CHECK = 1 << 2,
    CALL = 1 << 3,
    CALL_ANY = 1 << 4,
    ALL_IN = 1 << 5
}

export default class Table {
    private readonly _numSeats: number
    private readonly _tablePlayers: SeatArray // All the players physically present at the table
    private readonly _deck: Deck
    private _handPlayers?: SeatArray
    private _automaticActions?: (AutomaticAction | null)[]
    private _firstTimeButton = true
    private _buttonSetManually = false // has the button been set manually
    private _button: SeatIndex = 0
    private _forcedBets: ForcedBets
    private _communityCards?: CommunityCards
    private _dealer?: Dealer
    private _staged: boolean[] // All players who took a seat or stood up before the .start_hand()

    constructor(forcedBets: ForcedBets, numSeats = 9) {
        assert(numSeats <= 23, 'Maximum 23 players')

        this._numSeats = numSeats
        this._forcedBets = forcedBets
        this._tablePlayers = new Array(numSeats).fill(null)
        this._staged = new Array(numSeats).fill(false)
        this._deck = new Deck()
    }

    playerToAct(): SeatIndex {
        assert(this.bettingRoundInProgress(), 'Betting round must be in progress')
        assert(this._dealer !== undefined)

        return this._dealer.playerToAct()
    }

    button(): SeatIndex {
        assert(this.handInProgress(), 'Hand must be in progress')
        assert(this._dealer !== undefined)

        return this._dealer.button()
    }

    seats(): SeatArray {
        return this._tablePlayers
    }

    handPlayers(): SeatArray {
        assert(this.handInProgress(), 'Hand must be in progress')
        assert(this._dealer !== undefined)

        return this._dealer.players()
    }

    numActivePlayers(): number {
        assert(this.handInProgress(), 'Hand must be in progress')
        assert(this._dealer !== undefined)

        return this._dealer.numActivePlayers()
    }

    pots(): Pot[] {
        assert(this.handInProgress(), 'Hand must be in progress')
        assert(this._dealer !== undefined)

        return this._dealer.pots()
    }

    forcedBets(): ForcedBets {
        return this._forcedBets
    }

    setForcedBets(forcedBets: ForcedBets): void {
        assert(!this.handInProgress(), 'Hand must not be in progress')

        this._forcedBets = forcedBets
    }

    numSeats(): number {
        return this._numSeats
    }

    startHand(seat?: number): void {
        assert(!this.handInProgress(), 'Hand must not be in progress')
        assert(
            this._tablePlayers.filter(player => player !== null).length >= 2,
            'There must be at least 2 players at the table',
        )

        if (seat !== undefined) {
            this._button = seat
            this._buttonSetManually = true
        }

        this._staged = new Array(this._numSeats).fill(false)
        this._automaticActions = new Array(this._numSeats).fill(null)
        this._handPlayers = this._tablePlayers.map(player => player ? new Player(player) : null)
        this.incrementButton()
        this._deck.fillAndShuffle()
        this._communityCards = new CommunityCards()
        this._dealer = new Dealer(this._handPlayers, this._button, this._forcedBets, this._deck, this._communityCards)
        this._dealer.startHand()
        this.updateTablePlayers()
    }

    handInProgress(): boolean {
        return this._dealer?.handInProgress() ?? false
    }

    bettingRoundInProgress(): boolean {
        assert(this.handInProgress(), 'Hand must be in progress')
        assert(this._dealer !== undefined)

        return this._dealer.bettingRoundInProgress()
    }

    bettingRoundsCompleted(): boolean {
        assert(this.handInProgress(), 'Hand must be in progress')
        assert(this._dealer !== undefined)

        return this._dealer.bettingRoundsCompleted()
    }

    roundOfBetting(): RoundOfBetting {
        assert(this.handInProgress(), 'Hand must be in progress')
        assert(this._dealer !== undefined)

        return this._dealer.roundOfBetting()
    }

    communityCards(): CommunityCards {
        assert(this.handInProgress(), 'Hand must be in progress')
        assert(this._communityCards !== undefined)

        return this._communityCards
    }

    legalActions(): ActionRange {
        assert(this.bettingRoundInProgress(), 'Betting round must be in progress')
        assert(this._dealer !== undefined)

        return this._dealer.legalActions()
    }

    holeCards(): (HoleCards | null)[] {
        assert(this.handInProgress() || this.bettingRoundsCompleted(), 'Hand must be in progress or showdown must have ended')
        assert(this._dealer !== undefined)

        return this._dealer.holeCards()
    }

    actionTaken(action: Action, bet?: Chips): void {
        assert(this.bettingRoundInProgress(), 'Betting round must be in progress')
        assert(this._dealer !== undefined)
        assert(this._automaticActions !== undefined)

        this._dealer.actionTaken(action, bet)
        while (this._dealer.bettingRoundInProgress()) {
            this.amendAutomaticActions()

            const playerToAct = this.playerToAct()
            const automaticAction = this._automaticActions[playerToAct]
            if (automaticAction !== null) {
                this.takeAutomaticAction(automaticAction)
                this._automaticActions[playerToAct] = null
            } else {
                break
            }
        }

        if (this.bettingRoundInProgress() && this.singleActivePlayerRemaining()) {
            // We only need to take action for this one player, and the other automatic actions will unfold automatically.
            this.actPassively()
        }

        this.updateTablePlayers()
    }

    endBettingRound() {
        assert(!this.bettingRoundInProgress(), 'Betting round must not be in progress')
        assert(!this.bettingRoundsCompleted(), 'Betting rounds must not be completed')
        assert(this._dealer !== undefined)

        this._dealer.endBettingRound()
        this.amendAutomaticActions()
        this.updateTablePlayers()
    }

    showdown(): void {
        assert(!this.bettingRoundInProgress(), 'Betting round must not be in progress')
        assert(this.bettingRoundsCompleted(), 'Betting rounds must be completed')
        assert(this._dealer !== undefined)

        this._dealer.showdown()
        this.updateTablePlayers()
        this.standUpBustedPlayers()
    }

    automaticActions(): (AutomaticAction | null)[] {
        assert(this.handInProgress(), 'Hand must be in progress')
        assert(this._automaticActions !== undefined)

        return this._automaticActions
    }

    canSetAutomaticAction(seat: SeatIndex): boolean {
        assert(this.bettingRoundInProgress(), 'Betting round must be in progress')
        assert(this._staged !== undefined)

        // (1) This is only ever true for players that have been in the hand since the start.
        // Every following sit-down is accompanied by a _staged[s] = true
        // (2) If a player is not seated at the table, he obviously cannot set his automatic actions.
        return !this._staged[seat] && this._tablePlayers[seat] !== null
    }

    legalAutomaticActions(seat: SeatIndex): AutomaticAction {
        assert(this.canSetAutomaticAction(seat), 'Player must be allowed to set automatic actions')
        assert(this._dealer !== undefined)
        // fold, all_in -- always viable
        // check, check_fold -- viable when biggest_bet - bet_size == 0
        // call -- when biggest_bet - bet_size > 0 ("else" of the previous case)
        // call_only -- available always except when biggest_bet >= total_chips (no choice/"any" then)
        //
        // fallbacks:
        // check_fold -> fold
        // check -> nullopt
        // call_any -> check
        const biggestBet = this._dealer.biggestBet()
        const player = this._tablePlayers[seat]
        assert(player !== null)
        const betSize = player.betSize()
        const totalChips = player.totalChips()
        let legalActions = AutomaticAction.FOLD | AutomaticAction.ALL_IN
        const canCheck = biggestBet - betSize === 0
        if (canCheck) {
            legalActions |= AutomaticAction.CHECK_FOLD | AutomaticAction.CHECK
        } else {
            legalActions |= AutomaticAction.CALL
        }

        if (biggestBet < totalChips) {
            legalActions |= AutomaticAction.CALL_ANY
        }

        return legalActions
    }

    setAutomaticAction(seat: SeatIndex, action: AutomaticAction) {
        assert(this.canSetAutomaticAction(seat), 'Player must be allowed to set automatic actions')
        assert(seat !== this.playerToAct(), 'Player must not be the player to act')
        assert(bitCount(action) === 1, 'Player must pick one automatic action')
        assert(action & this.legalAutomaticActions(seat), 'Given automatic action must be legal')
        assert(this._automaticActions !== undefined)

        this._automaticActions[seat] = action
    }

    sitDown(seat: SeatIndex, buyIn: Chips): void {
        assert(seat < this._numSeats && seat >= 0, 'Given seat index must be valid')
        assert(this._tablePlayers[seat] === null, 'Given seat must not be occupied')

        this._tablePlayers[seat] = new Player(buyIn)
        this._staged[seat] = true
    }

    standUp(seat: SeatIndex): void {
        assert(seat < this._numSeats && seat >= 0, 'Given seat index must be valid')
        assert(this._tablePlayers[seat] !== null, 'Given seat must be occupied')

        if (this.handInProgress()) {
            assert(this.bettingRoundInProgress())
            assert(this._handPlayers !== undefined)
            if (seat === this.playerToAct()) {
                this.actionTaken(Action.FOLD)
                this._tablePlayers[seat] = null
                this._staged[seat] = true
            } else if (this._handPlayers[seat] !== null) {
                this.setAutomaticAction(seat, AutomaticAction.FOLD)
                this._tablePlayers[seat] = null
                this._staged[seat] = true

                if (this.singleActivePlayerRemaining()) {
                    // We only need to take action for this one player, and the other automatic actions will unfold automatically.
                    this.actPassively()
                }
            }
        } else {
            this._tablePlayers[seat] = null
        }
    }

    private takeAutomaticAction(automaticAction: AutomaticAction): void {
        assert(this._dealer !== undefined)
        assert(this._handPlayers !== undefined)
        const player = this._handPlayers[this._dealer.playerToAct()]
        assert(player !== null)
        const biggestBet = this._dealer.biggestBet()
        const betGap = biggestBet - player.betSize()
        const totalChips = player.totalChips()
        switch (automaticAction) {
            case AutomaticAction.FOLD:
                return this._dealer.actionTaken(Action.FOLD)
            case AutomaticAction.CHECK_FOLD:
                return this._dealer.actionTaken(betGap === 0 ? Action.CHECK : Action.FOLD)
            case AutomaticAction.CHECK:
                return this._dealer.actionTaken(Action.CHECK)
            case AutomaticAction.CALL:
                return this._dealer.actionTaken(Action.CALL)
            case AutomaticAction.CALL_ANY:
                return this._dealer.actionTaken(betGap === 0 ? Action.CHECK : Action.CALL)
            case AutomaticAction.ALL_IN:
                if (totalChips < biggestBet) {
                    return this._dealer.actionTaken(Action.CALL)
                }
                return this._dealer.actionTaken(Action.RAISE, totalChips)
            default:
                assert(false)
        }
    }

    // fold, all_in -- no need to fallback, always legal
    // check_fold, check -- (if the bet_gap becomes >0 then check is no longer legal)
    // call -- you cannot lose your ability to call if you were able to do it in the first place
    // call_any -- you can lose your ability to call_any, which only leaves the normal call (doubt cleared)
    //          condition: biggest_bet >= total_chips
    private amendAutomaticActions(): void {
        assert(this._dealer !== undefined)
        assert(this._automaticActions !== undefined)
        assert(this._handPlayers !== undefined)

        const biggestBet = this._dealer.biggestBet()
        for (let s = 0; s < this._numSeats; s++) {
            const automaticAction = this._automaticActions[s]
            if (automaticAction !== null) {
                const player = this._handPlayers[s]
                assert(player !== null)
                const isContested = this._dealer.isContested()
                const betGap = biggestBet - player.betSize()
                const totalChips = player.totalChips()
                if (automaticAction & AutomaticAction.CHECK_FOLD && betGap > 0) {
                    this._automaticActions[s] = AutomaticAction.FOLD
                } else if (automaticAction & AutomaticAction.CHECK && betGap > 0) {
                    this._automaticActions[s] = null
                }/* else if (automaticAction & AutomaticAction.CALL && isContested) {
                    this._automaticActions[s] = null
                }*/ else if (automaticAction & AutomaticAction.CALL_ANY && biggestBet >= totalChips) {
                    this._automaticActions[s] = AutomaticAction.CALL
                }
            }
        }
    }

    // Make the current player act passively:
    // - check if possible or;
    // - call if possible.
    private actPassively(): void {
        assert(this._dealer !== undefined)
        const legalActions = this._dealer.legalActions()
        if (legalActions.action & Action.BET) {
            this.actionTaken(Action.CHECK)
        } else {
            assert(legalActions.action & Action.CALL)
            this.actionTaken(Action.CALL)
        }
    }

    private incrementButton(): void {
        assert(this._handPlayers !== undefined)

        if (this._buttonSetManually) {
            this._buttonSetManually = false
            this._firstTimeButton = false
        } else if (this._firstTimeButton) {
            const seat = this._handPlayers.findIndex(player => player !== null)
            assert(seat !== -1)
            this._button = seat
            this._firstTimeButton = false
        } else {
            const offset = this._button + 1
            const seat = this._handPlayers.slice(offset).findIndex(player => player !== null)
            this._button = seat !== -1
                ? seat + offset
                : this._handPlayers.findIndex(player => player !== null)
        }
    }

    private updateTablePlayers(): void {
        assert(this._handPlayers !== undefined)
        for (let s = 0; s < this._numSeats; s++) {
            if (!this._staged[s] && this._handPlayers[s] !== null) {
                assert(this._tablePlayers[s] !== null)
                const handPlayer = this._handPlayers[s]
                if (handPlayer !== null) {
                    this._tablePlayers[s] = new Player(handPlayer)
                }
            }
        }
    }

    // A player is considered active (in class table context) if
    // he started in the current betting round, has not stood up or folded.
    private singleActivePlayerRemaining(): boolean {
        assert(this.bettingRoundInProgress())
        assert(this._dealer !== undefined)

        // What dealer::betting_round_players filter returns is all the players
        // who started the current betting round and have not folded. Players who
        // actually fold are manually discarded internally (to help with pot evaluation).
        const bettingRoundPlayers = this._dealer.bettingRoundPlayers()
        const activePlayers = bettingRoundPlayers.filter((player, index) => {
            return player !== null && !this._staged[index]
        })

        return activePlayers.length === 1
    }

    private standUpBustedPlayers(): void {
        assert(!this.handInProgress())
        for (let s = 0; s < this._numSeats; s++) {
            const player = this._tablePlayers[s]
            if (player !== null && player.totalChips() === 0) {
                this._tablePlayers[s] = null
            }
        }
    }
}