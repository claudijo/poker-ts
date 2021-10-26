export declare enum CardRank {
    _2 = 0,
    _3 = 1,
    _4 = 2,
    _5 = 3,
    _6 = 4,
    _7 = 5,
    _8 = 6,
    _9 = 7,
    T = 8,
    J = 9,
    Q = 10,
    K = 11,
    A = 12
}
export declare enum CardSuit {
    CLUBS = 0,
    DIAMONDS = 1,
    HEARTS = 2,
    SPADES = 3
}
export default class Card {
    rank: CardRank;
    suit: CardSuit;
    static compare(c1: Card, c2: Card): number;
    constructor(rank: CardRank, suit: CardSuit);
}
