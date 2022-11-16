export const getRegExp = function (key) {
    if (key === 'restApiRegex') {
        return new RegExp("^\\[\\w+\\]");
    } else if (key === 'innerKeyApiRegex') {
        // return new RegExp("\\{\\w+\\}", "g"); // v1
        return new RegExp("\\{[a-zA-Z0-9_\\$]+\\}", "g"); // origin: /\{[a-zA-Z0-9_\$]+\}/g
    }
    return null;
}