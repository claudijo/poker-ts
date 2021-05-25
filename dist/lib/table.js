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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomaticAction = void 0;
var deck_1 = __importDefault(require("./deck"));
var community_cards_1 = __importDefault(require("./community-cards"));
var dealer_1 = __importStar(require("./dealer"));
var assert_1 = __importDefault(require("assert"));
var bit_1 = require("../util/bit");
var player_1 = __importDefault(require("./player"));
var AutomaticAction;
(function (AutomaticAction) {
    AutomaticAction[AutomaticAction["FOLD"] = 1] = "FOLD";
    AutomaticAction[AutomaticAction["CHECK_FOLD"] = 2] = "CHECK_FOLD";
    AutomaticAction[AutomaticAction["CHECK"] = 4] = "CHECK";
    AutomaticAction[AutomaticAction["CALL"] = 8] = "CALL";
    AutomaticAction[AutomaticAction["CALL_ANY"] = 16] = "CALL_ANY";
    AutomaticAction[AutomaticAction["ALL_IN"] = 32] = "ALL_IN";
})(AutomaticAction = exports.AutomaticAction || (exports.AutomaticAction = {}));
var Table = /** @class */ (function () {
    function Table(forcedBets, numSeats) {
        if (numSeats === void 0) { numSeats = 9; }
        this._firstTimeButton = true;
        this._buttonSetManually = false; // has the button been set manually
        this._button = 0;
        assert_1.default(numSeats <= 23, 'Maximum 23 players');
        this._numSeats = numSeats;
        this._forcedBets = forcedBets;
        this._table_players = new Array(numSeats).fill(null);
        this._staged = new Array(numSeats).fill(false);
        this._deck = new deck_1.default();
    }
    Table.prototype.playerToAct = function () {
        assert_1.default(this.bettingRoundInProgress(), 'Betting round must be in progress');
        assert_1.default(this._dealer !== undefined);
        return this._dealer.playerToAct();
    };
    Table.prototype.button = function () {
        assert_1.default(this.handInProgress(), 'Hand must be in progress');
        assert_1.default(this._dealer !== undefined);
        return this._dealer.button();
    };
    Table.prototype.seats = function () {
        return this._table_players;
    };
    Table.prototype.handPlayers = function () {
        assert_1.default(this.handInProgress(), 'Hand must be in progress');
        assert_1.default(this._dealer !== undefined);
        return this._dealer.players();
    };
    Table.prototype.numActivePlayers = function () {
        assert_1.default(this.handInProgress(), 'Hand must be in progress');
        assert_1.default(this._dealer !== undefined);
        return this._dealer.numActivePlayers();
    };
    Table.prototype.pots = function () {
        assert_1.default(this.handInProgress(), 'Hand must be in progress');
        assert_1.default(this._dealer !== undefined);
        return this._dealer.pots();
    };
    Table.prototype.forcedBets = function () {
        return this._forcedBets;
    };
    Table.prototype.setForcedBets = function (forcedBets) {
        assert_1.default(!this.handInProgress(), 'Hand must not be in progress');
        this._forcedBets = forcedBets;
    };
    Table.prototype.numSeats = function () {
        return this._numSeats;
    };
    Table.prototype.startHand = function (seat) {
        assert_1.default(!this.handInProgress(), 'Hand must not be in progress');
        assert_1.default(this._table_players.filter(function (player) { return player !== null; }).length >= 2, 'There must be at least 2 players at the table');
        if (seat !== undefined) {
            this._button = seat;
            this._buttonSetManually = true;
        }
        this._staged = new Array(this._numSeats).fill(false);
        this._automaticActions = new Array(this._numSeats).fill(null);
        this._handPlayers = __spreadArray([], this._table_players);
        this.incrementButton();
        this._deck.fillAndShuffle();
        this._communityCards = new community_cards_1.default();
        this._dealer = new dealer_1.default(this._handPlayers, this._button, this._forcedBets, this._deck, this._communityCards);
        this._dealer.startHand();
        this.updateTablePlayers();
    };
    Table.prototype.handInProgress = function () {
        var _a, _b;
        return (_b = (_a = this._dealer) === null || _a === void 0 ? void 0 : _a.handInProgress()) !== null && _b !== void 0 ? _b : false;
    };
    Table.prototype.bettingRoundInProgress = function () {
        assert_1.default(this.handInProgress(), 'Hand must be in progress');
        assert_1.default(this._dealer !== undefined);
        return this._dealer.bettingRoundInProgress();
    };
    Table.prototype.bettingRoundsCompleted = function () {
        assert_1.default(this.handInProgress(), 'Hand must be in progress');
        assert_1.default(this._dealer !== undefined);
        return this._dealer.bettingRoundsCompleted();
    };
    Table.prototype.roundOfBetting = function () {
        assert_1.default(this.handInProgress(), 'Hand must be in progress');
        assert_1.default(this._dealer !== undefined);
        return this._dealer.roundOfBetting();
    };
    Table.prototype.communityCards = function () {
        assert_1.default(this.handInProgress(), 'Hand must be in progress');
        assert_1.default(this._communityCards !== undefined);
        return this._communityCards;
    };
    Table.prototype.holeCards = function () {
        assert_1.default(this.handInProgress() || this.bettingRoundsCompleted(), 'Hand must be in progress or showdown must have ended');
        assert_1.default(this._dealer !== undefined);
        return this._dealer.holeCards();
    };
    Table.prototype.actionTaken = function (action, bet) {
        assert_1.default(this.bettingRoundInProgress(), 'Betting round must be in progress');
        assert_1.default(this._dealer !== undefined);
        assert_1.default(this._automaticActions !== undefined);
        this._dealer.actionTaken(action, bet);
        while (this._dealer.bettingRoundInProgress()) {
            this.amendAutomaticActions();
            var playerToAct = this.playerToAct();
            var automaticAction = this._automaticActions[playerToAct];
            if (automaticAction !== null) {
                this.takeAutomaticAction(automaticAction);
                this._automaticActions[playerToAct] = null;
            }
            else {
                break;
            }
        }
        if (this.bettingRoundInProgress() && this.singleActivePlayerRemaining()) {
            // We only need to take action for this one player, and the other automatic actions will unfold automatically.
            this.actPassively();
        }
        this.updateTablePlayers();
    };
    Table.prototype.endBettingRound = function () {
        assert_1.default(!this.bettingRoundInProgress(), 'Betting round must not be in progress');
        assert_1.default(!this.bettingRoundsCompleted(), 'Betting rounds must not be completed');
        assert_1.default(this._dealer !== undefined);
        this._dealer.endBettingRound();
        this.amendAutomaticActions();
        this.updateTablePlayers();
    };
    Table.prototype.showdown = function () {
        assert_1.default(!this.bettingRoundInProgress(), 'Betting round must not be in progress');
        assert_1.default(this.bettingRoundsCompleted(), 'Betting rounds must be completed');
        assert_1.default(this._dealer !== undefined);
        this._dealer.showdown();
        this.updateTablePlayers();
        this.standUpBustedPlayers();
    };
    Table.prototype.automaticActions = function () {
        assert_1.default(this.handInProgress(), 'Hand must be in progress');
        assert_1.default(this._automaticActions !== undefined);
        return this._automaticActions;
    };
    Table.prototype.canSetAutomaticAction = function (seat) {
        assert_1.default(this.bettingRoundInProgress(), 'Betting round must be in progress');
        assert_1.default(this._staged !== undefined);
        // (1) This is only ever true for players that have been in the hand since the start.
        // Every following sit-down is accompanied by a _staged[s] = true
        // (2) If a player is not seated at the table, he obviously cannot set his automatic actions.
        return !this._staged[seat] && this._table_players[seat] !== null;
    };
    Table.prototype.legalAutomaticActions = function (seat) {
        assert_1.default(this.canSetAutomaticAction(seat), 'Player must be allowed to set automatic actions');
        assert_1.default(this._dealer !== undefined);
        // fold, all_in -- always viable
        // check, check_fold -- viable when biggest_bet - bet_size == 0
        // call -- when biggest_bet - bet_size > 0 ("else" of the previous case)
        // call_only -- available always except when biggest_bet >= total_chips (no choice/"any" then)
        //
        // fallbacks:
        // check_fold -> fold
        // check -> nullopt
        // call_any -> check
        var biggestBet = this._dealer.biggestBet();
        var player = this._table_players[seat];
        assert_1.default(player !== null);
        var betSize = player.betSize();
        var totalChips = player.totalChips();
        var legalActions = AutomaticAction.FOLD | AutomaticAction.ALL_IN;
        var canCheck = biggestBet - betSize === 0;
        if (canCheck) {
            legalActions |= AutomaticAction.CHECK_FOLD | AutomaticAction.CHECK;
        }
        else {
            legalActions |= AutomaticAction.CALL;
        }
        if (biggestBet < totalChips) {
            legalActions |= AutomaticAction.CALL_ANY;
        }
        return legalActions;
    };
    Table.prototype.setAutomaticAction = function (seat, action) {
        assert_1.default(this.canSetAutomaticAction(seat), 'Player must be allowed to set automatic actions');
        assert_1.default(seat !== this.playerToAct(), 'Player must not be the player to act');
        assert_1.default(bit_1.bitCount(action) === 1, 'Player must pick one automatic action');
        assert_1.default(action & this.legalAutomaticActions(seat), 'Given automatic action must be legal');
        assert_1.default(this._automaticActions !== undefined);
        this._automaticActions[seat] = action;
    };
    Table.prototype.sitDown = function (seat, buyIn) {
        assert_1.default(seat < this._numSeats && seat >= 0, 'Given seat index must be valid');
        assert_1.default(this._table_players[seat] === null, 'Given seat must not be occupied');
        this._table_players[seat] = new player_1.default(buyIn);
        this._staged[seat] = true;
    };
    Table.prototype.standUp = function (seat) {
        assert_1.default(seat < this._numSeats && seat >= 0, 'Given seat index must be valid');
        assert_1.default(this._table_players[seat] !== null, 'Given seat must be occupied');
        if (this.handInProgress()) {
            assert_1.default(this.bettingRoundInProgress());
            assert_1.default(this._handPlayers !== undefined);
            if (seat === this.playerToAct()) {
                this.actionTaken(dealer_1.Action.FOLD);
                this._table_players[seat] = null;
                this._staged[seat] = true;
            }
            else if (this._handPlayers[seat] !== null) {
                this.setAutomaticAction(seat, AutomaticAction.FOLD);
                this._table_players[seat] = null;
                this._staged[seat] = true;
                if (this.singleActivePlayerRemaining()) {
                    // We only need to take action for this one player, and the other automatic actions will unfold automatically.
                    this.actPassively();
                }
            }
        }
        else {
            this._table_players[seat] = null;
        }
    };
    Table.prototype.takeAutomaticAction = function (automaticAction) {
        assert_1.default(this._dealer !== undefined);
        assert_1.default(this._handPlayers !== undefined);
        var player = this._handPlayers[this._dealer.playerToAct()];
        assert_1.default(player !== null);
        var biggestBet = this._dealer.biggestBet();
        var betGap = biggestBet - player.betSize();
        var totalChips = player.totalChips();
        switch (automaticAction) {
            case AutomaticAction.FOLD:
                return this._dealer.actionTaken(dealer_1.Action.FOLD);
            case AutomaticAction.CHECK_FOLD:
                return this._dealer.actionTaken(betGap === 0 ? dealer_1.Action.CHECK : dealer_1.Action.FOLD);
            case AutomaticAction.CHECK:
                return this._dealer.actionTaken(dealer_1.Action.CHECK);
            case AutomaticAction.CALL:
                return this._dealer.actionTaken(dealer_1.Action.CALL);
            case AutomaticAction.CALL_ANY:
                return this._dealer.actionTaken(betGap === 0 ? dealer_1.Action.CHECK : dealer_1.Action.CALL);
            case AutomaticAction.ALL_IN:
                if (totalChips < biggestBet) {
                    return this._dealer.actionTaken(dealer_1.Action.CALL);
                }
                return this._dealer.actionTaken(dealer_1.Action.RAISE, totalChips);
            default:
                assert_1.default(false);
        }
    };
    // fold, all_in -- no need to fallback, always legal
    // check_fold, check -- (if the bet_gap becomes >0 then check is no longer legal)
    // call -- you cannot lose your ability to call if you were able to do it in the first place
    // call_any -- you can lose your ability to call_any, which only leaves the normal call (doubt cleared)
    //          condition: biggest_bet >= total_chips
    Table.prototype.amendAutomaticActions = function () {
        assert_1.default(this._dealer !== undefined);
        assert_1.default(this._automaticActions !== undefined);
        assert_1.default(this._handPlayers !== undefined);
        var biggestBet = this._dealer.biggestBet();
        for (var s = 0; s < this._numSeats; s++) {
            var automaticAction = this._automaticActions[s];
            if (automaticAction !== null) {
                var player = this._handPlayers[s];
                assert_1.default(player !== null);
                var isContested = this._dealer.isContested();
                var betGap = biggestBet - player.betSize();
                var totalChips = player.totalChips();
                if (automaticAction & AutomaticAction.CHECK_FOLD && betGap > 0) {
                    this._automaticActions[s] = AutomaticAction.FOLD;
                }
                else if (automaticAction & AutomaticAction.CHECK && betGap > 0) {
                    this._automaticActions[s] = null;
                } /* else if (automaticAction & AutomaticAction.CALL && isContested) {
                    this._automaticActions[s] = null
                }*/
                else if (automaticAction & AutomaticAction.CALL_ANY && biggestBet >= totalChips) {
                    this._automaticActions[s] = AutomaticAction.CALL;
                }
            }
        }
    };
    // Make the current player act passively:
    // - check if possible or;
    // - call if possible.
    Table.prototype.actPassively = function () {
        assert_1.default(this._dealer !== undefined);
        var legalActions = this._dealer.legalActions();
        if (legalActions.action & dealer_1.Action.BET) {
            this.actionTaken(dealer_1.Action.CHECK);
        }
        else {
            assert_1.default(legalActions.action & dealer_1.Action.CALL);
            this.actionTaken(dealer_1.Action.CALL);
        }
    };
    Table.prototype.incrementButton = function () {
        assert_1.default(this._handPlayers !== undefined);
        if (this._buttonSetManually) {
            this._buttonSetManually = false;
            this._firstTimeButton = false;
        }
        else if (this._firstTimeButton) {
            var seat = this._handPlayers.findIndex(function (player) { return player !== null; });
            assert_1.default(seat !== -1);
            this._button = seat;
            this._firstTimeButton = false;
        }
        else {
            var offset = this._button + 1;
            var seat = this._handPlayers.slice(offset).findIndex(function (player) { return player !== null; });
            this._button = seat !== -1
                ? seat + offset
                : this._handPlayers.findIndex(function (player) { return player !== null; });
        }
    };
    Table.prototype.updateTablePlayers = function () {
        assert_1.default(this._handPlayers !== undefined);
        for (var s = 0; s < this._numSeats; s++) {
            if (!this._staged[s] && this._handPlayers[s] !== null) {
                assert_1.default(this._table_players[s] !== null);
                this._table_players[s] = this._handPlayers[s];
            }
        }
    };
    // A player is considered active (in class table context) if
    // he started in the current betting round, has not stood up or folded.
    Table.prototype.singleActivePlayerRemaining = function () {
        var _this = this;
        assert_1.default(this.bettingRoundInProgress());
        assert_1.default(this._dealer !== undefined);
        // What dealer::betting_round_players filter returns is all the players
        // who started the current betting round and have not folded. Players who
        // actually fold are manually discarded internally (to help with pot evaluation).
        var bettingRoundPlayers = this._dealer.bettingRoundPlayers();
        var activePlayers = bettingRoundPlayers.filter(function (player, index) {
            return player !== null && !_this._staged[index];
        });
        return activePlayers.length === 1;
    };
    Table.prototype.standUpBustedPlayers = function () {
        assert_1.default(!this.handInProgress());
        for (var s = 0; s < this._numSeats; s++) {
            var player = this._table_players[s];
            if (player !== null && player.totalChips() === 0) {
                this._table_players[s] = null;
            }
        }
    };
    return Table;
}());
exports.default = Table;
//# sourceMappingURL=table.js.map