import assert from 'assert';
import { Chips } from 'types/chips';

export default class Player {
    private _total: Chips = 0
    private _betSize: Chips = 0

    constructor(stack: Chips) {
        this._total = stack
    }

    stack(): Chips {
        return this._total - this._betSize
    }

    betSize(): Chips {
        return this._betSize
    }

    totalChips(): Chips {
        return this._total
    }

    addToStack(amount: Chips): void {
        this._total += amount
    }

    takeFromStack(amount: Chips): void {
        this._total -= amount
    }

    bet(amount: Chips): void {
        assert(amount <= this._total, 'Player cannot bet more than he/she has')
        assert(amount >= this._betSize, 'Player must bet more than he/she has previously')

        this._betSize = amount
    }

    takeFromBet(amount: Chips): void {
        assert(amount <= this._betSize, 'Cannot take from bet more than is there')
        this._total -= amount
        this._betSize -= amount
    }
}

