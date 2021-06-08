import { SeatArray } from '../../src/types/seat-array'
import PotManager from '../../src/lib/pot-manager'
import Player from '../../src/lib/player'

describe('Pot Manager', () => {
    test('collect bets', () => {
        const players: SeatArray = new Array(9).fill(null)
        players[0] = new Player(100)
        players[1] = new Player(100)
        players[2] = new Player(100)
        players[0].bet(20)
        players[1].bet(40)
        players[2].bet(60)
        const potManager = new PotManager()
        potManager.collectBetsForm(players)
        expect(potManager.pots().length).toBe(3)
        expect(potManager.pots()[0].size()).toBe(60)
        expect(potManager.pots()[1].size()).toBe(40)
        expect(potManager.pots()[2].size()).toBe(20)
    })
})