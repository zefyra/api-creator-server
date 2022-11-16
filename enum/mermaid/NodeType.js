module.exports = class NodeType {
    static condition = 'condition';
    static node = 'node';

    static getPriority() {
        return [NodeType.node, NodeType.condition]; // 優先權 ==> 低, 中, 高
    }
    static autoGetNodeType(typeA, typeB) {
        if (!typeA || !typeB) {
            console.error(`autoGetNodeType: param not exist`);
            return;
        }
        const priorityList = NodeType.getPriority();
        const prA = priorityList.indexOf(typeA);
        const prB = priorityList.indexOf(typeB);

        if (prA < 0) {
            console.error(`autoGetNodeType: prA priority not exist`);
            return;
        }
        if (prB < 0) {
            console.error(`autoGetNodeType: prA priority not exist`);
            return;
        }

        if (prA > prB) {
            return typeA;
        } else {
            return typeB;
        }
    }
}