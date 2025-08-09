import Hand, { HandRanking } from '../../src/lib/hand'
import Card, { CardRank, CardSuit } from '../../src/lib/card'

describe('Hand - Two Pair Fix', () => {
    describe('when player has three pairs', () => {
        test('should select best two pairs with highest kicker', () => {
            // Test case: Player has A-A, 6-6, 3-3, Q
            // Should select A-A-6-6 with kicker Q (not A-A-6-6 with kicker 3)
            const cards = [
                new Card(CardRank._3, CardSuit.SPADES),    // 3♠
                new Card(CardRank._3, CardSuit.DIAMONDS),  // 3♦
                new Card(CardRank._6, CardSuit.CLUBS),     // 6♣
                new Card(CardRank.Q, CardSuit.CLUBS),      // Q♣
                new Card(CardRank.A, CardSuit.DIAMONDS),   // A♦
                new Card(CardRank._6, CardSuit.SPADES),    // 6♠
                new Card(CardRank.A, CardSuit.CLUBS)       // A♣
            ]

            const hand = Hand.of(cards)
            
            expect(hand.ranking()).toBe(HandRanking.TWO_PAIR)
            
            const handCards = hand.cards()
            expect(handCards).toHaveLength(5)
            
            // Should have A-A-6-6-Q, not A-A-6-6-3
            const ranks = handCards.map(card => card.rank).sort((a, b) => b - a)
            expect(ranks).toEqual([
                CardRank.A,  // A
                CardRank.A,  // A
                CardRank.Q,  // Q (kicker)
                CardRank._6, // 6
                CardRank._6  // 6
            ])
        })

        test('should handle comparison correctly when both players have same two pairs', () => {
            // Both players have A-A-6-6 from community cards
            const communityCards = [
                new Card(CardRank._6, CardSuit.CLUBS),     // 6♣
                new Card(CardRank.Q, CardSuit.CLUBS),      // Q♣
                new Card(CardRank.A, CardSuit.DIAMONDS),   // A♦
                new Card(CardRank._6, CardSuit.SPADES),    // 6♠
                new Card(CardRank.A, CardSuit.CLUBS)       // A♣
            ]

            // Player 1: T♦ J♠ - best hand is A-A-6-6-Q
            const player1Cards = [
                new Card(CardRank.T, CardSuit.DIAMONDS),   // T♦
                new Card(CardRank.J, CardSuit.SPADES),     // J♠
                ...communityCards
            ]

            // Player 2: 3♠ 3♦ - has three pairs A-A, 6-6, 3-3
            // Best hand should be A-A-6-6-Q (not A-A-6-6-3)
            const player2Cards = [
                new Card(CardRank._3, CardSuit.SPADES),    // 3♠
                new Card(CardRank._3, CardSuit.DIAMONDS),  // 3♦
                ...communityCards
            ]

            const player1Hand = Hand.of(player1Cards)
            const player2Hand = Hand.of(player2Cards)

            // Both should have TWO_PAIR
            expect(player1Hand.ranking()).toBe(HandRanking.TWO_PAIR)
            expect(player2Hand.ranking()).toBe(HandRanking.TWO_PAIR)

            // Both should have the same strength (A-A-6-6-Q)
            expect(player1Hand.strength()).toBe(player2Hand.strength())

            // Comparison should be a tie
            expect(Hand.compare(player1Hand, player2Hand)).toBe(0)
        })

        test('should select different pairs when kickers differ', () => {
            // Player 1: A-A, K-K, 2-2, Q -> A-A-K-K-Q
            const player1Cards = [
                new Card(CardRank.A, CardSuit.SPADES),
                new Card(CardRank.A, CardSuit.HEARTS),
                new Card(CardRank.K, CardSuit.CLUBS),
                new Card(CardRank.K, CardSuit.DIAMONDS),
                new Card(CardRank._2, CardSuit.SPADES),
                new Card(CardRank._2, CardSuit.HEARTS),
                new Card(CardRank.Q, CardSuit.CLUBS)
            ]

            // Player 2: A-A, K-K, 2-2, J -> A-A-K-K-J
            const player2Cards = [
                new Card(CardRank.A, CardSuit.SPADES),
                new Card(CardRank.A, CardSuit.HEARTS),
                new Card(CardRank.K, CardSuit.CLUBS),
                new Card(CardRank.K, CardSuit.DIAMONDS),
                new Card(CardRank._2, CardSuit.SPADES),
                new Card(CardRank._2, CardSuit.HEARTS),
                new Card(CardRank.J, CardSuit.CLUBS)
            ]

            const player1Hand = Hand.of(player1Cards)
            const player2Hand = Hand.of(player2Cards)

            // Player 1 should win (Q > J kicker)
            expect(Hand.compare(player1Hand, player2Hand)).toBeGreaterThan(0)
        })
    })
})
