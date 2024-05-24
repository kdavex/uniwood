export function capitalize(text: string) {
  return trimSpace(text).replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Removes extra spaces in a string and trims it
 * @param text
 * @returns
 */
export function trimSpace(text: string) {
  return text.trim().replace(/(\s){2,}/g, " ");
}

export function stringToConstant(text: string) {
  return text.toUpperCase().replace(/ /g, "_");
}

/**
 * transforms contants to capitalized string ex. "HELLO_WORLD" to "Hello World"
 * @param text
 * @returns
 */
export function constantToCapitalize(text: string) {
  return text
    .replace(/_/g, " ")
    .replace(/(?<=\b\w)\w+/g, (l) => l.toLowerCase());
}
