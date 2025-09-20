import Hand, { HandRanking } from '../../src/lib/hand'
import Card from '../../src/lib/card'
import { makeCards } from '../helper/card'

describe('Hand', () => {
    describe('get suited cards', () => {
        let allCards: Card[][]
        let suited: (Card[] | null)[]

        beforeEach(() => {
            allCards = [
                makeCards('Ac Ac Ac Ac Kc 2c 2c'),
                makeCards('2c Ac Ac Kc Kc 2c Ac'),
                makeCards('As Ac As Ks Kc Ks 2s'),
                makeCards('Ac Ac Ac Kc Ks Ks 2s'),
            ]

            suited = [
                makeCards('Ac Ac Ac Ac Kc 2c 2c'),
                makeCards('Ac Ac Ac Kc Kc 2c 2c'),
                makeCards('As As Ks Ks 2s'),
                null,
            ]
        })

        test('suited cards', () => {
            for (let index = 0; index < allCards.length; index++) {
                expect(Hand.getSuitedCards(allCards[index])).toEqual(suited[index])
            }
        })
    })

    describe('get straight cards', () => {
        let allCards: Card[][]
        let straight: (Card[] | null)[]

        beforeEach(() => {
            allCards = [
                makeCards('Ac Kc Qc Jc Tc 9c 8c'),
                makeCards('Ac Kc Tc 9c 8c 7c 6c'),
                makeCards('Ac Kc Qc 5c 4c 3s 2c'),
                makeCards('Ac Kc Qc Jc 9c 8c 7c'),
            ]

            straight = [
                makeCards('Ac Kc Qc Jc Tc'),
                makeCards('Tc 9c 8c 7c 6c'),
                makeCards('5c 4c 3s 2c Ac'),
                null,
            ]
        })

        test('straight cards', () => {
            for (let index = 0; index < allCards.length; index++) {
                expect(Hand.getStraightCards(allCards[index])).toEqual(straight[index])
            }
        })
    })

    describe('high/low hand evaluation', () => {
        let allCards: Card[][]
        let hands: Hand[]
        let handRankings: HandRanking[]

        beforeEach(() => {
            allCards = [
                makeCards('Ac Ac Ac Ac Kc 2c 2c'),
                makeCards('Ac Ac Ac Kc Kc 2c 2c'),
                makeCards('Ac Ac Ac Kc Kc Kc 2c'),
                makeCards('Ac Ac Kc Kc 3c 2c 2c'),
                makeCards('Ac Ac Kc Qc Jc Tc 2c'),
                makeCards('Ac Kc Qc Jc 9c 8c 7c'),
            ]

            hands = [
                Hand._highLowHandEval(allCards[0]),
                Hand._highLowHandEval(allCards[1]),
                Hand._highLowHandEval(allCards[2]),
                Hand._highLowHandEval(allCards[3]),
                Hand._highLowHandEval(allCards[4]),
                Hand._highLowHandEval(allCards[5]),
            ]

            handRankings = [
                HandRanking.FOUR_OF_A_KIND,
                HandRanking.FULL_HOUSE,
                HandRanking.THREE_OF_A_KIND,
                HandRanking.TWO_PAIR,
                HandRanking.PAIR,
                HandRanking.HIGH_CARD,
            ]
        })

        test('hand rankings', () => {
            for (let index = 0; index < hands.length; index++) {
                expect(hands[index].ranking()).toBe(handRankings[index])
            }
        })
    })

    describe('straight/flush hand evaluation', () => {
        let allCards: Card[][]
        let hands: (Hand | null)[]
        let handRankings: HandRanking[]

        beforeEach(() => {
            allCards = [
                makeCards('Ac Qc Tc 9c 7h 2c 3h'),
                makeCards('Ts 9c 8d 7c 6h 4c 5h'),
                makeCards('As 2c 3d 4c 5h Kc Qh'),
                makeCards('Ks Qs Ts Js 9s 8s 7s'),
                makeCards('As Ks Qs Js Ts 8s 7s'),
            ]

            hands = [
                Hand._straightFlushEval(allCards[0]),
                Hand._straightFlushEval(allCards[1]),
                Hand._straightFlushEval(allCards[2]),
                Hand._straightFlushEval(allCards[3]),
                Hand._straightFlushEval(allCards[4]),
            ]

            handRankings = [
                HandRanking.FLUSH,
                HandRanking.STRAIGHT,
                HandRanking.STRAIGHT,
                HandRanking.STRAIGHT_FLUSH,
                HandRanking.ROYAL_FLUSH,
            ]
        })

        test('hand rankings', () => {
            for (let index = 0; index < hands.length; index++) {
                expect(hands[index]?.ranking()).toBe(handRankings[index])
            }
        })
    })

    describe('Hand from seven cards', () => {
        let allCards: Card[][]
        let handCards: Card[][]

        beforeEach(() => {
            allCards = [
                makeCards('Ac Qc Tc 9c 7h 2c 3h'),
                makeCards('Ts 9c 8d 7c 6h 4c 5h'),
                makeCards('As 2c 3d 4c 5h Kc Qh'),
                makeCards('Ks Qs Ts Js 9s 8s 7s'),
                makeCards('As Ks Qs Js Ts 8s 7s'),

                makeCards('Ac Ac Ac Ac Kc 2c 2c'),
                makeCards('Ac Ac Ac Kc Kc 2c 2c'),
                makeCards('Ac Ac Ac Kc Kc Kc 2c'),
                makeCards('Ac Ac Kc Kc 3c 2c 2c'),
                makeCards('Ac Ah Kc Qh Jc 9h 2c'),
                makeCards('Ah Kc Qs Jd 9c 8c 7c'),

                makeCards('3s 3d 6c Qc Ad 6s Ac'),
            ]

            handCards = [
                makeCards('Ac Qc Tc 9c 2c'),
                makeCards('Ts 9c 8d 7c 6h'),
                makeCards('5h 4c 3d 2c As'),
                makeCards('Ks Qs Js Ts 9s'),
                makeCards('As Ks Qs Js Ts'),

                makeCards('Ac Ac Ac Ac Kc'),
                makeCards('Ac Ac Ac Kc Kc'),
                makeCards('Ac Ac Ac Kc Kc'),
                makeCards('Ac Ac Kc Kc 3c'),
                makeCards('Ac Ah Kc Qh Jc'),
                makeCards('Ah Kc Qs Jd 9c'),

                makeCards('Ad Ac 6c 6s Qc'),
            ]
        })

        test('hands', () => {
            for (let index = 0; index < allCards.length; index++) {
                expect(Hand.of(allCards[index]).cards()).toEqual(handCards[index])
            }
        })
    })
})