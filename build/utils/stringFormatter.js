"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constantToCapitalize = exports.trimSpace = exports.capitalize = void 0;
/**
 * Capitalizes the first letter of each word in a string and removes extra spaces
 * @param text
 * @returns
 */
function capitalize(text) {
    return trimSpace(text).replace(/\b\w/g, (l) => l.toUpperCase());
}
exports.capitalize = capitalize;
/**
 * Removes extra spaces in a string and trims it
 * @param text
 * @returns
 */
function trimSpace(text) {
    return text.trim().replace(/(\s){2,}/g, " ");
}
exports.trimSpace = trimSpace;
/**
 * transforms contants to capitalized string ex. "HELLO_WORLD" to "Hello World"
 * @param text
 * @returns
 */
function constantToCapitalize(text) {
    return text
        .replace(/_/g, " ")
        .replace(/(?<=\b\w)\w+/g, (l) => l.toLowerCase());
}
exports.constantToCapitalize = constantToCapitalize;
