"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var Pot = /** @class */ (function () {
    function Pot() {
        this._eligiblePlayers = [];
        this._size = 0;
    }
    Pot.prototype.size = function () {
        return this._size;
    };
    Pot.prototype.eligiblePlayers = function () {
        return this._eligiblePlayers;
    };
    Pot.prototype.add = function (amount) {
        assert_1.default(amount >= 0, 'Cannot add a negative amount to the pot');
        this._size += amount;
    };
    Pot.prototype.collectBetsFrom = function (players) {
        var _this = this;
        // Find the first player who has placed a bet.
        var firstBetterIndex = players.findIndex(function (player) { var _a; return (_a = player === null || player === void 0 ? void 0 : player.betSize()) !== null && _a !== void 0 ? _a : 0 !== 0; });
        if (firstBetterIndex === -1) {
            // If no players have bet, just make all the players who are still in the pot eligible.
            // It is possible that some player has folded even if nobody has bet.
            // We would not want to keep him as an eligible player.
            this._eligiblePlayers = players.reduce(function (acc, player, index) {
                if (player !== null)
                    acc.push(index);
                return acc;
            }, []);
            return 0;
        }
        else {
            // Find the smallest player bet on the table.
            var firstBetter = players[firstBetterIndex];
            assert_1.default(firstBetter !== null);
            var minBet_1 = players.slice(firstBetterIndex + 1).reduce(function (acc, player) {
                if (player !== null && player.betSize() !== 0 && player.betSize() < acc)
                    acc = player.betSize();
                return acc;
            }, firstBetter.betSize());
            // Deduct that bet from all the players, and add it to the pot.
            this._eligiblePlayers = [];
            players.forEach(function (player, index) {
                if (player !== null && player.betSize() !== 0) {
                    player.takeFromBet(minBet_1);
                    _this._size += minBet_1;
                    _this._eligiblePlayers.push(index);
                }
            });
            return minBet_1;
        }
    };
    return Pot;
}());
exports.default = Pot;
//# sourceMappingURL=pot.js.map