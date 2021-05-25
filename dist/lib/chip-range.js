"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChipRange = /** @class */ (function () {
    function ChipRange(min, max) {
        this.min = min;
        this.max = max;
    }
    ChipRange.prototype.contains = function (amount) {
        return this.min <= amount && amount <= this.max;
    };
    return ChipRange;
}());
exports.default = ChipRange;
//# sourceMappingURL=chip-range.js.map