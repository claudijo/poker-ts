export enum CardRank {_2, _3, _4, _5, _6, _7, _8, _9, T, J, Q, K, A}
export enum CardSuit { CLUBS, DIAMONDS, HEARTS, SPADES}

export default class Card {
    rank: CardRank
    suit: CardSuit

    static eq(lhs: Card, rhs: Card): boolean {
        return lhs.rank === rhs.rank && lhs.suit === rhs.suit
    }

    static ne(lhs: Card, rhs: Card): boolean {
        return !Card.eq(lhs, rhs)
    }

    static lt(lhs: Card, rhs: Card): boolean {
        return lhs.rank < rhs.rank
    }

    static gt(lhs: Card, rhs: Card): boolean {
        return lhs.rank > rhs.rank
    }

    static lte(lhs: Card, rhs: Card): boolean {
        return !Card.gt(lhs, rhs);
    }

    static gte(lhs: Card, rhs: Card): boolean {
        return !Card.lt(lhs, rhs);
    }

    constructor(rank: CardRank, suit: CardSuit) {
        this.rank = rank;
        this.suit = suit;
    }
}
