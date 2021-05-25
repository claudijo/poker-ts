"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pot_1 = __importDefault(require("./pot"));
var PotManager = /** @class */ (function () {
    function PotManager() {
        this._aggregateFoldedBets = 0;
        this._pots = [new pot_1.default()];
    }
    PotManager.prototype.pots = function () {
        return this._pots;
    };
    PotManager.prototype.betFolded = function (amount) {
        this._aggregateFoldedBets += amount;
    };
    PotManager.prototype.collectBetsForm = function (players) {
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
    };
    return PotManager;
}());
exports.default = PotManager;
//# sourceMappingURL=pot-manager.js.map