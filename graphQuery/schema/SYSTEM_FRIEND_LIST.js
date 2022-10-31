const GraphType = require("../graphType");

// const schema = `
//   query {
//     user(name: "Fong") {
//       id
//       name
//     }
//   }
// `;

// const schema = `
//   type User {
//     name: String
//     id: Int
//   }
//   query {
//     uuu: User(name: "Fong") {
//       id
//       name
//     }
//   }
// `;


// query {
//   uuu: User(name: "Fong") { // uuu被認定是alias
//     id
//     name
//   }
// }



// query {
//   User(name: "Fong") {
//     id
//     name
//   }
// }



// 第一種寫法
// query {
//   User {
//     id
//     name(val: "Fong")
//   }
// }


// type ExampleType {
//   value: Int
//   another: String
// }
// type Mutation {
//   example(input: ExampleInput): ExampleType
// }
// input ExampleInput {
//   value: Int = 0
//   another: String
//   isAvailable: Boolean = false
// }


// type ExampleInput {
//   value: Int
//   another: String
// }
// input ExampleInput {
//   value: Int = 0
//   another: String
//   isAvailable: Boolean = false
// }
// type ${GraphType.SYSTEM_FRIEND_LIST} {
//   data: [Permission]!
//   code: String
// }


const schema = `
  type CCCC {
    id(val: Int! = 30): Int!
    name: String
    isAvailable: Boolean
  }
  input Friend {
    id: Int! = 0
    name: String = "Thomas"
    isAvailable: Boolean = false
  }
`;






// type Friend {
//   id: Int!
//   enabled: Boolean!
//   roleName: String
//   resourceName: String
//   parentResource: String
// }
// type ${GraphType.SYSTEM_FRIEND_LIST} {
//   data: [Permission]!
//   code: String
// }

module.exports = schema;
