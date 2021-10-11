"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
var poker_1 = __importDefault(require("./facade/poker"));
var myTable = new poker_1.default({ ante: 0, smallBlind: 50, bigBlind: 100 });
myTable.sitDown(0, 2000); // seat a player at seat 0 with 1000 chips buy-in
myTable.sitDown(1, 2000); // seat a player at seat 2 with 1500 chips buy-in
myTable.sitDown(2, 2000); // seat a player at seat 5 with 1700 chips buy-in
console.log('-----start hand-----');
myTable.startHand();
console.log('-----Fold player-----');
myTable.actionTaken('call');
myTable.actionTaken('fold');
myTable.actionTaken('check');
//
//
console.log('seats', myTable.seats());
console.log('handPlayers', myTable.handPlayers());
console.log('----End betting round-----');
myTable.endBettingRound();
console.log('seats', myTable.seats());
console.log('handPlayers', myTable.handPlayers());
exports.Table = poker_1.default;
//# sourceMappingURL=index.js.map