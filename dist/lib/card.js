"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardSuit = exports.CardRank = void 0;
var CardRank;
(function (CardRank) {
    CardRank[CardRank["_2"] = 0] = "_2";
    CardRank[CardRank["_3"] = 1] = "_3";
    CardRank[CardRank["_4"] = 2] = "_4";
    CardRank[CardRank["_5"] = 3] = "_5";
    CardRank[CardRank["_6"] = 4] = "_6";
    CardRank[CardRank["_7"] = 5] = "_7";
    CardRank[CardRank["_8"] = 6] = "_8";
    CardRank[CardRank["_9"] = 7] = "_9";
    CardRank[CardRank["T"] = 8] = "T";
    CardRank[CardRank["J"] = 9] = "J";
    CardRank[CardRank["Q"] = 10] = "Q";
    CardRank[CardRank["K"] = 11] = "K";
    CardRank[CardRank["A"] = 12] = "A";
})(CardRank = exports.CardRank || (exports.CardRank = {}));
var CardSuit;
(function (CardSuit) {
    CardSuit[CardSuit["CLUBS"] = 0] = "CLUBS";
    CardSuit[CardSuit["DIAMONDS"] = 1] = "DIAMONDS";
    CardSuit[CardSuit["HEARTS"] = 2] = "HEARTS";
    CardSuit[CardSuit["SPADES"] = 3] = "SPADES";
})(CardSuit = exports.CardSuit || (exports.CardSuit = {}));
var Card = /** @class */ (function () {
    function Card(rank, suit) {
        this.rank = rank;
        this.suit = suit;
    }
    Card.compare = function (c1, c2) {
        var suitDiff = c2.suit - c1.suit;
        if (suitDiff !== 0) {
            return suitDiff;
        }
        return c2.rank - c1.rank;
    };
    return Card;
}());
exports.default = Card;
//# sourceMappingURL=card.js.map