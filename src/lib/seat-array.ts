/*
import assert from 'assert'
import Player from './player'

export type SeatIndex = number

export default class SeatArray extends Array {
    private readonly _occupancy: Array<boolean>

    constructor(numSeats) {
        super(numSeats);
        this.fill(null);
        this._occupancy = new Array(numSeats).fill(false)
    }

    occupancy(): Array<boolean> {
        return this._occupancy
    }

    addPlayer(seat: SeatIndex, player: Player): void {
        assert(!this._occupancy[seat], 'Given seat must not be occupied')
        this[seat] = player;
        this._occupancy[seat] = true;
    }

    removePlayer(seat: SeatIndex): void {
        assert(this._occupancy[seat], 'Given seat must be occupied')
        this._occupancy[seat] = false;
    }


}
 */