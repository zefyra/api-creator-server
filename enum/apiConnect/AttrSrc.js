module.exports = class AttrSrc {
    static reqBody = 'reqBody';
    static resBody = 'resBody';
    static parse(type) {
        // type: 'resBody.200'
        return type.startsWith("resBody.") ? 'resBody' : type;
    }
    static parseStatusCode(type) {
        const dotIndex = type.lastIndexOf(".");
        if (dotIndex < 0) {
            return null;
        }
        return type.slice(dotIndex + 1, type.length);
    }
}