const request = require("supertest");
const app = require("../src/app");

const User = require("../src/models/User");

const { userOneId, userOne, setupTestDb } = require("./fixtures/db");

beforeEach(setupTestDb);

test("Should create a user", async () => {
  const response = await request(app)
    .post("/user")
    .send({
      name: "testUser",
      email: "testuser@example.com",
      password: "testuserinput()"
    })
    .expect(201);
  const user = await User.findById(response.body.user._id);
  expect(user.password).not.toBe("testuserinput()");
  expect(user).toMatchObject({
    name: "testUser",
    email: "testuser@example.com"
  });
});

test("Should login an existing user", async () => {
  const response = await request(app)
    .post("/user/login")
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200);
});

test("Should not login a non-existant user", async () => {
  const response = await request(app)
    .post("/user/login")
    .send({
      email: "doesnexist@example.com",
      password: "notarealone"
    })
    .expect(404);
});

test("Should read profile of an authorized user", async () => {
  const response = await request(app)
    .get("/user/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(response.body._id);
  expect(user).not.toBeNull();
});

test("Should not read the profile of an unauthorized user", async () => {
  await request(app)
    .get("/user/me")
    .send()
    .expect(401);
});

test("Should update details of an authorized user", async () => {
  const update = { name: "patch test updates" };
  await request(app)
    .patch("/user")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send(update)
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toBe(update.name);
});

test("Should not update invalid details of an authorized user", async () => {
  await request(app)
    .patch("/user")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ invalidUpdate: "invalid Data" })
    .expect(404);
});

test("Should not update details of an unauthorized user", async () => {
  await request(app)
    .patch("/user")
    .send({ name: "patch test updates" })
    .expect(401);
});

test("Should delete an authorized user", async () => {
  await request(app)
    .delete("/user")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("Should not delete an unauthorized user", async () => {
  await request(app)
    .delete("/user")
    .send()
    .expect(401);
});

test("Should logout an authorized user", async () => {
  const userBefore = await User.findById(userOneId);
  await request(app)
    .post("/user/logout")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const userAfter = await User.findById(userOneId);
  expect(userAfter.tokens.length).toBe(userBefore.tokens.length - 1);
});

test("Should not logout an unauthorized user", async () => {
  await request(app)
    .post("/user/logout")
    .send()
    .expect(401);
});

test("Should logout all sessions of an authorized user", async () => {
  for (let i = 0; i <= 2; i++) {
    await request(app)
      .post("/user/login")
      .send({
        email: userOne.email,
        password: userOne.password
      })
      .expect(200);
  }
  const userBefore = await User.findById(userOneId);
  expect(userBefore.tokens.length).toEqual(4);
  await request(app)
    .post("/user/logoutAll")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  const userAfter = await User.findById(userOneId);
  expect(userAfter.tokens.length).toEqual(0);
});

test("Should not logout of all sessions of an unauthorized user", async () => {
  await request(app)
    .post("/user/logoutAll")
    .send()
    .expect(401);
});
