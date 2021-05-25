// Facade for the Table class that confirms with the API of https://github.com/JankoDedic/poker.js
import Table, { AutomaticAction as AutomaticActionFlag } from '../lib/table'
import { RoundOfBetting } from '../lib/community-cards'
import { CardRank, CardSuit } from '../lib/card'
import { Action } from '../lib/dealer'

type Card = {
    rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A'
    suit: 'clubs' | 'diamonds' | 'hearts' | 'spades'
}

type AutomaticAction = 'fold' | 'check/fold' | 'check' | 'call' | 'call any' | 'all-in'

const cardMapper: (card: { rank: CardRank, suit: CardSuit }) => Card = card => ({
    // @ts-ignore
    rank: CardRank[card.rank].replace(/^_/, ''),
    // @ts-ignore
    suit: CardSuit[card.suit].toLowerCase(),
})

const seatArrayMapper = player => player === null
    ? null
    : {
        totalChips: player.totalChips(),
        stack: player.stack(),
        betSize: player.betSize(),
    }

const automaticActionFlagToStringArray = (automaticActionFlag: AutomaticActionFlag): Array<AutomaticAction> => {
    const automaticActions: Array<AutomaticAction> = []
    if (automaticActionFlag & AutomaticActionFlag.FOLD) automaticActions.push('fold')
    if (automaticActionFlag & AutomaticActionFlag.CHECK_FOLD) automaticActions.push('check/fold')
    if (automaticActionFlag & AutomaticActionFlag.CHECK) automaticActions.push('check')
    if (automaticActionFlag & AutomaticActionFlag.CALL) automaticActions.push('call')
    if (automaticActionFlag & AutomaticActionFlag.CALL_ANY) automaticActions.push('call any')
    if (automaticActionFlag & AutomaticActionFlag.ALL_IN) automaticActions.push('all-in')
    return automaticActions
}

const stringToAutomaticActionFlag = (automaticAction: AutomaticAction): AutomaticActionFlag => {
    switch (automaticAction) {
        case 'fold':
            return AutomaticActionFlag.FOLD
        case 'check/fold':
            return AutomaticActionFlag.CHECK_FOLD
        case 'check':
            return AutomaticActionFlag.CHECK
        case 'call':
            return AutomaticActionFlag.CALL
        case 'call any':
            return AutomaticActionFlag.CALL_ANY
        case 'all-in':
            return AutomaticActionFlag.ALL_IN
    }
}

export default class Poker {
    private _table: Table

    constructor(forcedBets: { ante?: number, bigBlind: number, smallBlind: number }, numSeats?: number) {
        const { ante, bigBlind: big, smallBlind: small } = forcedBets
        this._table = new Table({ ante, blinds: { big, small } }, numSeats)
    }

    playerToAct(): number {
        return this._table.playerToAct()
    }

    button(): number {
        return this._table.button()
    }

    seats(): Array<{ totalChips: number, stack: number, betSize: number } | null> {
        return this._table.seats().map(seatArrayMapper)
    }

    handPlayers(): Array<{ totalChips: number, stack: number, betSize: number } | null> {
        return this._table.handPlayers().map(seatArrayMapper)
    }

    numActivePlayers(): number {
        return this._table.numActivePlayers()
    }

    pots(): Array<{ size: number, eligiblePlayers: Array<number> }> {
        return this._table.pots().map(pot => ({
            size: pot.size(),
            eligiblePlayers: pot.eligiblePlayers(),
        }))
    }

    forcedBets(): { ante: number, bigBlind: number, smallBlind: number } {
        const { ante = 0, blinds: { big: bigBlind, small: smallBlind } } = this._table.forcedBets()
        return {
            ante,
            smallBlind,
            bigBlind,
        }
    }

    setForcedBets(forcedBets: { ante?: number, bigBlind: number, smallBlind: number }): void {
        const { ante, bigBlind: big, smallBlind: small } = forcedBets
        this._table.setForcedBets({ ante, blinds: { small, big } })
    }

    numSeats(): number {
        return this._table.numSeats()
    }

    startHand(): void {
        this._table.startHand()
    }

    handInProgress(): boolean {
        return this._table.handInProgress()
    }

    bettingRoundInProgress(): boolean {
        return this._table.bettingRoundInProgress()
    }

    bettingRoundsCompleted(): boolean {
        return this._table.bettingRoundsCompleted()
    }

    roundOfBetting(): 'preflop' | 'flop' | 'turn' | 'river' {
        const rob = this._table.roundOfBetting()
        // @ts-ignore
        return RoundOfBetting[rob].toLowerCase()
    }

    communityCards(): Array<Card> {
        return this._table.communityCards().cards().map(cardMapper)
    }

    holeCards(): Array<Array<Card> | null> {
        return this._table.holeCards().map(cards => {
            return cards === null
                ? null
                : cards.map(cardMapper)
        })
    }

    actionTaken(action: 'fold' | 'check' | 'call' | 'bet' | ' raise', betSize?: number) {
        this._table.actionTaken(Action[action.toUpperCase()], betSize)
    }

    endBettingRound(): void {
        this._table.endBettingRound()
    }

    showdown(): void {
        this._table.showdown()
    }

    automaticActions(): any {
        return this._table.automaticActions().map(action => {
            return action === null
                ? null
                : automaticActionFlagToStringArray(action)[0]
        })
    }

    canSetAutomaticAction(seatIndex: number): boolean {
        return this._table.canSetAutomaticAction(seatIndex)
    }

    legalAutomaticAction(seatIndex: number): Array<AutomaticAction> {
        const automaticActionFlag = this._table.legalAutomaticActions(seatIndex)
        return automaticActionFlagToStringArray(automaticActionFlag)
    }

    setAutomaticAction(seatIndex: number, action: AutomaticAction): void {
        const automaticAction = stringToAutomaticActionFlag(action)
        this._table.setAutomaticAction(seatIndex, automaticAction)
    }

    sitDown(seatIndex: number, buyIn: number): void {
        this._table.sitDown(seatIndex, buyIn)
    }

    standUp(seatIndex: number): void {
        this._table.standUp(seatIndex)
    }
}