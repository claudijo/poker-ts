"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var chips_1 = require("../type-guards/chips");
var Player = /** @class */ (function () {
    function Player(arg) {
        this._total = 0;
        this._betSize = 0;
        if (chips_1.isChips(arg)) {
            this._total = arg;
        }
        else if (arg instanceof Player) {
            this._total = arg._total;
            this._betSize = arg._betSize;
        }
        else {
            throw new Error('Invalid argument');
        }
    }
    Player.prototype.stack = function () {
        return this._total - this._betSize;
    };
    Player.prototype.betSize = function () {
        return this._betSize;
    };
    Player.prototype.totalChips = function () {
        return this._total;
    };
    Player.prototype.addToStack = function (amount) {
        this._total += amount;
    };
    Player.prototype.takeFromStack = function (amount) {
        this._total -= amount;
    };
    Player.prototype.bet = function (amount) {
        assert_1.default(amount <= this._total, 'Player cannot bet more than he/she has');
        assert_1.default(amount >= this._betSize, 'Player must bet more than he/she has previously');
        this._betSize = amount;
    };
    Player.prototype.takeFromBet = function (amount) {
        assert_1.default(amount <= this._betSize, 'Cannot take from bet more than is there');
        this._total -= amount;
        this._betSize -= amount;
    };
    return Player;
}());
exports.default = Player;
//# sourceMappingURL=player.js.map