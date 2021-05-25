"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMax = exports.unique = exports.rotate = exports.nextOrWrap = exports.findIndexAdjacent = exports.shuffle = void 0;
var crypto_1 = require("crypto");
var assert_1 = __importDefault(require("assert"));
function shuffle(array) {
    var _a;
    for (var index = array.length - 1; index > 0; index--) {
        var newIndex = crypto_1.randomInt(index + 1);
        _a = [array[newIndex], array[index]], array[index] = _a[0], array[newIndex] = _a[1];
    }
}
exports.shuffle = shuffle;
function findIndexAdjacent(array, predicate) {
    if (predicate === void 0) { predicate = function (first, second) { return first === second; }; }
    var first = array[0];
    for (var index = 1; index < array.length; index++) {
        var second = array[index];
        if (predicate(first, second)) {
            return index - 1;
        }
        first = second;
    }
    return -1;
}
exports.findIndexAdjacent = findIndexAdjacent;
function nextOrWrap(array, currentIndex) {
    do {
        currentIndex++;
        if (currentIndex === array.length)
            currentIndex = 0;
    } while (array[currentIndex] === null);
    return currentIndex;
}
exports.nextOrWrap = nextOrWrap;
function rotate(array, count) {
    count -= array.length * Math.floor(count / array.length);
    array.push.apply(array, array.splice(0, count));
}
exports.rotate = rotate;
// Remove consecutive (adjacent) duplicates
function unique(array, predicate) {
    if (predicate === void 0) { predicate = function (first, second) { return first !== second; }; }
    if (array.length === 0) {
        return array;
    }
    return array.slice(1).reduce(function (acc, item) {
        if (predicate(acc[acc.length - 1], item)) {
            acc.push(item);
        }
        return acc;
    }, [array[0]]);
}
exports.unique = unique;
function findMax(array, compare) {
    assert_1.default(array.length > 0);
    return array.sort(compare)[0];
}
exports.findMax = findMax;
//# sourceMappingURL=array.js.map