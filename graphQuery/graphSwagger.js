

// 將GraphSchema物件轉換成swagger格式的json

module.exports = class GraphSwagger {
    graphSchemaObj = null;

    constructor(graphSchemaObj) {

        if (graphSchemaObj.constructor.name !== 'GraphSchema') {
            console.error(`graphSchemaObj is not GraphSchema`);
            return;
        }

        this.graphSchemaObj = graphSchemaObj;
    }

    convertSwaggerJson() {
        const graphSchemaObj = this.graphSchemaObj;

        // graphSchemaObj

        // graphSchemaObj.rootTypeDef

        return "{ \"aa\": \"bb\" }";
    }
}