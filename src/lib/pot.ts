import assert from 'assert'
import { SeatIndex } from 'types/seat-index'
import { Chips } from 'types/chips'
import { SeatArray } from 'types/seat-array'

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
            this._eligiblePlayers = []
            for (let index = 0; index < players.length; index++) {
                if (players[index] !== null) {
                    this._eligiblePlayers.push(index)
                }
            }

            return 0;
        } else {
            // Find the smallest player bet on the table.
            const player = players[firstBetterIndex];
            assert(player !== null)
            let minBet = player.betSize()
            assert(minBet !== undefined)

            for (let index = firstBetterIndex; index < players.length; index++) {
                const player = players[index];
                if (player !== null && player.betSize() !== 0 && player.betSize() < minBet) {
                    minBet = player.betSize()
                }
            }

            // Deduct that bet from all the players, and add it to the pot.
            this._eligiblePlayers = []
            for (let index = 0; index < players.length; index++) {
                const player = players[index];
                if (player !== null && player.betSize() !== 0) {
                    player.takeFromBet(minBet);
                    this._size += minBet;
                    this._eligiblePlayers.push(index);
                }
            }

            return minBet;
        }
    }
}