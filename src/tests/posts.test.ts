import request from "supertest";
import appInit from "../server";
import mongoose from "mongoose";
import postModel from "../models/posts_model";
import userModel from "../models/users_model";
import { Express } from "express";

let app: Express;

/**
 * Test user information
 */
type UserTemplate = {
  email: string;
  password: string;
  token?: string;
  _id?: string;
};

const testUser: UserTemplate = {
  email: "user@test.com",
  password: "1234567",
};

/**
 * Test post structure
 */
type Post = {
  _id?: string;
  title: string;
  content: string;
  owner: string;
};

const testPosts: Post[] = [
  {
    title: "Post 1",
    content: "Content of post 1",
    owner: "Test Owner",
  },
  {
    title: "Post 2",
    content: "Content of post 2",
    owner: "Test Owner",
  },
];

beforeAll(async () => {
  console.log("Initializing tests...");
  app = await appInit();
  await userModel.deleteMany({});
  await postModel.deleteMany({});

  // Register and login user
  await request(app).post("/auth/register").send(testUser);
  const response = await request(app).post("/auth/login").send(testUser);
  testUser.token = response.body.token;
  testUser._id = response.body._id;
  expect(response.statusCode).toBe(200);
});

beforeEach(async () => {
  await postModel.deleteMany({});
  console.log("Cleared posts before each test");
});

afterAll(async () => {
  console.log("Closing database connection...");
  await mongoose.connection.close();
});

describe("Posts API Tests", () => {
  test("Get all posts (empty state)", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Create a new post", async () => {
    const response = await request(app)
      .post("/posts")
      .set("authorization", `JWT ${testUser.token}`)
      .send(testPosts[0]);

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(testPosts[0].title);
    expect(response.body.content).toBe(testPosts[0].content);
    testPosts[0]._id = response.body._id;
  });

  test("Get all posts", async () => {
    await request(app)
      .post("/posts")
      .set("authorization", `JWT ${testUser.token}`)
      .send(testPosts[0]);

    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test("Get post by ID", async () => {
    const createResponse = await request(app)
      .post("/posts")
      .set("authorization", `JWT ${testUser.token}`)
      .send(testPosts[0]);

    const response = await request(app).get(`/posts/${createResponse.body._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(createResponse.body._id);
  });

  test("Filter posts by owner", async () => {
    await request(app)
      .post("/posts")
      .set("authorization", `JWT ${testUser.token}`)
      .send(testPosts[0]);

    const response = await request(app).get(`/posts/by-owner?owner=${testUser._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test("Delete a post", async () => {
    const createResponse = await request(app)
      .post("/posts")
      .set("authorization", `JWT ${testUser.token}`)
      .send(testPosts[0]);

    const deleteResponse = await request(app)
      .delete(`/posts/${createResponse.body._id}`)
      .set("authorization", `JWT ${testUser.token}`);

    expect(deleteResponse.statusCode).toBe(200);

    const getResponse = await request(app).get(`/posts/${createResponse.body._id}`);
    expect(getResponse.statusCode).toBe(404);
  });

  test("Create a new post with missing fields (failure)", async () => {
    const response = await request(app)
      .post("/posts")
      .set("authorization", `JWT ${testUser.token}`)
      .send({ content: "Missing title" });

    expect(response.statusCode).toBe(400);
  });

  test("Update a post", async () => {
    const createResponse = await request(app)
      .post("/posts")
      .set("authorization", `JWT ${testUser.token}`)
      .send(testPosts[0]);

    const updateResponse = await request(app)
      .put(`/posts/${createResponse.body._id}`)
      .set("authorization", `JWT ${testUser.token}`)
      .send({
        title: "Updated Title",
        content: "Updated Content",
      });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.title).toBe("Updated Title");
    expect(updateResponse.body.content).toBe("Updated Content");
  });

  test("Update a non-existing post (failure)", async () => {
    const response = await request(app)
      .put("/posts/nonexistent-id")
      .set("authorization", `JWT ${testUser.token}`)
      .send({
        title: "Updated Title",
        content: "Updated Content",
      });

    expect(response.statusCode).toBe(500);
  });
});
