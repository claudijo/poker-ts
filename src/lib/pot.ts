import assert from 'assert'
import { SeatIndex } from 'types/seat-index'
import { Chips } from 'types/chips'
import { SeatArray } from 'types/seat-array'
import Player from './player'


export default class Pot {
    private _eligiblePlayers: Array<SeatIndex> = []
    private _size: Chips = 0

    size(): Chips {
        return this._size
    }

    eligiblePlayers(): Array<SeatIndex> {
        return this._eligiblePlayers
    }

    add(amount: Chips): void {
        assert(amount >= 0, 'Cannot add a negative amount to the pot')
        this._size += amount
    }

    collectBetsFrom(players: SeatArray): Chips {
        // Find the first player who has placed a bet.
        const firstBetterIndex = players.findIndex(player => player?.betSize() ?? 0 !== 0)
        if (firstBetterIndex === -1) {
            // If no players have bet, just make all the players who are still in the pot eligible.
            // It is possible that some player has folded even if nobody has bet.
            // We would not want to keep him as an eligible player.
            this._eligiblePlayers = players.reduce((acc: Array<SeatIndex>, player:Player | null, index: SeatIndex) => {
                if (player !== null) acc.push(index)
                return acc;
            }, [])

            return 0;
        } else {
            // Find the smallest player bet on the table.
            const firstBetter = players[firstBetterIndex]
            assert(firstBetter !== null)
            const minBet = players.slice(firstBetterIndex + 1).reduce((acc: Chips, player: Player | null ) => {
                if (player !== null && player.betSize() !== 0 && player.betSize() < acc) acc = player.betSize()
                return acc;
            }, firstBetter.betSize())

            // Deduct that bet from all the players, and add it to the pot.
            this._eligiblePlayers = []
            players.forEach((player, index) => {
                if (player !== null && player.betSize() !== 0) {
                    player.takeFromBet(minBet);
                    this._size += minBet;
                    this._eligiblePlayers.push(index);
                }
            })

            return minBet;
        }
    }
}