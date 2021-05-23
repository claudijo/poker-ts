export enum CardRank {_2, _3, _4, _5, _6, _7, _8, _9, T, J, Q, K, A}
export enum CardSuit { CLUBS, DIAMONDS, HEARTS, SPADES}

export default class Card {
    rank: CardRank
    suit: CardSuit

    static compare(c1: Card, c2: Card) {
        const suitDiff = c2.suit - c1.suit
        if (suitDiff !== 0) {
            return suitDiff
        }
        return c2.rank - c1.rank
    }

    constructor(rank: CardRank, suit: CardSuit) {
        this.rank = rank;
        this.suit = suit;
    }
}
