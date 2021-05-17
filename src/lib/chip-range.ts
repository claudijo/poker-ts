import { Chips } from "types/chips";

export default class ChipRange {
    min: Chips
    max: Chips

    constructor(min: Chips, max: Chips) {
        this.min = min
        this.max = max
    }

    contains(amount: Chips): boolean {
        return this.min <= amount && amount <= this.max
    }
}