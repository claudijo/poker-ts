"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var assert_1 = __importDefault(require("assert"));
var card_1 = __importStar(require("./card"));
var array_1 = require("../util/array");
var Deck = /** @class */ (function (_super) {
    __extends(Deck, _super);
    function Deck() {
        var _this = _super.call(this) || this;
        // Set the prototype explicitly when extending Array
        // See https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
        Object.setPrototypeOf(_this, Deck.prototype);
        _this._size = 52;
        var index = 0;
        for (var suit = card_1.CardSuit.CLUBS; suit <= card_1.CardSuit.SPADES; suit++) {
            for (var rank = card_1.CardRank._2; rank <= card_1.CardRank.A; rank++) {
                _this[index++] = new card_1.default(rank, suit);
            }
        }
        array_1.shuffle(_this);
        return _this;
    }
    Deck.prototype.fillAndShuffle = function () {
        this._size = 52;
        array_1.shuffle(this);
    };
    Deck.prototype.draw = function () {
        assert_1.default(this._size > 0, 'Cannot draw from an empty deck');
        return this[--this._size];
    };
    return Deck;
}(Array));
exports.default = Deck;
//# sourceMappingURL=deck.js.map