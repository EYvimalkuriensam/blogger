const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
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
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function(next) {
  const user = this;
  if (user.isModified("password"))
    user.password = await bcrypt.hash(user.password, 8);
  next();
});

userSchema.statics.findByCredentials = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error();
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new Error();
    return user;
  } catch (e) {
    res.status(400).send({ error: "Invalid Credentials" });
  }
};

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
