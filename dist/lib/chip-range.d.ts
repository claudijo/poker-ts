import { Chips } from "types/chips";
export default class ChipRange {
    min: Chips;
    max: Chips;
    constructor(min: Chips, max: Chips);
    contains(amount: Chips): boolean;
}
