import { randomInt } from 'crypto'
import assert from 'assert'
import Card, { CardRank, CardSuit } from './card'
import { shuffle } from '../util/array'

export default class Deck extends Array<Card> {
    private _size: number

    constructor() {
        super()

        // Set the prototype explicitly when extending Array
        // See https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
        Object.setPrototypeOf(this, Deck.prototype);

        this._size = 52
        let index = 0
        for (let suit = CardSuit.CLUBS; suit <= CardSuit.SPADES; suit++) {
            for (let rank = CardRank._2; rank <= CardRank.A; rank++) {
                this[index++] = new Card(rank, suit)
            }
        }

        shuffle(this)
    }

    fillAndShuffle(): void {
        this._size = 52;
        shuffle(this)
    }

    draw(): Card {
        assert(this._size > 0, 'Cannot draw from an empty deck')
        return this[--this._size]
    }
}