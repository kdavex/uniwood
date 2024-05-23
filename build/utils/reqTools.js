"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestFieldChecker = void 0;
function requestFieldChecker(fields, req) {
    const error = [];
    Object.entries(req.body).forEach(([key, value]) => {
        if (fields.includes(key) && (value === undefined || value === null))
            error.push(key);
    });
    return error;
}
exports.requestFieldChecker = requestFieldChecker;
