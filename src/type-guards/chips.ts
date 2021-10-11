import { Chips } from 'types/chips'

export function isChips(chips: any): chips is Chips {
    return typeof chips === 'number'
}
