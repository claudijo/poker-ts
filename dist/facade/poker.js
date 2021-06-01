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
Object.defineProperty(exports, "__esModule", { value: true });
// Facade for the Table class that confirms with the API of https://github.com/JankoDedic/poker.js
var table_1 = __importStar(require("../lib/table"));
var community_cards_1 = require("../lib/community-cards");
var card_1 = require("../lib/card");
var dealer_1 = require("../lib/dealer");
var cardMapper = function (card) { return ({
    // @ts-ignore
    rank: card_1.CardRank[card.rank].replace(/^_/, ''),
    // @ts-ignore
    suit: card_1.CardSuit[card.suit].toLowerCase(),
}); };
var seatArrayMapper = function (player) { return player === null
    ? null
    : {
        totalChips: player.totalChips(),
        stack: player.stack(),
        betSize: player.betSize(),
    }; };
var actionFlagToStringArray = function (actionFlag) {
    var actions = [];
    if (actionFlag && dealer_1.Action.FOLD)
        actions.push('fold');
    if (actionFlag && dealer_1.Action.CHECK)
        actions.push('check');
    if (actionFlag && dealer_1.Action.CALL)
        actions.push('call');
    if (actionFlag && dealer_1.Action.BET)
        actions.push('bet');
    if (actionFlag && dealer_1.Action.RAISE)
        actions.push('raise');
    return actions;
};
var automaticActionFlagToStringArray = function (automaticActionFlag) {
    var automaticActions = [];
    if (automaticActionFlag & table_1.AutomaticAction.FOLD)
        automaticActions.push('fold');
    if (automaticActionFlag & table_1.AutomaticAction.CHECK_FOLD)
        automaticActions.push('check/fold');
    if (automaticActionFlag & table_1.AutomaticAction.CHECK)
        automaticActions.push('check');
    if (automaticActionFlag & table_1.AutomaticAction.CALL)
        automaticActions.push('call');
    if (automaticActionFlag & table_1.AutomaticAction.CALL_ANY)
        automaticActions.push('call any');
    if (automaticActionFlag & table_1.AutomaticAction.ALL_IN)
        automaticActions.push('all-in');
    return automaticActions;
};
var stringToAutomaticActionFlag = function (automaticAction) {
    switch (automaticAction) {
        case 'fold':
            return table_1.AutomaticAction.FOLD;
        case 'check/fold':
            return table_1.AutomaticAction.CHECK_FOLD;
        case 'check':
            return table_1.AutomaticAction.CHECK;
        case 'call':
            return table_1.AutomaticAction.CALL;
        case 'call any':
            return table_1.AutomaticAction.CALL_ANY;
        case 'all-in':
            return table_1.AutomaticAction.ALL_IN;
    }
};
var Poker = /** @class */ (function () {
    function Poker(forcedBets, numSeats) {
        var ante = forcedBets.ante, big = forcedBets.bigBlind, small = forcedBets.smallBlind;
        this._table = new table_1.default({ ante: ante, blinds: { big: big, small: small } }, numSeats);
    }
    Poker.prototype.playerToAct = function () {
        return this._table.playerToAct();
    };
    Poker.prototype.button = function () {
        return this._table.button();
    };
    Poker.prototype.seats = function () {
        return this._table.seats().map(seatArrayMapper);
    };
    Poker.prototype.handPlayers = function () {
        return this._table.handPlayers().map(seatArrayMapper);
    };
    Poker.prototype.numActivePlayers = function () {
        return this._table.numActivePlayers();
    };
    Poker.prototype.pots = function () {
        return this._table.pots().map(function (pot) { return ({
            size: pot.size(),
            eligiblePlayers: pot.eligiblePlayers(),
        }); });
    };
    Poker.prototype.forcedBets = function () {
        var _a = this._table.forcedBets(), _b = _a.ante, ante = _b === void 0 ? 0 : _b, _c = _a.blinds, bigBlind = _c.big, smallBlind = _c.small;
        return {
            ante: ante,
            smallBlind: smallBlind,
            bigBlind: bigBlind,
        };
    };
    Poker.prototype.setForcedBets = function (forcedBets) {
        var ante = forcedBets.ante, big = forcedBets.bigBlind, small = forcedBets.smallBlind;
        this._table.setForcedBets({ ante: ante, blinds: { small: small, big: big } });
    };
    Poker.prototype.numSeats = function () {
        return this._table.numSeats();
    };
    Poker.prototype.startHand = function () {
        this._table.startHand();
    };
    Poker.prototype.isHandInProgress = function () {
        return this._table.handInProgress();
    };
    Poker.prototype.isBettingRoundInProgress = function () {
        return this._table.bettingRoundInProgress();
    };
    Poker.prototype.areBettingRoundsCompleted = function () {
        return this._table.bettingRoundsCompleted();
    };
    Poker.prototype.roundOfBetting = function () {
        var rob = this._table.roundOfBetting();
        // @ts-ignore
        return community_cards_1.RoundOfBetting[rob].toLowerCase();
    };
    Poker.prototype.communityCards = function () {
        return this._table.communityCards().cards().map(cardMapper);
    };
    Poker.prototype.legalActions = function () {
        var legalAction = this._table.legalActions();
        return {
            actions: actionFlagToStringArray(legalAction.action),
            chipRange: legalAction.chipRange
        };
    };
    Poker.prototype.holeCards = function () {
        return this._table.holeCards().map(function (cards) {
            return cards === null
                ? null
                : cards.map(cardMapper);
        });
    };
    Poker.prototype.actionTaken = function (action, betSize) {
        this._table.actionTaken(dealer_1.Action[action.toUpperCase()], betSize);
    };
    Poker.prototype.endBettingRound = function () {
        this._table.endBettingRound();
    };
    Poker.prototype.showdown = function () {
        this._table.showdown();
    };
    Poker.prototype.automaticActions = function () {
        return this._table.automaticActions().map(function (action) {
            return action === null
                ? null
                : automaticActionFlagToStringArray(action)[0];
        });
    };
    Poker.prototype.canSetAutomaticActions = function (seatIndex) {
        return this._table.canSetAutomaticAction(seatIndex);
    };
    Poker.prototype.legalAutomaticActions = function (seatIndex) {
        var automaticActionFlag = this._table.legalAutomaticActions(seatIndex);
        return automaticActionFlagToStringArray(automaticActionFlag);
    };
    Poker.prototype.setAutomaticAction = function (seatIndex, action) {
        var automaticAction = stringToAutomaticActionFlag(action);
        this._table.setAutomaticAction(seatIndex, automaticAction);
    };
    Poker.prototype.sitDown = function (seatIndex, buyIn) {
        this._table.sitDown(seatIndex, buyIn);
    };
    Poker.prototype.standUp = function (seatIndex) {
        this._table.standUp(seatIndex);
    };
    return Poker;
}());
exports.default = Poker;
//# sourceMappingURL=poker.js.map