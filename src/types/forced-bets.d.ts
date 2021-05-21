import { Chips } from 'types/chips'
import { Blinds  } from 'types/blinds'

export type ForcedBets = {
    ante?: Chips,
    blinds: Blinds,
}