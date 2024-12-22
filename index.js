if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { verifyToken } = require("./helpers/jwt");
const UserModel = require("./models/UserModel");
const { userTypeDefs, userResolvers } = require("./schema/user");

const server = new ApolloServer({
  typeDefs: [userTypeDefs],
  resolvers: [userResolvers],
  introspection: true,
});

startStandaloneServer(server, {
  listen: { port: process.env.PORT || 3000 },
  //authorization
  context: ({ req, res }) => {
    return {
      auth: async () => {
        const token = req.headers.authorization;
        if (!token) throw new Error("Unauthorized");

        const [type, tokenValue] = token.split(" ");
        if (type !== "Bearer") throw new Error("Invalid token type");

        const decoded = verifyToken(tokenValue);

        const user = await UserModel.findById(decoded._id);
        if (!user) throw new Error("Invalid token");

        return user;
      },
    };
  },
}).then(({ url }) => {
  console.log(`🚀  Server ready at: ${url}`);
});
