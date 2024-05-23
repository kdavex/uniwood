"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidObjectId = void 0;
function isValidObjectId(str) {
    return /^[0-9a-fA-F]{24}$/.test(str);
}
exports.isValidObjectId = isValidObjectId;
