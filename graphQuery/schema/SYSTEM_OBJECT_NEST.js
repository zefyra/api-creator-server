const GraphType = require("../graphType");

const schema = `
  type Friend {
    id: Int!
    enabled: Boolean!
    roleName: String
    resourceName: String
    parentResource: String
  }
  type ${GraphType.SYSTEM_OBJECT_NEST} {
    data {
      aaa: String
    }
  }
`;

module.exports = schema;
