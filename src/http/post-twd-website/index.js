let arc = require("@architect/functions");
let {
  ApolloServer,
  SchemaDirectiveVisitor,
  gql,
} = require("apollo-server-lambda");

let PublishDirective = require("./PublishDirective");

// Construct a schema, using GraphQL schema language
let typeDefs = gql`
  type Query {
    hello: String
  }
`;
// Provide resolver functions for your schema fields
let resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
};

const schema = buildFederatedSchema([{ typeDefs, resolvers }]);
const directives = { _publish: PublishDirective };
SchemaDirectiveVisitor.visitSchemaDirectives(schema, directives);

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

let server = new ApolloServer({ schema, context: { pusher } });
let handler = server.createHandler();

exports.handler = function (event, context, callback) {
  let body = arc.http.helpers.bodyParser(event);
  // Body is now parsed, re-encode to JSON for Apollo
  event.body = JSON.stringify(body);
  handler(event, context, callback);
};
