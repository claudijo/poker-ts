"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionRange = exports.Action = void 0;
var assert_1 = __importDefault(require("assert"));
var chip_range_1 = __importDefault(require("./chip-range"));
var round_1 = __importStar(require("./round"));
var Action;
(function (Action) {
    Action[Action["LEAVE"] = 0] = "LEAVE";
    Action[Action["MATCH"] = 1] = "MATCH";
    Action[Action["RAISE"] = 2] = "RAISE";
})(Action = exports.Action || (exports.Action = {}));
var ActionRange = /** @class */ (function () {
    function ActionRange(canRaise, chipRange) {
        if (chipRange === void 0) { chipRange = new chip_range_1.default(0, 0); }
        this.canRaise = canRaise;
        this.chipRange = chipRange;
    }
    return ActionRange;
}());
exports.ActionRange = ActionRange;
var BettingRound = /** @class */ (function () {
    function BettingRound(players, firstToAct, minRaise, biggestBet) {
        if (biggestBet === void 0) { biggestBet = 0; }
        this._round = new round_1.default(players.map(function (player) { return !!player; }), firstToAct);
        this._players = players;
        this._biggestBet = biggestBet;
        this._minRaise = minRaise;
        assert_1.default(firstToAct < players.length, 'Seat index must be in the valid range');
        assert_1.default(players[firstToAct], 'First player to act must exist');
    }
    BettingRound.prototype.inProgress = function () {
        return this._round.inProgress();
    };
    BettingRound.prototype.isContested = function () {
        return this._round.isContested();
    };
    BettingRound.prototype.playerToAct = function () {
        return this._round.playerToAct();
    };
    BettingRound.prototype.biggestBet = function () {
        return this._biggestBet;
    };
    BettingRound.prototype.minRaise = function () {
        return this._minRaise;
    };
    BettingRound.prototype.players = function () {
        var _this = this;
        return this._round.activePlayers().map(function (isActive, index) {
            return isActive ? _this._players[index] : null;
        });
    };
    BettingRound.prototype.activePlayers = function () {
        return this._round.activePlayers();
    };
    BettingRound.prototype.numActivePlayers = function () {
        return this._round.numActivePlayers();
    };
    BettingRound.prototype.legalActions = function () {
        var player = this._players[this._round.playerToAct()];
        assert_1.default(player !== null);
        var playerChips = player.totalChips();
        var canRaise = playerChips > this._biggestBet;
        if (canRaise) {
            var minBet = this._biggestBet + this._minRaise;
            var raiseRange = new chip_range_1.default(Math.min(minBet, playerChips), playerChips);
            return new ActionRange(canRaise, raiseRange);
        }
        else {
            return new ActionRange(canRaise);
        }
    };
    BettingRound.prototype.actionTaken = function (action, bet) {
        if (bet === void 0) { bet = 0; }
        var player = this._players[this._round.playerToAct()];
        assert_1.default(player !== null);
        if (action === Action.RAISE) {
            assert_1.default(this.isRaiseValid(bet));
            player.bet(bet);
            this._minRaise = bet - this._biggestBet;
            this._biggestBet = bet;
            var actionFlag = round_1.Action.AGGRESSIVE;
            if (player.stack() === 0) {
                actionFlag |= round_1.Action.LEAVE;
            }
            this._round.actionTaken(actionFlag);
        }
        else if (action === Action.MATCH) {
            player.bet(Math.min(this._biggestBet, player.totalChips()));
            var actionFlag = round_1.Action.PASSIVE;
            if (player.stack() === 0) {
                actionFlag |= round_1.Action.LEAVE;
            }
            this._round.actionTaken(actionFlag);
        }
        else {
            assert_1.default(action === Action.LEAVE);
            this._round.actionTaken(round_1.Action.LEAVE);
        }
    };
    BettingRound.prototype.isRaiseValid = function (bet) {
        var player = this._players[this._round.playerToAct()];
        assert_1.default(player !== null);
        var playerChips = player.stack() + player.betSize();
        var minBet = this._biggestBet + this._minRaise;
        if (playerChips > this._biggestBet && playerChips < minBet) {
            return bet === playerChips;
        }
        return bet >= minBet && bet <= playerChips;
    };
    return BettingRound;
}());
exports.default = BettingRound;
//# sourceMappingURL=betting-round.js.map