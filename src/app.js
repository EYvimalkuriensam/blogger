const express = require("express");
require("./db/mongoose");

const userRouter = require("./routes/User");
const postRouter = require("./routes/Post");

const app = express();

app.use(express.json());

app.use(userRouter);
app.use(postRouter);

module.exports = app;
