import { Chips } from 'types/chips'

export function isChips(chips: Chips): chips is Chips {
    return typeof chips === 'number'
}
