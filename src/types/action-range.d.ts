import ChipRange from '../lib/chip-range'

// TODO: There is a ActionRange class in Dealer... consolidate
export type ActionRange = {
    canRaise: boolean,
    chipRange?: ChipRange
}