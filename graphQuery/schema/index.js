
const schemaContext = require.context('.', true, /[A-Za-z0-9-_,.\s]+\.js$/i);


module.exports = class GraphSchema {
    constructor(graphTypeKey) {
        console.log('GraphSchema', graphTypeKey);
        console.log('schemaContext', schemaContext);
    }
}