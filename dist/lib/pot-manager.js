"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pot_1 = __importDefault(require("./pot"));
var PotManager = /** @class */ (function () {
    function PotManager() {
        this._aggregateFoldedBets = 0;
        // Set once a player eligible for the newest pot has run out of chips. That pot
        // is complete: they cannot match anything wagered from here on, so the next
        // street's bets have to open a side pot instead of joining theirs.
        this._lastPotIsClosed = false;
        this._pots = [new pot_1.default()];
    }
    PotManager.prototype.pots = function () {
        return this._pots;
    };
    PotManager.prototype.betFolded = function (amount) {
        this._aggregateFoldedBets += amount;
    };
    // Folding forfeits every pot, not just the one currently being built. Only the
    // newest pot is revisited once a side pot exists, so an earlier pot would
    // otherwise keep a folded player eligible and could hand them the win.
    PotManager.prototype.playerFolded = function (seat) {
        this._pots.forEach(function (pot) { return pot.removeEligiblePlayer(seat); });
    };
    PotManager.prototype.collectBetsForm = function (players) {
        // Open the side pot lazily, so a street that nobody bets on does not leave
        // an empty pot behind for the showdown to evaluate.
        if (this._lastPotIsClosed && players.some(function (player) { return player !== null && player.betSize() !== 0; })) {
            this._pots.push(new pot_1.default());
            this._lastPotIsClosed = false;
        }
        // TODO: Return a list of transactions.
        for (;;) {
            var minBet = this._pots[this._pots.length - 1].collectBetsFrom(players);
            // Calculate the right amount of folded bets to add to the pot.
            // Logic: If 'x' is chips which a player committed to the pot and 'n' is number of (eligible) players in that pot,
            // a player can win exactly x*n chips (from that particular pot).
            var numberOfEligiblePlayers = this._pots[this._pots.length - 1].eligiblePlayers().length;
            var aggregateFoldedBetsConsumedAmount = Math.min(this._aggregateFoldedBets, numberOfEligiblePlayers * minBet);
            this._pots[this._pots.length - 1].add(aggregateFoldedBetsConsumedAmount);
            this._aggregateFoldedBets -= aggregateFoldedBetsConsumedAmount;
            if (players.filter(function (player) { return player !== null && player.betSize() !== 0; }).length) {
                this._pots.push(new pot_1.default());
                continue;
            }
            else if (this._aggregateFoldedBets !== 0) {
                this._pots[this._pots.length - 1].add(this._aggregateFoldedBets);
                this._aggregateFoldedBets = 0;
            }
            break;
        }
        var lastPot = this._pots[this._pots.length - 1];
        if (lastPot.eligiblePlayers().some(function (seat) { var _a; return ((_a = players[seat]) === null || _a === void 0 ? void 0 : _a.totalChips()) === 0; })) {
            this._lastPotIsClosed = true;
        }
    };
    return PotManager;
}());
exports.default = PotManager;
//# sourceMappingURL=pot-manager.js.map