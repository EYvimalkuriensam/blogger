const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../../src/models/User");

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "UserOne",
  email: "userone@example.com",
  age: 0,
  password: "useroneinput",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }
  ]
};

const setupTestDb = async () => {
  await User.deleteMany({});
  await new User(userOne).save();
};

module.exports = { userOneId, userOne, setupTestDb };
