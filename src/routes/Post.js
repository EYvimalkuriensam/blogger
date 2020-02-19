const express = require("express");

const auth = require("../middlewares/auth");
const Post = require("../models/Post");

const router = new express.Router();

router.post("/post", auth, async (req, res) => {
  const post = new Post({ ...req.body, proprietrix: req.user._id });
  try {
    await post.save();
    res.status(201).send(post);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/posts", auth, async (req, res) => {
  try {
    const posts = await Post.find({ proprietrix: req.user._id });
    res.send(posts);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/post/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      proprietrix: req.user._id
    });
    if (!post) res.status(404).send();
    res.send(post);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/post/:id", auth, async (req, res) => {
  const allowedUpdates = ["title", "body", "mode"];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) res.status(400).send({ error: "Invalid Updates" });
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      proprietrix: req.user._id
    });
    if (!post) res.status(404).send();
    updates.forEach(update => (post[update] = req.body[update]));
    await post.save();
    res.send(post);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete("/post/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      proprietrix: req.user._id
    });
    if (!post) res.status(404).send();
    await post.remove();
    res.send(post);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
