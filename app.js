const express = require("express");
const cors = require("cors");
require("dotenv").config();
var { createHandler } = require("graphql-http/lib/use/express");
var { ruruHTML } = require("ruru/server");
const connectDB = require("./config/db");
const port = process.env.PORT || 5000;
const user = require("./schema/user");

const app = express();

// Connect to database
connectDB();
var root = {
  hello: () => {
    return "Hello world!";
  },
};

app.use(cors());
app.use(
  "/users",
  createHandler({
    schema: user,
    graphiql: true,
  })
);
// Create and use the GraphQL handler.
app.all(
  "/graphql",
  createHandler({
    schema: user,
    rootValue: root,
  })
);

// Serve the GraphiQL IDE.
app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

app.listen(port, console.log(`Server running on port ${port}`));
