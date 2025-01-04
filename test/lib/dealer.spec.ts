import Dealer, {Action} from '../../src/lib/dealer'
import {ForcedBets} from '../../src/types/forced-bets'
import Deck from '../../src/lib/deck'
import CommunityCards, {RoundOfBetting} from '../../src/lib/community-cards'
import {SeatArray} from '../../src/types/seat-array'
import Player from '../../src/lib/player'
import Card, {CardRank, CardSuit} from '../../src/lib/card'
import {
    shuffleForThreePlayersWithTwoWinners,
    shuffleForTwoPlayersDraw,
    shuffleForTwoPlayersWithFullHouseWinner,
} from '../helper/card'
import {HandRanking} from '../../src/lib/hand'

describe('Dealer', () => {
    describe('Starting the hand', () => {
        let forcedBets: ForcedBets
        let deck: Deck
        let communityCards: CommunityCards

        beforeEach(() => {
            forcedBets = { blinds: { big: 50, small: 25 } }
            // tslint:disable-next-line:no-empty
            deck = new Deck(() => {})
            communityCards = new CommunityCards()
        })

        describe('A hand with with two players where the big blind has just enough to cover the blind', () => {
            let players: SeatArray
            let dealer: Dealer

            beforeEach(() => {
                players = new Array(9).fill(null)
                players[0] = new Player(100)
                players[1] = new Player(50)
                dealer = new Dealer(players, 0, forcedBets, deck, communityCards)

                dealer.startHand()
            })

            test('Betting round should be in progress', () => {
                expect(dealer.bettingRoundInProgress()).toBeTruthy()
            })

            test('Small blind should be allowed to fold, call, or raise', () => {
                const { action } = dealer.legalActions()
                expect(action & Action.FOLD).toBeTruthy()
                expect(action & Action.CHECK).toBeFalsy()
                expect(action & Action.CALL).toBeTruthy()
                expect(action & Action.BET).toBeFalsy()
                expect(action & Action.RAISE).toBeTruthy()
            })

            test('Betting round should still be in progress after small blind calls and big blind should be allowed to fold or check', () => {
                dealer.actionTaken(Action.CALL)

                const { action } = dealer.legalActions()
                expect(action & Action.FOLD).toBeTruthy()
                expect(action & Action.CHECK).toBeTruthy()
                expect(action & Action.CALL).toBeFalsy()
                expect(action & Action.BET).toBeFalsy()
                expect(action & Action.RAISE).toBeFalsy()
            })

            test('Betting round and should not be in progress after small blind calls and big blind checks', () => {
                dealer.actionTaken(Action.CALL)
                dealer.actionTaken(Action.CHECK)

                expect(dealer.bettingRoundInProgress()).toBeFalsy()
            })
        })

        describe('A hand with two players who can cover their blinds', () => {
            let players: SeatArray
            let dealer: Dealer
            beforeEach(() => {
                players = new Array(9).fill(null)
                players[0] = new Player(100)
                players[1] = new Player(100)
                dealer = new Dealer(players, 0, forcedBets, deck, communityCards)
            })

            describe('The hand starts', () => {
                beforeEach(() => {
                    dealer.startHand()
                })

                test('The button has posted the small blind', () => {
                    expect(players[0]?.betSize()).toBe(25)
                })

                test('The other player has posted the big blind', () => {
                    expect(players[1]?.betSize()).toBe(50)
                })

                test('The action is on the button', () => {
                    expect(dealer.playerToAct()).toBe(0)
                })
            })
        })

        describe('A hand with two players who can\'t cover their blinds', () => {
            let players: SeatArray
            let dealer: Dealer
            beforeEach(() => {
                players = new Array(9).fill(null)
                players[0] = new Player(20)
                players[1] = new Player(20)
                dealer = new Dealer(players, 0, forcedBets, deck, communityCards)
            })

            describe('The hand starts', () => {
                beforeEach(() => {
                    dealer.startHand()
                })

                test('The betting round is not in progress', () => {
                    expect(dealer.bettingRoundInProgress()).toBeFalsy()
                    dealer.endBettingRound()
                    expect(dealer.bettingRoundInProgress()).toBeFalsy()
                    expect(dealer.bettingRoundsCompleted()).toBeTruthy()
                    expect(dealer.roundOfBetting()).toBe(RoundOfBetting.RIVER)
                    dealer.showdown()
                    expect(dealer.handInProgress()).toBeFalsy()
                })

            })
        })

        describe('A hand with more than two players', () => {
            let players: SeatArray
            let dealer: Dealer
            beforeEach(() => {
                players = new Array(9).fill(null)
                players[0] = new Player(100)
                players[1] = new Player(100)
                players[2] = new Player(100)
                players[3] = new Player(100)
                dealer = new Dealer(players, 0, forcedBets, deck, communityCards)
            })

            describe('The hand starts', () => {
                beforeEach(() => {
                    dealer.startHand()
                })

                test('The button+1 has posted the small blind', () => {
                    expect(players[1]?.betSize()).toBe(25)
                })

                test('The button+2 has posted the big blind', () => {
                    expect(players[2]?.betSize()).toBe(50)
                })

                test('The action is on the button+3', () => {
                    expect(dealer.playerToAct()).toBe(3)
                })
            })
        })
    })

    describe('Ending the betting round', () => {
        let forcedBets: ForcedBets
        let deck: Deck
        let communityCards: CommunityCards
        let players: SeatArray
        let dealer: Dealer

        beforeEach(() => {
            forcedBets = { blinds: { big: 50, small: 25 } }
            deck = new Deck()
            communityCards = new CommunityCards()
            players = new Array(9).fill(null)
            players[0] = new Player(1000)
            players[1] = new Player(1000)
            players[2] = new Player(1000)
            dealer = new Dealer(players, 0, forcedBets, deck, communityCards)
        })

        describe('There is two or more active players at the end of any betting round except river', () => {
            beforeEach(() => {
                dealer.startHand()
                dealer.actionTaken(Action.CALL)
                dealer.actionTaken(Action.CALL)
                dealer.actionTaken(Action.CHECK)
            })

            test('precondition', () => {
                expect(dealer.bettingRoundInProgress()).toBeFalsy()
                expect(dealer.numActivePlayers()).toBeGreaterThan(2)
                expect(dealer.roundOfBetting()).not.toBe(RoundOfBetting.RIVER)
                expect(communityCards.cards().length).toBe(0)
            })

            describe('The betting round is ended', () => {
                beforeEach(() => {
                    dealer.endBettingRound()
                })

                test('The next betting round begins', () => {
                    expect(dealer.bettingRoundInProgress()).toBeTruthy()
                    expect(dealer.roundOfBetting()).toBe(RoundOfBetting.FLOP)
                    expect(communityCards.cards().length).toBe(3)
                })
            })
        })

        describe('There is two or more active players at the end of river', () => {
            beforeEach(() => {
                dealer.startHand()

                // preflop
                dealer.actionTaken(Action.CALL)
                dealer.actionTaken(Action.CALL)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                // flop
                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                // turn
                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                // river
                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                // not ended yet
            })

            test('precondition', () => {
                expect(dealer.bettingRoundInProgress()).toBeFalsy()
                expect(dealer.roundOfBetting()).toBe(RoundOfBetting.RIVER)
                expect(communityCards.cards().length).toBe(5)
            })

            describe('The betting round is ended', () => {
                beforeEach(() => {
                    dealer.endBettingRound()
                })

                test('precondition', () => {
                    expect(dealer.bettingRoundInProgress()).toBeFalsy()
                    expect(dealer.bettingRoundsCompleted()).toBeTruthy()
                    expect(dealer.roundOfBetting()).toBe(RoundOfBetting.RIVER)
                })

                test('The hand is over', () => {
                    dealer.showdown()
                    expect(dealer.handInProgress()).toBeFalsy()
                })
            })
        })

        describe('There is one or less active players at the end of a betting round and more than one player in all pots', () => {
            beforeEach(() => {
                dealer.startHand()
                dealer.actionTaken(Action.RAISE, 1000)
                dealer.actionTaken(Action.CALL)
                dealer.actionTaken(Action.FOLD)
            })

            test('precondition', () => {
                expect(dealer.bettingRoundInProgress()).toBeFalsy()
                expect(dealer.numActivePlayers()).toBeLessThan(1)
                expect(dealer.roundOfBetting()).not.toBe(RoundOfBetting.RIVER)
                expect(communityCards.cards().length).toBe(0)
            })

            describe('The betting round is ended', () => {
                beforeEach(() => {
                    dealer.endBettingRound()
                    dealer.showdown()
                })

                test('The hand is over', () => {
                    expect(dealer.handInProgress()).toBeFalsy()
                })

                test('The undealt community cards (if any) are dealt', () => {
                    expect(communityCards.cards().length).toBe(5)
                })
            })
        })

        describe('There is one or less active players at the end of a betting round and a single player in a single pot', () => {
            beforeEach(() => {
                dealer.startHand()
                dealer.actionTaken(Action.RAISE, 1000)
                dealer.actionTaken(Action.FOLD)
                dealer.actionTaken(Action.FOLD)
            })

            test('precondition', () => {
                expect(dealer.bettingRoundInProgress()).toBeFalsy()
                expect(dealer.numActivePlayers()).toBeLessThan(1)
                expect(dealer.roundOfBetting()).not.toBe(RoundOfBetting.RIVER)
                expect(communityCards.cards().length).toBe(0)
            })

            describe('The betting round is ended', () => {
                beforeEach(() => {
                    dealer.endBettingRound()
                    dealer.showdown()
                })

                test('The hand is over', () => {
                    expect(dealer.handInProgress()).toBeFalsy()
                })

                test('The undealt community cards (if any) are not dealt', () => {
                    expect(communityCards.cards().length).toBe(0)
                })
            })
        })
    })

    describe('flop, someone folded preflop, now others fold, when 1 remains, the hand should be over', () => {
        let forcedBets: ForcedBets
        let deck: Deck
        let communityCards: CommunityCards
        let players: SeatArray
        let dealer: Dealer

        beforeEach(() => {
            forcedBets = { blinds: { big: 50, small: 25 } }
            deck = new Deck()
            communityCards = new CommunityCards()
            players = new Array(9).fill(null)
            players[0] = new Player(1000)
            players[1] = new Player(1000)
            players[2] = new Player(1000)
            dealer = new Dealer(players, 0, forcedBets, deck, communityCards)

            dealer.startHand()
            dealer.actionTaken(Action.FOLD)
            dealer.actionTaken(Action.CALL)
            dealer.actionTaken(Action.CHECK)
        })

        test('betting round is not in progress after last remaining player folds', () => {
            expect(dealer.bettingRoundInProgress()).toBeFalsy()
            dealer.endBettingRound()
            dealer.actionTaken(Action.FOLD)
            expect(dealer.bettingRoundInProgress()).toBeFalsy()
        })

        describe('The betting round is ended', () => {
            beforeEach(() => {
                dealer.endBettingRound()
            })

            test('Player folds', () => {
                dealer.actionTaken(Action.FOLD)
                expect(dealer.bettingRoundInProgress()).toBeFalsy()
            })
        })
    })

    describe('Showdown', () => {
        describe('single pot single player', () => {
            let forcedBets: ForcedBets
            let deck: Deck
            let communityCards: CommunityCards
            let players: SeatArray
            let dealer: Dealer

            beforeEach(() => {
                forcedBets = { blinds: { big: 50, small: 25 } }
                deck = new Deck()
                communityCards = new CommunityCards()
                players = new Array(9).fill(null)
                players[0] = new Player(1000)
                players[1] = new Player(1000)
                players[2] = new Player(1000)
                dealer = new Dealer(players, 0, forcedBets, deck, communityCards)

                dealer.startHand()
                dealer.actionTaken(Action.RAISE, 1000)
                dealer.actionTaken(Action.FOLD)
                dealer.actionTaken(Action.FOLD)
                dealer.endBettingRound()
                // tslint:disable-next-line:no-console
                console.log("__________", dealer.pots())
                dealer.showdown()
            })

            test('single winner', () => {
                expect(dealer.handInProgress()).toBeFalsy()
                expect(players[0]?.stack()).toBe(1075)
            })

            test('reveal single winner hand', () => {
                // const firstWinnerInFirstPot = dealer.winners()[0][0];
                // const [seatIndex, hand, holeCards] = firstWinnerInFirstPot;

                // tslint:disable-next-line:no-console
                console.log("winners", dealer.winners());
            })
        })

        describe('single winner after full round', () => {
            let forcedBets: ForcedBets
            let deck: Deck
            let communityCards: CommunityCards
            let players: SeatArray
            let dealer: Dealer

            beforeEach(() => {
                forcedBets = { blinds: { big: 50, small: 25 } }
                // tslint:disable-next-line:no-empty
                deck = new Deck(() => {})
                communityCards = new CommunityCards()
                players = new Array(9).fill(null)
                players[0] = new Player(1000)
                players[1] = new Player(1000)
                players[2] = new Player(1000)
                dealer = new Dealer(players, 0, forcedBets, deck, communityCards)

                dealer.startHand()

                dealer.actionTaken(Action.RAISE, 500)
                dealer.actionTaken(Action.CALL)
                dealer.actionTaken(Action.CALL)
                dealer.endBettingRound()

                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                dealer.showdown()
            })

            test('pot has been divided', () => {
                expect(players[0]?.stack()).toBe(500)
                expect(players[1]?.stack()).toBe(500)
                expect(players[2]?.stack()).toBe(2000)
            })

            test('reveal winner hand', () => {
                const firstWinnerInFirstPot = dealer.winners()[0][0];
                const [seatIndex, hand, holeCards] = firstWinnerInFirstPot;
                expect(seatIndex).toBe(2)
                expect(hand.ranking()).toBe(HandRanking.STRAIGHT_FLUSH)
                expect(hand.strength()).toBe(8)
                expect(hand.cards()).toEqual([
                    new Card(8, 3),
                    new Card(7, 3),
                    new Card(6, 3),
                    new Card(5, 3),
                    new Card(4, 3),
                ])
                expect(holeCards).toEqual([
                    new Card(8, 3),
                    new Card(7, 3),
                ])
            })
        })

        describe('single winner with full house after full round', () => {
            let forcedBets: ForcedBets
            let deck: Deck
            let communityCards: CommunityCards
            let players: SeatArray
            let dealer: Dealer

            beforeEach(() => {
                forcedBets = { blinds: { big: 50, small: 25 } }
                deck = new Deck(shuffleForTwoPlayersWithFullHouseWinner)
                communityCards = new CommunityCards()
                players = new Array(9).fill(null)
                players[0] = new Player(1000)
                players[1] = new Player(1000)
                dealer = new Dealer(players, 0, forcedBets, deck, communityCards)

                dealer.startHand()

                dealer.actionTaken(Action.RAISE, 500)
                dealer.actionTaken(Action.CALL)
                dealer.endBettingRound()

                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                dealer.showdown()
            })

            test('pot has been divided', () => {
                expect(players[0]?.stack()).toBe(1500)
                expect(players[1]?.stack()).toBe(500)
            })

            test('reveal winner hand', () => {
                const firstWinnerInFirstPot = dealer.winners()[0][0];
                const [seatIndex, hand, holeCards] = firstWinnerInFirstPot;
                expect(seatIndex).toBe(0)
                expect(hand.ranking()).toBe(HandRanking.FULL_HOUSE)
                expect(hand.strength()).toBe(57122)
                expect(hand.cards()).toEqual([
                    new Card(2, 3),
                    new Card(2, 0),
                    new Card(2, 1),
                    new Card(0, 0),
                    new Card(0, 3),
                ])
                expect(holeCards).toEqual([
                    new Card(2, 3),
                    new Card(2, 0),
                ])
            })
        })

        describe('all players winners', () => {
            let forcedBets: ForcedBets
            let deck: Deck
            let communityCards: CommunityCards
            let players: SeatArray
            let dealer: Dealer

            beforeEach(() => {
                forcedBets = { blinds: { big: 50, small: 25 } }
                deck = new Deck(shuffleForTwoPlayersDraw)
                communityCards = new CommunityCards()
                players = new Array(9).fill(null)
                players[0] = new Player(1000)
                players[1] = new Player(1000)
                dealer = new Dealer(players, 0, forcedBets, deck, communityCards)

                dealer.startHand()

                dealer.actionTaken(Action.RAISE, 500)
                dealer.actionTaken(Action.CALL)
                dealer.endBettingRound()

                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                dealer.showdown()
            })

            test('pot has been divided equally', () => {
                expect(players[0]?.stack()).toBe(1000)
                expect(players[1]?.stack()).toBe(1000)
            })
        })

        describe('two winners share odd pot', () => {
            let forcedBets: ForcedBets
            let deck: Deck
            let communityCards: CommunityCards
            let players: SeatArray
            let dealer: Dealer

            beforeEach(() => {
                forcedBets = { blinds: { big: 50, small: 25 } }
                deck = new Deck(shuffleForThreePlayersWithTwoWinners)
                communityCards = new CommunityCards()
                players = new Array(9).fill(null)
                players[0] = new Player(1000)
                players[1] = new Player(1000)
                players[2] = new Player(1000)
                dealer = new Dealer(players, 0, forcedBets, deck, communityCards)

                dealer.startHand()

                dealer.actionTaken(Action.RAISE, 501)
                dealer.actionTaken(Action.CALL)
                dealer.actionTaken(Action.CALL)
                dealer.endBettingRound()

                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.actionTaken(Action.CHECK)
                dealer.endBettingRound()

                dealer.showdown()
            })

            test('pot has been divided', () => {
                expect(players[0]?.stack()).toBe(499)
                expect(players[1]?.stack()).toBe(1251)
                expect(players[2]?.stack()).toBe(1250)
            })
        })


        describe('multiple pots, multiple winners', () => {
            let forcedBets: ForcedBets
            let deck: Deck
            let communityCards: CommunityCards
            let players: SeatArray
            let dealer: Dealer

            beforeEach(() => {
                forcedBets = { blinds: { big: 50, small: 25 } }
                deck = new Deck()
                communityCards = new CommunityCards()
                players = new Array(9).fill(null)
                players[0] = new Player(300)
                players[1] = new Player(200)
                players[2] = new Player(100)
                dealer = new Dealer(players, 0, forcedBets, deck, communityCards)

                dealer.startHand()
                dealer.actionTaken(Action.RAISE, 300)
                dealer.actionTaken(Action.CALL)
                dealer.actionTaken(Action.CALL)
                dealer.endBettingRound()

                communityCards = new CommunityCards()
                communityCards.deal([
                    new Card(CardRank.A, CardSuit.SPADES),
                    new Card(CardRank.K, CardSuit.SPADES),
                    new Card(CardRank.Q, CardSuit.SPADES),
                    new Card(CardRank.J, CardSuit.SPADES),
                    new Card(CardRank.T, CardSuit.SPADES),
                ])

                // ...
            })
        })

        describe('Calling on the big blind does not cause a crash', () => {
            // dealer::action_taken did not deduct the bet from the folding player, but only read it.
            // This caused player.bet() to fail, because a smaller bet than the existing one was placed.
            // This is a design problem. If bet sizes did not outlive the dealer, accessing old ones would
            // be outside of the realm of possibility.
            test('Calling on the big blind', () => {
                const forcedBets = { blinds: { big: 50, small: 25 } }
                let deck = new Deck()
                let communityCards = new CommunityCards()
                const players = new Array(9).fill(null)
                players[0] = new Player(1000)
                players[1] = new Player(1000)
                let dealer = new Dealer(players, 0, forcedBets, deck, communityCards)
                dealer.startHand()
                dealer.actionTaken(Action.CALL)
                dealer.actionTaken(Action.FOLD)
                dealer.endBettingRound()
                dealer.showdown()

                deck = new Deck()
                communityCards = new CommunityCards()
                dealer = new Dealer(players, 1, forcedBets, deck, communityCards)

                expect(() => {
                    dealer.startHand()
                }).not.toThrow()
            })
        })
    })
})