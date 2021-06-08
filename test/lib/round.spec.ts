import Round, { Action } from '../../src/lib/round'
import { SeatIndex } from '../../src/types/seat-index'

describe('Round', () => {
    test('two leave, one of which is contesting do not result in round being over', () => {
        const players = [true, true, true]
        const round = new Round(players, 0)
        round.actionTaken(Action.AGGRESSIVE)

        expect(round.inProgress()).toBeTruthy()
    })

    test('round construction', () => {
        const players = [true, true, true]
        const round = new Round(players, 0)

        expect(round.inProgress()).toBeTruthy()
        expect(round.playerToAct()).toBe(round.lastAggressiveActor())
        expect(round.playerToAct()).toBe(0)
        expect(round.numActivePlayers()).toBe(3)
    })

    describe('there are only 2 players in the round', () => {
        let round: Round
        beforeEach(() => {
            const players = [true, true, false, false, false, false, false, false]
            round = new Round(players, 0)
        })

        describe('there was no action in the round yet', () => {

            test('precondition', () => {
                expect(round.playerToAct()).toBe(0)
                expect(round.lastAggressiveActor()).toBe(0)
                expect(round.inProgress()).toBeTruthy()
                expect(round.numActivePlayers()).toBe(2)
            })

            describe('the first player acts aggressively', () => {
                beforeEach(() => {
                    round.actionTaken(Action.AGGRESSIVE)
                })

                test('the last aggressive actor remains unchanged', () => {
                    expect(round.lastAggressiveActor()).toBe(0)
                })

                test('the second player becomes the player to act', () => {
                    expect(round.playerToAct()).toBe(1)
                })

                test('the round is not over', () => {
                    expect(round.inProgress()).toBeTruthy()
                })

                test('there are still 2 active players', () => {
                    expect(round.numActivePlayers()).toBe(2)
                })
            })

            describe('the first player acts aggressively and leaves', () => {
                beforeEach(() => {
                    round.actionTaken(Action.AGGRESSIVE | Action.LEAVE)
                })

                test('the last aggressive actor remains unchanged', () => {
                    expect(round.lastAggressiveActor()).toBe(0)
                })

                test('the second player becomes the player to act', () => {
                    expect(round.playerToAct()).toBe(1)
                })

                test('the round is not over', () => {
                    expect(round.inProgress()).toBeTruthy()
                })

                test('there is 1 active player', () => {
                    expect(round.numActivePlayers()).toBe(1)
                })
            })

            describe('the first player acts passively', () => {
                beforeEach(() => {
                    round.actionTaken(Action.PASSIVE)
                })

                test('the last aggressive actor remains unchanged', () => {
                    expect(round.lastAggressiveActor()).toBe(0)
                })

                test('the second player becomes the player to act', () => {
                    expect(round.playerToAct()).toBe(1)
                })

                test('the round is not over', () => {
                    expect(round.inProgress()).toBeTruthy()
                })

                test('there are still 2 active players', () => {
                    expect(round.numActivePlayers()).toBe(2)
                })
            })

            describe('the first player acts passively and leaves', () => {
                beforeEach(() => {
                    round.actionTaken(Action.PASSIVE | Action.LEAVE)
                })

                test('the round is not over', () => {
                    expect(round.inProgress()).toBeTruthy()
                })
            })

            describe('the first player leaves', () => {
                beforeEach(() => {
                    round.actionTaken(Action.LEAVE)
                })

                test('round is over', () => {
                    expect(round.inProgress()).toBeFalsy()
                })
            })
        })

        describe('the next player is the last aggressive actor', () => {
            beforeEach(() => {
                round.actionTaken(Action.AGGRESSIVE)
            })

            test('precondition', () => {
                expect(round.playerToAct()).toBe(1)
                expect(round.lastAggressiveActor()).toBe(0)
                expect(round.inProgress()).toBeTruthy()
                expect(round.numActivePlayers()).toBe(2)
            })

            describe('the player to act acts aggressively', () => {
                beforeEach(() => {
                    round.actionTaken(Action.AGGRESSIVE)
                })

                test('the player to act becomes the last aggressive actor', () => {
                    expect(round.lastAggressiveActor()).toBe(1)
                })

                test('the last aggressive actor becomes the player to act', () => {
                    expect(round.playerToAct()).toBe(0)
                })

                test('the round is not over', () => {
                    expect(round.inProgress()).toBeTruthy()
                })

                test('there are still 2 active players', () => {
                    expect(round.numActivePlayers()).toBe(2)
                })
            })

            describe('he player to act acts aggressively and leaves', () => {
                beforeEach(() => {
                    round.actionTaken(Action.AGGRESSIVE | Action.LEAVE)
                })

                test('the player to act becomes the last aggressive actor', () => {
                    expect(round.lastAggressiveActor()).toBe(1)
                })

                test('the last aggressive actor becomes the player to act', () => {
                    expect(round.playerToAct()).toBe(0)
                })

                test('the round is not over', () => {
                    expect(round.inProgress()).toBeTruthy()
                })

                test('there is 1 active player', () => {
                    expect(round.numActivePlayers()).toBe(1)
                })
            })

            describe('the current player acts passively', () => {
                beforeEach(() => {
                    round.actionTaken(Action.PASSIVE)
                })

                test('the round is over', () => {
                    expect(round.inProgress()).toBeFalsy()
                })
            })

            describe('the player to act acts passively and leaves', () => {
                beforeEach(() => {
                    round.actionTaken(Action.PASSIVE | Action.LEAVE)
                })

                test('the round is over', () => {
                    expect(round.inProgress()).toBeFalsy()
                })
            })

            describe('the player to act leaves', () => {
                beforeEach(() => {
                    round.actionTaken(Action.LEAVE)
                })

                test('the round is over', () => {
                    expect(round.inProgress()).toBeFalsy()
                })
            })

        })
    })

    describe('there are more than 2 players in the round', () => {
        let round: Round
        let initialNumActivePlayers: number
        beforeEach(() => {
            const players = [true, true, true, false, false, false, false, false]
            round = new Round(players, 0)
            initialNumActivePlayers = round.numActivePlayers()
        })

        test('precondition', () => {
            expect(round.playerToAct()).toBe(0)
            expect(round.lastAggressiveActor()).toBe(0)
            expect(round.inProgress()).toBeTruthy()
            expect(round.numActivePlayers()).toBe(3)
        })

        describe('the player to act acts aggressively', () => {
            beforeEach(() => {
                round.actionTaken(Action.AGGRESSIVE)
            })

            test('the last aggressive actor remains unchanged', () => {
                expect(round.lastAggressiveActor()).toBe(0)
            })

            test('the next player becomes the player to act', () => {
                expect(round.playerToAct()).toBe(1)
            })

            test('the round is not over', () => {
                expect(round.inProgress()).toBeTruthy()
            })

            test('the number of active players remains unchanged', () => {
                expect(round.numActivePlayers()).toBe(initialNumActivePlayers)
            })
        })

        describe('the player to act acts aggressively and leaves', () => {
            beforeEach(() => {
                round.actionTaken(Action.AGGRESSIVE | Action.LEAVE)
            })

            test('the last aggressive actor remains unchanged', () => {
                expect(round.lastAggressiveActor()).toBe(0)
            })

            test('the next player becomes the player to act', () => {
                expect(round.playerToAct()).toBe(1)
            })

            test('the round is not over', () => {
                expect(round.inProgress()).toBeTruthy()
            })

            test('there is one less active player', () => {
                expect(round.numActivePlayers()).toBe(initialNumActivePlayers - 1)
            })
        })

        describe('the player to act acts passively', () => {
            beforeEach(() => {
                round.actionTaken(Action.PASSIVE)
            })

            test('the last aggressive actor remains unchanged', () => {
                expect(round.lastAggressiveActor()).toBe(0)
            })

            test('the next player becomes the player to act', () => {
                expect(round.playerToAct()).toBe(1)
            })

            test('the round is not over', () => {
                expect(round.inProgress()).toBeTruthy()
            })

            test('the number of active players remains unchanged', () => {
                expect(round.numActivePlayers()).toBe(initialNumActivePlayers)
            })
        })

        describe('the player to act acts passively and leaves', () => {
            beforeEach(() => {
                round.actionTaken(Action.PASSIVE | Action.LEAVE)
            })

            test('the last aggressive actor remains unchanged', () => {
                expect(round.lastAggressiveActor()).toBe(0)
            })

            test('the next player becomes the player to act', () => {
                expect(round.playerToAct()).toBe(1)
            })

            test('the round is not over', () => {
                expect(round.inProgress()).toBeTruthy()
            })

            test('there is one less active player', () => {
                expect(round.numActivePlayers()).toBe(initialNumActivePlayers - 1)
            })
        })

        describe('the player to act leaves', () => {
            beforeEach(() => {
                round.actionTaken(Action.LEAVE)
            })

            test('the last aggressive actor remains unchanged', () => {
                expect(round.lastAggressiveActor()).toBe(0)
            })

            test('the next player becomes the player to act', () => {
                expect(round.playerToAct()).toBe(1)
            })

            test('the round is not over', () => {
                expect(round.inProgress()).toBeTruthy()
            })

            test('there is one less active player', () => {
                expect(round.numActivePlayers()).toBe(initialNumActivePlayers - 1)
            })
        })
    })

    describe('there are 3 players and the first one acts first', () => {
        let players: Array<boolean>
        let current: SeatIndex
        beforeEach(() => {
            players = [true, true, true, false, false, false, false, false]
            current = 0
        })

        // Test for first action (_is_next_player_contested) exception.
        describe('a round', () => {
            let round: Round
            beforeEach(() => {
                round = round = new Round(players, current)
            })

            test('precondition', () => {
                expect(round.inProgress()).toBeTruthy()
            })
        })

        // Test for round end by action reaching _last_aggressive_actor.
        describe('a round', () => {
            let round: Round
            beforeEach(() => {
                round = round = new Round(players, current)
            })

            describe('the first two players leave', () => {
                beforeEach(() => {
                    round.actionTaken(Action.LEAVE)
                    round.actionTaken(Action.LEAVE)
                })

                test('the round is over', () => {
                    expect(round.inProgress()).toBeFalsy()

                    // Round should end because of _num_active_players being 1
                    expect(round.numActivePlayers()).toBe(1)
                })
            })
        })

        describe('a round', () => {
            let round: Round
            beforeEach(() => {
                round = round = new Round(players, current)
            })

            describe('the first player leaves, and the other two act passively', () => {
                beforeEach(() => {
                    round.actionTaken(Action.LEAVE)
                    round.actionTaken(Action.PASSIVE)
                    round.actionTaken(Action.PASSIVE)
                })

                test('the round is over', () => {
                    expect(round.inProgress()).toBeFalsy()
                })
            })
        })
    })
})
