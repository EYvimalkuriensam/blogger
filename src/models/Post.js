const mongoose = require("mongoose");
const validator = require("validator");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      maxlength: 1000
    },
    mode: {
      type: String,
      default: "public",
      lowercase: true,
      validate(value) {
        if (!validator.isIn(value, ["private", "public"]))
          throw new Error("Mode should either be public or private");
      }
    },
    files: {
      type: Buffer
    },
    pictures: {
      type: Buffer
    },
    proprietrix: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
