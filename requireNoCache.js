var path = require('path');

var _invalidateRequireCacheForFile = function (filePath) {
    delete require.cache[path.resolve(filePath)];
};

var requireNoCache = function (filePath) {
    _invalidateRequireCacheForFile(filePath);
    return require(filePath);
};

module.exports = requireNoCache;