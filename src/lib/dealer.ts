import { SeatArray } from 'types/seat-array'
import { SeatIndex } from 'types/seat-index'
import ChipRange from './chip-range'
import { Chips } from 'types/chips'
import { ForcedBets } from 'types/forced-bets'
import Deck from './deck'
import CommunityCards, { next, RoundOfBetting } from './community-cards'
import BettingRound, { Action as BettingRoundAction } from './betting-round'
import { HoleCards } from 'types/hole-cards'
import PotManager from './pot-manager'
import assert from 'assert'
import Pot from './pot'
import Hand, { HandRanking } from './hand'
import { findIndexAdjacent, nextOrWrap } from '../util/array'
import Card from './card'

export class ActionRange {
    action: Action = Action.FOLD // You can always fold
    chipRange?: ChipRange

    constructor(chipRange?: ChipRange) {
        this.chipRange = chipRange
    }

    contains(action: Action, bet: Chips = 0): boolean {
        assert(Dealer.isValid(action), 'The action representation must be valid')
        return action && Dealer.isAggressive(action)
            ? this.chipRange?.contains(bet) ?? false
            : true
    }
}

export enum Action {
    FOLD = 1 << 0,
    CHECK = 1 << 1,
    CALL = 1 << 2,
    BET = 1 << 3,
    RAISE = 1 << 4
}

export default class Dealer {
    private readonly _button: SeatIndex = 0
    private readonly _communityCards: CommunityCards
    private readonly _holeCards: HoleCards[]
    private _players: SeatArray
    private _bettingRound: BettingRound | null = null
    private _forcedBets: ForcedBets
    private _deck: Deck
    private _handInProgress: boolean = false
    private _roundOfBetting: RoundOfBetting = RoundOfBetting.PREFLOP
    private _bettingRoundsCompleted: boolean = false
    private _potManager: PotManager
    private _winners: [SeatIndex, Hand, HoleCards][][]

    constructor(players: SeatArray, button: SeatIndex, forcedBets: ForcedBets, deck: Deck, communityCards: CommunityCards, numSeats: number = 9) {
        this._players = players
        this._button = button
        this._forcedBets = forcedBets
        this._deck = deck
        this._communityCards = communityCards
        this._potManager = new PotManager()
        this._holeCards = new Array(numSeats).fill(null)
        this._winners = []

        assert(deck.length === 52, 'Deck must be whole')
        assert(communityCards.cards().length === 0, 'No community cards should have been dealt')
    }

