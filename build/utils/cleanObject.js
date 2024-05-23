"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanObject = void 0;
/**
 * Recursively Removes all null, undefined, and empty string values from an object
 * @param obj Object to clean
 */
function cleanObject(obj) {
    for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Object) {
            cleanObject(value);
            if (key.length === 0)
                delete obj[key];
            continue;
        }
        if (value === null || value === undefined || value === "")
            delete obj[key];
    }
}
exports.cleanObject = cleanObject;
