"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bitCount = void 0;
// https://graphics.stanford.edu/~seander/bithacks.html
// Count bits for 32-bit integers
function bitCount(n) {
    n = n - ((n >> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
}
exports.bitCount = bitCount;
//# sourceMappingURL=bit.js.map