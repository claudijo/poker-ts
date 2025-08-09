import assert from 'assert'
import Card, { CardRank } from './card'
import { findIndexAdjacent, findMax, rotate, unique } from '../util/array'
import CommunityCards from './community-cards'
import { HoleCards } from 'types/hole-cards'

export enum HandRanking {
    HIGH_CARD,
    PAIR,
    TWO_PAIR,
    THREE_OF_A_KIND,
    STRAIGHT,
    FLUSH,
    FULL_HOUSE,
    FOUR_OF_A_KIND,
    STRAIGHT_FLUSH,
    ROYAL_FLUSH,
}

export type RankInfo = {
    rank: CardRank,
    count: number,
}

export default class Hand {
    private readonly _ranking: HandRanking
    private readonly _strength: number
    private readonly _cards: Card[] /* size 5 */

    constructor(ranking: HandRanking, strength: number, cards: Card[]) {
        assert(cards.length === 5)

        this._cards = cards
        this._ranking = ranking
        this._strength = strength
    }

    static create(holeCards: HoleCards, communityCards: CommunityCards): Hand {
        assert(communityCards.cards().length === 5, 'All community cards must be dealt')
        const cards = [
            ...holeCards,
            ...communityCards.cards(),
        ]
        return Hand.of(cards)
    }

    static of(cards: Card[]): Hand {
        assert(cards.length === 7)
        const hand1 = Hand._highLowHandEval(cards)
        const hand2 = Hand._straightFlushEval(cards)

        if (hand2 !== null) {
            return findMax([hand1, hand2], Hand.compare)
        }
        return hand1
    }

    static compare(h1: Hand, h2: Hand): number {
        const rankingDiff = h1.ranking() - h2.ranking()
        if (rankingDiff !== 0) {
            return rankingDiff
        }

        return h1.strength() - h2.strength()
    }

    static nextRank(cards: Card[]): RankInfo {
        assert(cards.length !== 0)
        const firstRank = cards[0].rank
        const secondRankIndex = cards.findIndex(card => card.rank !== firstRank)
        return {
            rank: firstRank,
            count: secondRankIndex !== -1 ? secondRankIndex : cards.length,
        }
    }

    static getStrength(cards: Card[]): number {
        assert(cards.length === 5)
        let sum = 0
        let multiplier = Math.pow(13, 4)
        for (; ;) {
            const { rank, count } = this.nextRank(cards)
            sum += multiplier * rank
            cards = cards.slice(count)
            if (cards.length !== 0) {
                multiplier /= 13
            } else {
                break
            }
        }

        return sum
    }

    // If there are >=5 cards with the same suit, return a span containing all of
    // them.
    static getSuitedCards(cards: Card[]): Card[] | null {
        assert(cards.length === 7)
        cards.sort(Card.compare)
        let first = 0
        for (; ;) {
            let last = cards.slice(first + 1).findIndex(card => card.suit !== cards[first].suit)
            if (last === -1) {
                last = cards.length
            } else {
                last += first + 1
            }
            if (last - first >= 5) {
                return cards.slice(first, last)
            } else if (last === cards.length) {
                return null
            }

            first = last
        }
    }

    // EXPECTS: 'cards' is a descending range of cards with unique ranks.
    // Returns the subrange which contains the cards forming a straight. Ranks of
    // cards in the resulting range are r, r-1, r-2... except for the wheel.
    static getStraightCards(cards: Card[]): Card[] | null {
        assert(cards.length >= 5)
        let first = 0

        for (; ;) {
            let last = findIndexAdjacent(cards.slice(first), (c1, c2) => c1.rank !== c2.rank + 1)
            if (last === -1) {
                last = cards.length
            } else {
                last += first + 1
            }
            if (last - first >= 5) {
                return cards.slice(first, first + 5)
            } else if (last - first === 4) {
                if (cards[first].rank === CardRank._5 && cards[0].rank === CardRank.A) {
                    rotate(cards, first)
                    return cards.slice(0, 5)
                }
            } else if (cards.length - last < 4) {
                return null
            }

            first = last
        }
    }

    static _highLowHandEval(cards: Card[] /* size = 7 */): Hand {
        assert(cards.length === 7)

        cards = [...cards]

        const rankOccurrences: number[] = new Array(13).fill(0)
        for (const card of cards) {
            rankOccurrences[card.rank] += 1
        }

        cards.sort((c1, c2) => {
            if (rankOccurrences[c1.rank] === rankOccurrences[c2.rank]) {
                return c2.rank - c1.rank
            }
            return rankOccurrences[c2.rank] - rankOccurrences[c1.rank]
        })

        let ranking: HandRanking
        const { count } = Hand.nextRank(cards)
        if (count === 4) {
            cards = [
                ...cards.slice(0, 4),
                ...cards.slice(5).sort((c1, c2) => c2.rank - c1.rank),
            ]
            ranking = HandRanking.FOUR_OF_A_KIND
        } else if (count === 3) {
            const tmp = Hand.nextRank(cards.slice(-4))
            if (tmp.count === 2) {
                ranking = HandRanking.FULL_HOUSE
            } else {
                ranking = HandRanking.THREE_OF_A_KIND
            }
        } else if (count === 2) {
            const tmp = Hand.nextRank(cards.slice(count))
            if (tmp.count === 2) {
                ranking = HandRanking.TWO_PAIR
                // For two pair, we need to select the best 5 cards:
                // - First pair (2 cards)
                // - Second pair (2 cards) 
                // - Highest remaining card (1 card)
                const firstPair = cards.slice(0, count)
                const secondPair = cards.slice(count, count + tmp.count)
                const remainingCards = cards.slice(count + tmp.count).sort((c1, c2) => c2.rank - c1.rank)
                const kicker = remainingCards[0]
                cards = [...firstPair, ...secondPair, kicker]
            } else {
                ranking = HandRanking.PAIR
            }
        } else {
            ranking = HandRanking.HIGH_CARD
        }

        const handCards = cards.slice(0, 5)
        const strength = Hand.getStrength(handCards)
        return new Hand(ranking, strength, handCards)
    }

    static _straightFlushEval(cards: Card[]): Hand | null {
        assert(cards.length === 7)

        cards = [...cards]
        const suitedCards = Hand.getSuitedCards(cards)
        if (suitedCards !== null) {
            const straightCards = this.getStraightCards(suitedCards)
            if (straightCards !== null) {
                let ranking: HandRanking
                let strength: number
                if (straightCards[0].rank === CardRank.A) {
                    ranking = HandRanking.ROYAL_FLUSH
                    strength = 0
                } else {
                    ranking = HandRanking.STRAIGHT_FLUSH
                    strength = straightCards[0].rank
                }
                const handCards = straightCards.slice(0, 5)
                return new Hand(ranking, strength, handCards)
            } else {
                const ranking = HandRanking.FLUSH
                const handCards = suitedCards.slice(0, 5)
                const strength = this.getStrength(handCards)
                return new Hand(ranking, strength, handCards)
            }
        } else {
            cards.sort((c1, c2) => c2.rank - c1.rank)
            cards = unique(cards, (c1, c2) => c1.rank !== c2.rank)
            if (cards.length < 5) {
                return null
            } else {
                const straightCards = this.getStraightCards(cards)
                if (straightCards !== null) {
                    const ranking = HandRanking.STRAIGHT
                    const strength = straightCards[0].rank
                    return new Hand(ranking, strength, straightCards)

                }
            }
        }

        return null
    }

    ranking(): HandRanking {
        return this._ranking
    }

    strength(): number {
        return this._strength
    }

    cards(): Card[] {
        return this._cards
    }
}