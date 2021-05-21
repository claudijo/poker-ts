import assert from 'assert';
import Card from "./card";

export enum RoundOfBetting {
    PREFLOP = 0,
    FLOP = 3,
    TURN = 4,
    RIVER = 5,
}

export const next = (roundOfBetting: RoundOfBetting): RoundOfBetting => {
    if (roundOfBetting === RoundOfBetting.PREFLOP) {
        return RoundOfBetting.FLOP
    } else {
        return roundOfBetting + 1
    }
}

export default class CommunityCards {
    private _cards: Array<Card> = []

    cards(): Array<Card> {
        return this._cards
    }

    deal(cards: Array<Card>): void {
        assert(cards.length <= 5 - this._cards.length, 'Cannot deal more than there is undealt cards')
        this._cards = this._cards.concat(cards)
    }
}