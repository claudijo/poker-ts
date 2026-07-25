import Pot from './pot'
import { Chips } from 'types/chips'
import { SeatArray } from 'types/seat-array'
import { SeatIndex } from 'types/seat-index'

export default class PotManager {
    private readonly _pots: Pot[]
    private _aggregateFoldedBets: Chips = 0
    // Set once a player eligible for the newest pot has run out of chips. That pot
    // is complete: they cannot match anything wagered from here on, so the next
    // street's bets have to open a side pot instead of joining theirs.
    private _lastPotIsClosed: boolean = false

    constructor() {
        this._pots = [new Pot()]
    }

    pots(): Pot[] {
        return this._pots
    }

    betFolded(amount): void {
        this._aggregateFoldedBets += amount
    }

    // Folding forfeits every pot, not just the one currently being built. Only the
    // newest pot is revisited once a side pot exists, so an earlier pot would
    // otherwise keep a folded player eligible and could hand them the win.
    playerFolded(seat: SeatIndex): void {
        this._pots.forEach(pot => pot.removeEligiblePlayer(seat))
    }

    collectBetsForm(players: SeatArray): void {
        // Open the side pot lazily, so a street that nobody bets on does not leave
        // an empty pot behind for the showdown to evaluate.
        if (this._lastPotIsClosed && players.some(player => player !== null && player.betSize() !== 0)) {
            this._pots.push(new Pot())
            this._lastPotIsClosed = false
        }

        // TODO: Return a list of transactions.
        for(;;) {
            const minBet = this._pots[this._pots.length - 1].collectBetsFrom(players);

            // Calculate the right amount of folded bets to add to the pot.
            // Logic: If 'x' is chips which a player committed to the pot and 'n' is number of (eligible) players in that pot,
            // a player can win exactly x*n chips (from that particular pot).
            const numberOfEligiblePlayers = this._pots[this._pots.length - 1].eligiblePlayers().length;
            const aggregateFoldedBetsConsumedAmount = Math.min(this._aggregateFoldedBets, numberOfEligiblePlayers * minBet);
            this._pots[this._pots.length - 1].add(aggregateFoldedBetsConsumedAmount);
            this._aggregateFoldedBets -= aggregateFoldedBetsConsumedAmount;

            if (players.filter(player => player !== null && player.betSize() !== 0).length) {
                this._pots.push(new Pot())
                continue;
            } else if (this._aggregateFoldedBets !== 0) {
                this._pots[this._pots.length - 1].add(this._aggregateFoldedBets);
                this._aggregateFoldedBets = 0;
            }

            break;
        }

        const lastPot = this._pots[this._pots.length - 1];
        if (lastPot.eligiblePlayers().some(seat => players[seat]?.totalChips() === 0)) {
            this._lastPotIsClosed = true;
        }
    }
}