    static isValid(action: Action): boolean {
        // Method for counting bits in a 32-bit integer from https://graphics.stanford.edu/~seander/bithacks.html
        action = action - ((action >> 1) & 0x55555555)
        action = (action & 0x33333333) + ((action >> 2) & 0x33333333)
        const bitCount = ((action + (action >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
        return bitCount === 1
    }

    static isAggressive(action: Action): boolean {
        return !!(action & Action.BET) || !!(action & Action.RAISE)
    }

    handInProgress(): boolean {
        return this._handInProgress
    }

    bettingRoundsCompleted(): boolean {
        assert(this.handInProgress(), 'Hand must be in progress')
        return this._bettingRoundsCompleted
    }

    playerToAct(): SeatIndex {
        assert(this.bettingRoundInProgress(), 'Betting round must be in progress')
        assert(this._bettingRound !== null)
        return this._bettingRound.playerToAct()
    }

    players(): SeatArray {
        return this._bettingRound?.players() ?? []
    }

    // All the players who started in the current betting round
    bettingRoundPlayers(): SeatArray {
        return this._players
    }

    roundOfBetting(): RoundOfBetting {
        assert(this.handInProgress(), 'Hand must be in progress')
        return this._roundOfBetting
    }

    numActivePlayers(): number {
        return this._bettingRound?.numActivePlayers() ?? 0
    }

    biggestBet(): Chips {
        return this._bettingRound?.biggestBet() ?? 0
    }

    bettingRoundInProgress(): boolean {
        return this._bettingRound?.inProgress() ?? false
    }

    isContested(): boolean {
        return this._bettingRound?.isContested() ?? false
    }

    legalActions(): ActionRange {
        assert(this.bettingRoundInProgress(), 'Betting round must be in progress')
        assert(this._bettingRound !== null)
        const player = this._players[this._bettingRound.playerToAct()]
        const actions = this._bettingRound.legalActions()
        const actionRange = new ActionRange(actions.chipRange)

        // Below we take care of differentiating between check/call and bet/raise,
        // which the betting_round treats as just "match" and "raise".
        assert(player !== null)
        if (this._bettingRound.biggestBet() - player.betSize() === 0) {
            actionRange.action |= Action.CHECK
            assert(actions.canRaise) // If you can check, you can always bet or raise.

            // If this guy can check, with his existing bet_size, he is the big blind.
            if (player.betSize() > 0) {
                actionRange.action |= Action.RAISE
            } else {
                actionRange.action |= Action.BET
            }
        } else {
            actionRange.action |= Action.CALL

            // If you can call, you may or may not be able to raise.
            if (actions.canRaise) {
                actionRange.action |= Action.RAISE
            }
        }

        return actionRange
    }

    pots(): Pot[] {
        assert(this.handInProgress(), 'Hand must be in progress')
        return this._potManager.pots()
    }

    button(): SeatIndex {
        return this._button
    }

    holeCards(): HoleCards[] {
        assert(this.handInProgress() || this.bettingRoundInProgress(), 'Hand must be in progress or showdown must have ended')
        return this._holeCards
    }

    startHand(): void {
        assert(!this.handInProgress(), 'Hand must not be in progress')
        this._bettingRoundsCompleted = false
        this._roundOfBetting = RoundOfBetting.PREFLOP
        this._winners = []
        this.collectAnte()
        const firstAction = this.nextOrWrap(this.postBlinds())
        this.dealHoleCards()
        if (this._players.filter(player => player !== null && player.stack() !== 0).length > 1) {
            this._bettingRound = new BettingRound([...this._players], firstAction, this._forcedBets.blinds.big, this._forcedBets.blinds.big)
        }
        this._handInProgress = true
    }

    actionTaken(action: Action, bet?: Chips): void {
        assert(this.bettingRoundInProgress(), 'Betting round must be in progress')
        assert(this.legalActions().contains(action, bet), 'Action must be legal')
        assert(this._bettingRound !== null)

        if (action & Action.CHECK || action & Action.CALL) {
            this._bettingRound.actionTaken(BettingRoundAction.MATCH)
        } else if (action & Action.BET || action & Action.RAISE) {
            this._bettingRound.actionTaken(BettingRoundAction.RAISE, bet)
        } else {
            assert(action & Action.FOLD)
            const foldingPlayer = this._players[this.playerToAct()]
            assert(foldingPlayer !== null)
            this._potManager.betFolded(foldingPlayer.betSize())
            foldingPlayer.takeFromBet(foldingPlayer.betSize())
            this._players[this.playerToAct()] = null
            this._bettingRound.actionTaken(BettingRoundAction.LEAVE)
        }
    }

    endBettingRound(): void {
        assert(!this._bettingRoundsCompleted, 'Betting rounds must not be completed')
        assert(!this.bettingRoundInProgress(), 'Betting round must not be in progress')

        this._potManager.collectBetsForm(this._players)
        if ((this._bettingRound?.numActivePlayers() ?? 0) <= 1) {
            this._roundOfBetting = RoundOfBetting.RIVER
            // If there is only one pot, and there is only one player in it...
            if (this._potManager.pots().length === 1 && this._potManager.pots()[0].eligiblePlayers().length === 1) {
                // ...there is no need to deal the undealt community cards.
            } else {
                this.dealCommunityCards()
            }
            this._bettingRoundsCompleted = true
            // Now you call showdown()
        } else if (this._roundOfBetting < RoundOfBetting.RIVER) {
            // Start the next betting round.
            this._roundOfBetting = next(this._roundOfBetting)
            this._players = this._bettingRound?.players() ?? []
            this._bettingRound = new BettingRound([...this._players], this.nextOrWrap(this._button), this._forcedBets.blinds.big)
            this.dealCommunityCards()
            assert(this._bettingRoundsCompleted === false)
        } else {
            assert(this._roundOfBetting === RoundOfBetting.RIVER)
            this._bettingRoundsCompleted = true
            // Now you call showdown()
        }
    }

    winners(): [SeatIndex, Hand, HoleCards][][] {
        assert(!this.handInProgress(), 'Hand must not be in progress')

        return this._winners
    }

    showdown(): void {
        assert(this._roundOfBetting === RoundOfBetting.RIVER, 'Round of betting must be river')
        assert(!this.bettingRoundInProgress(), 'Betting round must not be in progress')
        assert(this.bettingRoundsCompleted(), 'Betting rounds must be completed')

        this._handInProgress = false
        if (this._potManager.pots().length === 1 && this._potManager.pots()[0].eligiblePlayers().length === 1) {
            // No need to evaluate the hand. There is only one player.
            const index = this._potManager.pots()[0].eligiblePlayers()[0]
            const player = this._players[index]
            assert(player !== null)
            player.addToStack(this._potManager.pots()[0].size())
            return

            // TODO: Also, no reveals in this case. Reveals are only necessary when there is >=2 players.
        }

        for (const pot of this._potManager.pots()) {
            const playerResults: [SeatIndex, Hand][] = pot.eligiblePlayers().map(seatIndex => {
                return [seatIndex, Hand.create(this._holeCards[seatIndex], this._communityCards)]
            })

            playerResults.sort(([, first], [, second]) => Hand.compare(first, second))

            const lastWinnerIndex = findIndexAdjacent(playerResults, ([, first], [, second]) => {
                return Hand.compare(first, second) !== 0
            })
            const numberOfWinners = lastWinnerIndex === -1 ? 1 : lastWinnerIndex + 1
            let oddChips = pot.size() % numberOfWinners
            const payout = (pot.size() - oddChips) / numberOfWinners
            const winningPlayerResults = playerResults.slice(0, numberOfWinners)

            winningPlayerResults.forEach((playerResult: [SeatIndex, Hand]) => {
                const [seatIndex] = playerResult
                this._players[seatIndex]?.addToStack(payout)
            })

            this._winners.push(winningPlayerResults.map((playerResult: [SeatIndex, Hand]) => {
                const [seatIndex] = playerResult
                const holeCards = this._holeCards[seatIndex];

                return [...playerResult, holeCards];
            }))

            if (oddChips !== 0) {
                // Distribute the odd chips to the first players, counting clockwise, after the dealer button
                const winners: SeatArray = new Array(this._players.length).fill(null)
                winningPlayerResults.forEach((playerResult: [SeatIndex, Hand]) => {
                    const [seatIndex] = playerResult
                    winners[seatIndex] = this._players[seatIndex]
                })

                let seat = this._button
                while (oddChips !== 0) {
                    seat = nextOrWrap(winners, seat)
                    const winner = winners[seat]
                    assert(winner !== null)
                    winner.addToStack(1)
                    oddChips--
                }
            }
        }
    }

    private nextOrWrap(seat: SeatIndex): SeatIndex {
        return nextOrWrap(this._players, seat)
    }

    private collectAnte(): void {
        if (this._forcedBets.ante === undefined) {
            return
        }

        // Any ante goes into the pot
        let total = 0
        for (const player of this._players) {
            if (player !== null) {
                const ante = Math.min(this._forcedBets.ante, player.totalChips())
                player.takeFromStack(ante)
                total += ante
            }
        }

        this._potManager.pots()[0].add(total)
    }

    private postBlinds(): SeatIndex {
        let seat = this._button
        const numPlayers = this._players.filter(player => player !== null).length
        if (numPlayers !== 2) {
            seat = this.nextOrWrap(seat)
        }
        const smallBlind = this._players[seat]
        assert(smallBlind !== null)
        smallBlind.bet(Math.min(this._forcedBets.blinds.small, smallBlind.totalChips()))
        seat = this.nextOrWrap(seat)
        const bigBlind = this._players[seat]
        assert(bigBlind !== null)
        bigBlind.bet(Math.min(this._forcedBets.blinds.big, bigBlind.totalChips()))
        return seat
    }

    private dealHoleCards(): void {
        this._players.forEach((player, index) => {
            if (player !== null) {
                this._holeCards[index] = [this._deck.draw(), this._deck.draw()]
            }
        })
    }

    // Deals community cards up until the current round of betting.
    private dealCommunityCards(): void {
        const cards: Card[] = []
        const numCardsToDeal = this._roundOfBetting - this._communityCards.cards().length
        for (let index = 0; index < numCardsToDeal; index++) {
            cards.push(this._deck.draw())
        }
        this._communityCards.deal(cards)
    }
}