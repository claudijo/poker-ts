import Card, { CardRank } from './card';
import CommunityCards from './community-cards';
import { HoleCards } from 'types/hole-cards';
export declare enum HandRanking {
    HIGH_CARD = 0,
    PAIR = 1,
    TWO_PAIR = 2,
    THREE_OF_A_KIND = 3,
    STRAIGHT = 4,
    FLUSH = 5,
    FULL_HOUSE = 6,
    FOUR_OF_A_KIND = 7,
    STRAIGHT_FLUSH = 8,
    ROYAL_FLUSH = 9
}
export declare type RankInfo = {
    rank: CardRank;
    count: number;
};
export default class Hand {
    private readonly _ranking;
    private readonly _strength;
    private readonly _cards;
    constructor(ranking: HandRanking, strength: number, cards: Card[]);
    static create(holeCards: HoleCards, communityCards: CommunityCards): Hand;
    static of(cards: Card[]): Hand;
    static compare(h1: Hand, h2: Hand): number;
    static nextRank(cards: Card[]): RankInfo;
    static getStrength(cards: Card[]): number;
    static getSuitedCards(cards: Card[]): Card[] | null;
    static getStraightCards(cards: Card[]): Card[] | null;
    static _highLowHandEval(cards: Card[]): Hand;
    static _straightFlushEval(cards: Card[]): Hand | null;
    ranking(): HandRanking;
    strength(): number;
    cards(): Card[];
}
