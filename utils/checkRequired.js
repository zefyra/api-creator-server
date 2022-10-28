
// const checkRequired =
module.exports = function (bodyObj, requiredKeyList) {
    let errorList = [];
    requiredKeyList.forEach((key) => {
        if (!bodyObj[key]) {
            errorList.push(`key '${key}' is required!`);
        }
    });
    return errorList;
}