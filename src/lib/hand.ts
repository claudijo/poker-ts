import { HoleCards } from 'types/hole-cards'
import CommunityCards from './community-cards'

export default class Hand {
    constructor(holeCards: HoleCards, communityCards: CommunityCards) {
        // TODO If community are mutated here, we need to call the constructor in Dealer differently
    }

    static compare(lhs, rhs): number {
        // TODO
        return 0
    }
}