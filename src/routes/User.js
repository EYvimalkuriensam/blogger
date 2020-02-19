const express = require("express");
const User = require("../models/User");

const auth = require("../middlewares/auth");

const router = new express.Router();

router.post("/user", async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(404).send({ error: "Invalid Credentials" });
  }
});

router.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      token => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/user/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/user/me", auth, (req, res) => {
  res.send(req.user);
});

router.patch("/user", auth, async (req, res) => {
  const validUpdates = ["name", "age", "email", "password"];
  const updates = Object.keys(req.body);
  const isValidUpdate = updates.every(update => validUpdates.includes(update));
  if (!isValidUpdate) res.status(404).send({ error: "Invalid Updates" });
  try {
    updates.forEach(update => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

router.delete("/user", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
