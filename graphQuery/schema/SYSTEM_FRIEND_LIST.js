const GraphType = require("../graphType");

const schema = `
  type Friend {
    id: Int!
    enabled: Boolean!
    roleName: String
    resourceName: String
    parentResource: String
  }
  type ${GraphType.SYSTEM_FRIEND_LIST} {
    data: [Permission]!
    code: String
  }
`;

module.exports = schema;
