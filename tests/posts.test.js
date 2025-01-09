const request = require("supertest");
const appInit = require("../server");
const mongoose = require("mongoose");
const Posts = require("../models/posts_model");

const testPosts = require("./test_posts");

let app;
beforeAll(async () => {
  console.log("before all tests");
  app = await appInit();
  await Posts.deleteMany();
});

afterAll(() => {
  console.log("After all tests");
  mongoose.connection.close();
});

describe("Posts Test", () => {
  test("Test get all post empty", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test Create new post", async () => {
    for (let post of testPosts) {
      const response = await request(app).post("/posts").send(post);
      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe(post.title);
      expect(response.body.content).toBe(post.content);
      expect(response.body.sender).toBe(post.sender);
      post._id = response.body._id;
    }
  });

  test("Test get all post", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(testPosts.length);
  });

  test("Test get post by id", async () => {
    const response = await request(app).get("/posts/" + testPosts[0]._id);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(testPosts[0]._id);
  });

  test("Test filter post by sender", async () => {
    const response = await request(app).get(
      "/posts?sender=" + testPosts[0].sender
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("Test Delete post", async () => {
    const response = await request(app).delete("/posts/" + testPosts[0]._id);
    expect(response.statusCode).toBe(200);

    const responseGet = await request(app).get("/posts/" + testPosts[0]._id);
    expect(responseGet.statusCode).toBe(404);
  });

  test("Test create new post fail", async () => {
    const response = await request(app).post("/posts").send({
      title: "Test Post 1",
      content: " Test Content 1",
    });
    expect(response.statusCode).toBe(400);
  });
});
