// const express = require("express");
// const { graphqlHTTP } = require("express-graphql");
// const { buildSchema } = require("graphql");

// const fakeDatabase = {};

// // Construct a schema, using GraphQL schema language
// const schema = buildSchema(`
// type Mutation {
//   setMessage(message: String): String
// }

//  type RandomDie {
//     numSides: Int!
//     rollOnce: Int!
//     roll(numRolls: Int!): [Int]
//   }
//   type Query {
//     rollDice(numDice: Int!, numSides: Int): [Int]
//     test: String
//     getDie(numSides: Int): RandomDie
//     getMessage: String
//   }
// `);

// // The root provides a resolver function for each API endpoint
// const root = {
//   rollDice: ({ numDice, numSides }) => {
//     var output = [];
//     for (var i = 0; i < numDice; i++) {
//       output.push(1 + Math.floor(Math.random() * (numSides || 6)));
//     }
//     return output;
//   },
//   test: "Hello World",
//   getDie: ({ numSides }) => {
//     return new RandomDie(numSides || 6);
//   },

//   setMessage: ({ message }) => {
//     fakeDatabase.message = message;
//     return message;
//   },
//   getMessage: () => {
//     return fakeDatabase.message;
//   },
// };

// const app = express();
// app.use(
//   "/graphql",
//   graphqlHTTP({
//     schema: schema,
//     rootValue: root,
//     graphiql: true,
//   })
// );
// app.listen(4000);
// console.log("Running a GraphQL API server at http://localhost:4000/graphql");

// ========================== TEST 1 ==========================

// Query with variables

// const dice = 3;
// const sides = 6;
// const query = `query RollDice($dice: Int!, $sides: Int) {
//   rollDice(numDice: $dice, numSides: $sides)
// }`;

// fetch("http://localhost:4000/graphql", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
//   body: JSON.stringify({
//     query,
//     variables: { dice, sides },
//   }),
// })
//   .then((r) => r.json())
//   .then((data) => console.log("data returned:", data));

// ========================== TEST 2 ==========================

// Can call multiple methods at once

// Example
// {
//   getDie(numSides: 6) {
//     rollOnce
//     roll(numRolls: 3)
//   }
//   test
//   rollDice(numDice: 4, numSides: 10)
// }

// class RandomDie {
//   constructor(numSides) {
//     this.numSides = numSides;
//   }

//   rollOnce() {
//     return 1 + Math.floor(Math.random() * this.numSides);
//   }

//   roll({ numRolls }) {
//     var output = [];
//     for (var i = 0; i < numRolls; i++) {
//       output.push(this.rollOnce());
//     }
//     return output;
//   }
// }

// ========================== TEST 3 ==========================

// Mutation

// type Mutation {
//   setMessage(message: String): String
// }

// type Query {
//   getMessage: String
// }

// Request

// #  mutation {
// #    setMessage(message: "Hi")
// #  }

// # {
// #   getMessage
// # }

// ========================== TEST 4 ==========================

// For example, instead of a single message of the day, let's say we have many messages, indexed in a database by the id field, and each message has both a content string and an author string. We want a mutation API both for creating a new message and for updating an old message. We could use the schema:

// input MessageInput {
//   content: String
//   author: String
// }

// type Message {
//   id: ID!
//   content: String
//   author: String
// }

// type Query {
//   getMessage(id: ID!): Message
// }

// type Mutation {
//   createMessage(input: MessageInput): Message
//   updateMessage(id: ID!, input: MessageInput): Message
// }

var express = require("express");
var { graphqlHTTP } = require("express-graphql");
var { buildSchema } = require("graphql");

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type Query {
    getMessage(id: ID!): Message
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }
`);

// If Message had any complex fields, we'd put them on this object.
class Message {
  constructor(id, { content, author }) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

// Maps username to content
var fakeDatabase = {};

var root = {
  getMessage: ({ id }) => {
    if (!fakeDatabase[id]) {
      throw new Error("no message exists with id " + id);
    }
    return new Message(id, fakeDatabase[id]);
  },
  createMessage: ({ input }) => {
    // Create a random id for our "database".
    var id = require("crypto").randomBytes(10).toString("hex");

    fakeDatabase[id] = input;
    return new Message(id, input);
  },
  updateMessage: ({ id, input }) => {
    if (!fakeDatabase[id]) {
      throw new Error("no message exists with id " + id);
    }
    // This replaces all old data, but some apps might want partial update.
    fakeDatabase[id] = input;
    return new Message(id, input);
  },
};

var app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);
app.listen(4000, () => {
  console.log("Running a GraphQL API server at localhost:4000/graphql");
});

// Requets 

// mutation {
//   createMessage(input: {
//     author: "andy",
//     content: "hope is a good thing",
//   }) {
//     id
//     author
//   }
// }

// Response 

// {
//   "data": {
//     "createMessage": {
//       "id": "4340e9858a5b2aff9d53",
//       "author": "andy"
//     }
//   }
// }