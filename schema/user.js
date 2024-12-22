const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const UserModel = require("../models/UserModel");

const users = [];

const typeDefs = `#graphql

    type User {
        _id: ID
        name: String
        email: String
        createdAt: String
        updatedAt: String
    }

    type LoginResponse {
        accessToken: String,
        userId: String
    }

    type Query {
      userByName(username: String!) : [User]
      userById(userId: ID!): User
    }

    type Mutation {
        register(name: String!, username: String!, email: String!, password: String!): User
        login(email: String!, password: String!): LoginResponse
    }
`;

const resolvers = {
  Query: {
    userByName: async (_, args, { auth }) => {
      await auth();

      const users = await UserModel.findByUsername(args.username);
      if (!users) throw new Error("Username not found!");

      return users;
    },
    userById: async (_, args, { auth }) => {
      await auth();

      const user = await UserModel.findById(args.userId);

      return user;
    },
  },
  Mutation: {
    register: async (_, args) => {
      const { name, email, password } = args;
      const newUser = {
        name,
        email,
        password,
      };

      const result = await UserModel.register(newUser);
      newUser._id = result.insertedId;

      return newUser;
    },
    login: async (_, args) => {
      const { email, password } = args;

      const user = await UserModel.findByEmail(email);
      if (!user) throw new Error("Invalid Email/Password");

      const validatePassword = comparePassword(password, user.password);
      if (!validatePassword) throw new Error("Invalid Email/Password");

      const result = {
        accessToken: signToken({
          _id: user._id,
          email: user.email,
        }),
        userId: user._id,
      };

      return result;
    },
  },
};

module.exports = {
  userTypeDefs: typeDefs,
  userResolvers: resolvers,
};
