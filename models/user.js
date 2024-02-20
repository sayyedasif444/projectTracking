const mongoose = require("mongoose");

const UserModel = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user", "guest"],
    default: "user",
  },
  profile: {
    type: String,
  },
  desciption: {
    type: String,
  },
});

module.exports = mongoose.model("Users", UserModel);
