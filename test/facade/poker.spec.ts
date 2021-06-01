import Poker from '../../src/facade/poker'

describe('Poker facade', () => {
    let poker: Poker
    beforeEach(() => {
        poker = new Poker({ smallBlind: 50, bigBlind: 100 })
        poker.sitDown(0, 2000)
        poker.sitDown(1, 2000)
        poker.sitDown(2, 2000)

    })

    test('set forced bets', () => {
        poker.setForcedBets({ smallBlind: 100, bigBlind: 200 })
        expect(poker.forcedBets()).toStrictEqual({
            ante: 0,
            smallBlind: 100,
            bigBlind: 200,
        })
    })

    test('number of seats', () => {
        expect(poker.numSeats()).toBe(9)
    })

    test('stand up', () => {
        expect(poker.seats()).toEqual([
            { totalChips: 2000, stack: 2000, betSize: 0 },
            { totalChips: 2000, stack: 2000, betSize: 0 },
            { totalChips: 2000, stack: 2000, betSize: 0 },
            null,
            null,
            null,
            null,
            null,
            null,
        ])

        poker.standUp(2)

        expect(poker.seats()).toEqual([
            { totalChips: 2000, stack: 2000, betSize: 0 },
            { totalChips: 2000, stack: 2000, betSize: 0 },
            null,
            null,
            null,
            null,
            null,
            null,
            null,
        ])
    })

    describe('hand in progress', () => {
        beforeEach(() => {
            poker.startHand()
        })

        test('player to act', () => {
            expect(poker.playerToAct()).toBe(0)
        })

        test('button', () => {
            expect(poker.button()).toBe(0)
        })

        test('seats', () => {
            expect(poker.seats()).toEqual([
                { totalChips: 2000, stack: 2000, betSize: 0 },
                { totalChips: 2000, stack: 1950, betSize: 50 },
                { totalChips: 2000, stack: 1900, betSize: 100 },
                null,
                null,
                null,
                null,
                null,
                null,
            ])
        })

        test('hand players', () => {
            expect(poker.handPlayers()).toEqual([
                { totalChips: 2000, stack: 2000, betSize: 0 },
                { totalChips: 2000, stack: 1950, betSize: 50 },
                { totalChips: 2000, stack: 1900, betSize: 100 },
                null,
                null,
                null,
                null,
                null,
                null,
            ])
        })

        test('number of active players', () => {
            expect(poker.numActivePlayers()).toBe(3)
        })

        test('forced bets', () => {
            expect(poker.forcedBets()).toStrictEqual({
                ante: 0,
                smallBlind: 50,
                bigBlind: 100,
            })
        })

        test('hand in progress', () => {
            expect(poker.isHandInProgress()).toBeTruthy()
        })

        test('betting round in progress', () => {
            expect(poker.isBettingRoundInProgress()).toBeTruthy()
        })

        test('betting rounds completed', () => {
            expect(poker.areBettingRoundsCompleted()).toBeFalsy()
        })

        test('round of betting', () => {
            expect(poker.roundOfBetting()).toBe('preflop')
        })

        test('legal actions', () => {
            expect(poker.legalActions()).toEqual({
                actions: ['fold', 'check', 'call', 'bet', 'raise'],
                chipRange: { max: 2000, min: 200}
            })
        })

        describe('After first betting round', () => {
            beforeEach(() => {
                poker.actionTaken('call')
                poker.actionTaken('call')
                poker.actionTaken('check')
                poker.endBettingRound()
            })

            test('pots', () => {
                expect(poker.pots()).toStrictEqual([
                    { size: 300, eligiblePlayers: [0, 1, 2] },
                ])
            })

            test('community cards', () => {
                expect(poker.communityCards().length).toBe(3)
                for (const card of poker.communityCards()) {
                    expect(card.suit).toMatch(/clubs|diamonds|hearts|spades/)
                    expect(card.rank).toMatch(/2|3|4|5|6|7|8|9|T|J|Q|K|A/)
                }
            })

            test('hole cards', () => {
                expect(poker.holeCards().length).toBe(9)
                for(const cards of poker.holeCards()) {
                    if (cards !== null) {
                        for (const card of cards) {
                            expect(card.suit).toMatch(/clubs|diamonds|hearts|spades/)
                            expect(card.rank).toMatch(/2|3|4|5|6|7|8|9|T|J|Q|K|A/)
                        }
                    }
                }
            })

            test('can set automatic actions', () => {
                expect(poker.canSetAutomaticActions(2)).toBeTruthy()
            })

            test('legal automatic actions', () => {
                expect(poker.legalAutomaticAction(2)).toEqual([
                    'fold',
                    'check/fold',
                    'check',
                    'call any',
                    'all-in',
                ])
            })

            test('set automatic actions', () => {
                poker.setAutomaticAction(2, 'call any')
                expect(poker.automaticActions()).toEqual([
                    null,
                    null,
                    'call any',
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                ])
            })

            describe('After all betting round', () => {
                beforeEach(() => {
                    poker.actionTaken('check')
                    poker.actionTaken('check')
                    poker.actionTaken('check')
                    poker.endBettingRound()
                    poker.actionTaken('check')
                    poker.actionTaken('check')
                    poker.actionTaken('check')
                    poker.endBettingRound()
                    poker.actionTaken('check')
                    poker.actionTaken('check')
                    poker.actionTaken('check')
                    poker.endBettingRound()
                })

                test('showdown', () => {
                    expect(poker.isHandInProgress()).toBeTruthy()
                    poker.showdown()
                    expect(poker.isHandInProgress()).toBeFalsy()
                })
            })


        })
    })
})