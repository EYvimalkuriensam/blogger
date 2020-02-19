const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Invalid email format");
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) throw new Error("Age must be a non-negative number");
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    validate(value) {
      if (value.toLowerCase().includes("password"))
        throw new Error("Password should not include the word password");
    }
  }
},
{
    timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;
