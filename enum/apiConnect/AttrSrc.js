module.exports = class AttrSrc {
    static reqBody = 'reqBody';
    static resBody = 'resBody';
    static parse(type) {
        return type.startsWith("resBody.") ? 'resBody' : type;
    }
    static parseStatusCode(type) {
        const dotIndex = type.lastIndexOf(".");
        return type.slice(dotIndex + 1, type.length);
    }
}