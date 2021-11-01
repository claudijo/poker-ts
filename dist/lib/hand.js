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
exports.HandRanking = void 0;
var assert_1 = __importDefault(require("assert"));
var card_1 = __importStar(require("./card"));
var array_1 = require("../util/array");
var HandRanking;
(function (HandRanking) {
    HandRanking[HandRanking["HIGH_CARD"] = 0] = "HIGH_CARD";
    HandRanking[HandRanking["PAIR"] = 1] = "PAIR";
    HandRanking[HandRanking["TWO_PAIR"] = 2] = "TWO_PAIR";
    HandRanking[HandRanking["THREE_OF_A_KIND"] = 3] = "THREE_OF_A_KIND";
    HandRanking[HandRanking["STRAIGHT"] = 4] = "STRAIGHT";
    HandRanking[HandRanking["FLUSH"] = 5] = "FLUSH";
    HandRanking[HandRanking["FULL_HOUSE"] = 6] = "FULL_HOUSE";
    HandRanking[HandRanking["FOUR_OF_A_KIND"] = 7] = "FOUR_OF_A_KIND";
    HandRanking[HandRanking["STRAIGHT_FLUSH"] = 8] = "STRAIGHT_FLUSH";
    HandRanking[HandRanking["ROYAL_FLUSH"] = 9] = "ROYAL_FLUSH";
})(HandRanking = exports.HandRanking || (exports.HandRanking = {}));
var Hand = /** @class */ (function () {
    function Hand(ranking, strength, cards) {
        assert_1.default(cards.length === 5);
        this._cards = cards;
        this._ranking = ranking;
        this._strength = strength;
    }
    Hand.create = function (holeCards, communityCards) {
        assert_1.default(communityCards.cards().length === 5, 'All community cards must be dealt');
        var cards = __spreadArray(__spreadArray([], holeCards), communityCards.cards());
        return Hand.of(cards);
    };
    Hand.of = function (cards) {
        assert_1.default(cards.length === 7);
        var hand1 = Hand._highLowHandEval(cards);
        var hand2 = Hand._straightFlushEval(cards);
        if (hand2 !== null) {
            return array_1.findMax([hand1, hand2], Hand.compare);
        }
        return hand1;
    };
    Hand.compare = function (h1, h2) {
        var rankingDiff = h2.ranking() - h1.ranking();
        if (rankingDiff !== 0) {
            return rankingDiff;
        }
        return h2.strength() - h1.strength();
    };
    Hand.nextRank = function (cards) {
        assert_1.default(cards.length !== 0);
        var firstRank = cards[0].rank;
        var secondRankIndex = cards.findIndex(function (card) { return card.rank !== firstRank; });
        return {
            rank: firstRank,
            count: secondRankIndex !== -1 ? secondRankIndex : cards.length,
        };
    };
    Hand.getStrength = function (cards) {
        assert_1.default(cards.length === 5);
        var sum = 0;
        var multiplier = Math.pow(13, 4);
        for (;;) {
            var _a = this.nextRank(cards), rank = _a.rank, count = _a.count;
            sum += multiplier * rank;
            cards = cards.slice(count);
            if (cards.length !== 0) {
                multiplier /= 13;
            }
            else {
                break;
            }
        }
        return sum;
    };
    // If there are >=5 cards with the same suit, return a span containing all of
    // them.
    Hand.getSuitedCards = function (cards) {
        assert_1.default(cards.length === 7);
        cards.sort(card_1.default.compare);
        var first = 0;
        for (;;) {
            var last = cards.slice(first + 1).findIndex(function (card) { return card.suit !== cards[first].suit; });
            if (last === -1) {
                last = cards.length;
            }
            else {
                last += first + 1;
            }
            if (last - first >= 5) {
                return cards.slice(first, last);
            }
            else if (last === cards.length) {
                return null;
            }
            first = last;
        }
    };
    // EXPECTS: 'cards' is a descending range of cards with unique ranks.
    // Returns the subrange which contains the cards forming a straight. Ranks of
    // cards in the resulting range are r, r-1, r-2... except for the wheel.
    Hand.getStraightCards = function (cards) {
        assert_1.default(cards.length >= 5);
        var first = 0;
        for (;;) {
            var last = array_1.findIndexAdjacent(cards.slice(first), function (c1, c2) { return c1.rank !== c2.rank + 1; });
            if (last === -1) {
                last = cards.length;
            }
            else {
                last += first + 1;
            }
            if (last - first >= 5) {
                return cards.slice(first, first + 5);
            }
            else if (last - first === 4) {
                if (cards[first].rank === card_1.CardRank._5 && cards[0].rank === card_1.CardRank.A) {
                    array_1.rotate(cards, first);
                    return cards.slice(0, 5);
                }
            }
            else if (cards.length - last < 4) {
                return null;
            }
            first = last;
        }
    };
    Hand._highLowHandEval = function (cards /* size = 7 */) {
        assert_1.default(cards.length === 7);
        cards = __spreadArray([], cards);
        var rankOccurrences = new Array(13).fill(0);
        for (var _i = 0, cards_1 = cards; _i < cards_1.length; _i++) {
            var card = cards_1[_i];
            rankOccurrences[card.rank] += 1;
        }
        cards.sort(function (c1, c2) {
            if (rankOccurrences[c1.rank] === rankOccurrences[c2.rank]) {
                return c2.rank - c1.rank;
            }
            return rankOccurrences[c2.rank] - rankOccurrences[c1.rank];
        });
        var ranking;
        var count = Hand.nextRank(cards).count;
        if (count === 4) {
            cards = __spreadArray(__spreadArray([], cards.slice(0, 4)), cards.slice(5).sort(function (c1, c2) { return c2.rank - c1.rank; }));
            ranking = HandRanking.FOUR_OF_A_KIND;
        }
        else if (count === 3) {
            var tmp = Hand.nextRank(cards.slice(-4));
            if (tmp.count === 2) {
                ranking = HandRanking.FULL_HOUSE;
            }
            else {
                ranking = HandRanking.THREE_OF_A_KIND;
            }
        }
        else if (count === 2) {
            var tmp = Hand.nextRank(cards.slice(-5));
            if (tmp.count === 2) {
                ranking = HandRanking.TWO_PAIR;
            }
            else {
                ranking = HandRanking.PAIR;
            }
        }
        else {
            ranking = HandRanking.HIGH_CARD;
        }
        var handCards = cards.slice(0, 5);
        var strength = Hand.getStrength(handCards);
        return new Hand(ranking, strength, handCards);
    };
    Hand._straightFlushEval = function (cards) {
        assert_1.default(cards.length === 7);
        cards = __spreadArray([], cards);
        var suitedCards = Hand.getSuitedCards(cards);
        if (suitedCards !== null) {
            var straightCards = this.getStraightCards(suitedCards);
            if (straightCards !== null) {
                var ranking = void 0;
                var strength = void 0;
                if (straightCards[0].rank === card_1.CardRank.A) {
                    ranking = HandRanking.ROYAL_FLUSH;
                    strength = 0;
                }
                else {
                    ranking = HandRanking.STRAIGHT_FLUSH;
                    strength = straightCards[0].rank;
                }
                var handCards = straightCards.slice(0, 5);
                return new Hand(ranking, strength, handCards);
            }
            else {
                var ranking = HandRanking.FLUSH;
                var handCards = suitedCards.slice(0, 5);
                var strength = this.getStrength(handCards);
                return new Hand(ranking, strength, handCards);
            }
        }
        else {
            cards.sort(function (c1, c2) { return c2.rank - c1.rank; });
            cards = array_1.unique(cards, function (c1, c2) { return c1.rank !== c2.rank; });
            if (cards.length < 5) {
                return null;
            }
            else {
                var straightCards = this.getStraightCards(cards);
                if (straightCards !== null) {
                    var ranking = HandRanking.STRAIGHT;
                    var strength = straightCards[0].rank;
                    return new Hand(ranking, strength, straightCards);
                }
            }
        }
        return null;
    };
    Hand.prototype.ranking = function () {
        return this._ranking;
    };
    Hand.prototype.strength = function () {
        return this._strength;
    };
    Hand.prototype.cards = function () {
        return this._cards;
    };
    return Hand;
}());
exports.default = Hand;
//# sourceMappingURL=hand.js.map