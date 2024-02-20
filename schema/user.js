const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const {
  GraphQLID,
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
} = require("graphql");

// User Type
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    fname: { type: GraphQLString },
    lname: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    password: { type: GraphQLString },
    role: { type: GraphQLString },
    profile: { type: GraphQLString },
    desciption: { type: GraphQLString },
  }),
});

const LoginResponseType = new GraphQLObjectType({
  name: "LoginResponse",
  fields: () => ({
    token: { type: GraphQLString },
    user: { type: UserType },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find();
      },
    },
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return User.findById(args.id);
      },
    },
  },
});

// Mutations
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // Add a User
    addUser: {
      type: UserType,
      args: {
        fname: { type: new GraphQLNonNull(GraphQLString) },
        lname: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        phone: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        role: {
          type: new GraphQLEnumType({
            name: "role",
            values: {
              user: { value: "user" },
              admin: { value: "admin" },
              guest: { value: "guest" },
            },
          }),
          defaultValue: "user",
        },
        profile: { type: GraphQLString },
        desciption: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const salt = bcrypt.genSaltSync(10); // Generate a salt
        const hashedPassword = bcrypt.hashSync(args.password, salt);
        const emailExists = await User.findOne({ email: args.email });
        const phoneExists = await User.findOne({ phone: args.phone });
        if (emailExists) {
          throw new Error("Email already registered");
        }
        if (phoneExists) {
          throw new Error("Phone number already registered");
        }
        const user = new User({
          fname: args.fname,
          lname: args.lname,
          email: args.email,
          phone: args.phone,
          password: hashedPassword,
          role: args.role,
          profile: args.profile,
          desciption: args.desciption,
        });
        return user.save();
      },
    },
    // login user
    login: {
      type: LoginResponseType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { email, password }) => {
        // Validate user credentials
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User not found");
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid password");
        }
        const token = jwt.sign({ userId: user._id }, "xyz212", {
          expiresIn: "1h",
        });
        return { token, user };
      },
    },

    // Delete a User
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        Project.find({ UserId: args.id }).then((projects) => {
          projects.forEach((project) => {
            project.deleteOne();
          });
        });
        return User.findByIdAndRemove(args.id);
      },
    },
  },
});

async function authenticateUser(username, password) {
  // Simulated user authentication, replace with your actual authentication logic
  const hashedPassword =
    "$2a$10$J6nEv7lDSUUXJyI.PNntLugybhOljADdDntnECEOMnY3xQ81b78Lu"; // hashed password
  return await bcrypt.compare(password, hashedPassword);
}

function generateToken(username) {
  // Generate JWT token
  return jwt.sign({ username }, "your-secret-key", { expiresIn: "1h" });
}

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
