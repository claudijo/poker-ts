import { randomInt } from 'crypto'
import assert from 'assert'
import Card, { CardRank, CardSuit } from './card'

export default class Deck {
    private _cards: Array<Card> = []
    private _size: number

    static shuffle (array: Array<any>): void {
        for (let index = array.length - 1; index > 0; index--) {
            const newIndex = randomInt(index + 1);
            [array[index], array[newIndex]] = [array[newIndex], array[index]];
        }
    }

    constructor() {
        this._size = 52
        let index = 0
        for (let suit = CardSuit.CLUBS; suit <= CardSuit.SPADES; suit++) {
            for (let rank = CardRank._2; rank <= CardRank.A; rank++) {
                this._cards[index++] = new Card(rank, suit)
            }
        }

        Deck.shuffle(this._cards)
    }

    fillAndShuffle(): void {
        this._size = 52;
        Deck.shuffle(this._cards)
    }

    draw(): Card {
        assert(this._size > 0, 'Cannot draw from an empty deck')
        return this._cards[--this._size]
    }

    size(): number {
        return this._size
    }
}