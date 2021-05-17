import CommunityCards from "../../src/lib/community-cards";
import Card, {CardRank, CardSuit} from "../../src/lib/card";

describe('Community cards', () => {
    let communityCards: CommunityCards

    beforeEach(() => {
        communityCards = new CommunityCards()
    })

    describe('A pre-flop situation', () => {
        test('precondition', () => {
            expect(communityCards.cards().length).toEqual(0)
        })

        describe('A flop deal is requested', () => {
            beforeEach(() => {
                const cards = new Array(3).fill(new Card(CardRank.A, CardSuit.SPADES))
                communityCards.deal(cards)
            })

            test('First three cards are dealt', () => {
                expect(communityCards.cards().length).toBe(3)
            })
        })

        describe('A turn deal is requested', () => {
            beforeEach(() => {
                const cards = new Array(4).fill(new Card(CardRank.A, CardSuit.SPADES))
                communityCards.deal(cards)
            })

            test('First four cards are dealt', () => {
                expect(communityCards.cards().length).toBe(4)
            })
        })

        describe('A river deal is requested', () => {
            beforeEach(() => {
                const cards = new Array(5).fill(new Card(CardRank.A, CardSuit.SPADES))
                communityCards.deal(cards)
            })

            test('All five cards are dealt', () => {
                expect(communityCards.cards().length).toBe(5)
            })
        })
    })

    describe('A flop situation', () => {
        beforeEach(() => {
            const cards = new Array(3).fill(new Card(CardRank.A, CardSuit.SPADES))
            communityCards.deal(cards)
        })

        test('A turn deal is requested', () => {
            const cards = new Array(1).fill(new Card(CardRank.A, CardSuit.SPADES))
            communityCards.deal(cards)
            expect(communityCards.cards().length).toBe(4)
        })

        test('A river deal is requested', () => {
            const cards = new Array(2).fill(new Card(CardRank.A, CardSuit.SPADES))
            communityCards.deal(cards)
            expect(communityCards.cards().length).toBe(5)
        })
    })

    describe('A turn situation', () => {
        beforeEach(() => {
            const cards = new Array(4).fill(new Card(CardRank.A, CardSuit.SPADES))
            communityCards.deal(cards)
        })

        test('A river deal is requested', () => {
            const cards = new Array(1).fill(new Card(CardRank.A, CardSuit.SPADES))
            communityCards.deal(cards)
            expect(communityCards.cards().length).toBe(5)
        })
    })

    
})