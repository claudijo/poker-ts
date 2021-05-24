/* import assert from 'assert'
import Player from './player'

export type SeatIndex = number

export default class SeatArray extends Array<Player | null> {
    private readonly _occupancy: Array<boolean>

    constructor(numSeats) {
        super(numSeats)

        // Set the prototype explicitly when extending Array
        // See https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
        Object.setPrototypeOf(this, SeatArray.prototype)

        this.fill(null)
        this._occupancy = new Array(numSeats).fill(false)
    }

    * iterator(start: SeatIndex) {
        for (let i = start; i < this.length; i++) {
            if (this._occupancy[i]) {
                yield [i, this[i]]
            }
        }
    }

    occupancy(): Array<boolean> {
        return this._occupancy
    }

    addPlayer(seat: SeatIndex, player: Player): void {
        assert(!this._occupancy[seat], 'Given seat must not be occupied')
        this[seat] = player
        this._occupancy[seat] = true
    }

    removePlayer(seat: SeatIndex): void {
        assert(this._occupancy[seat], 'Given seat must be occupied')
        this._occupancy[seat] = false
    }


}

 */