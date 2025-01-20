import request from "supertest";
import appInit from "../server";
import mongoose from "mongoose";
import commentModel from "../models/comments_model";
import userModel from "../models/users_model";
import { Express } from "express";

let app: Express;

/**
 * Test user information
 */
type UserTemplate = {
  email: string;
  name: string;
  password: string;
  token?: string;
  id?: string;
};

const testUser: UserTemplate = {
  email: "user@test.com",
  name: "Test User",
  password: "1234567",
};

/**
 * Test comment structure
 */
type CommentTemplate = {
  comment: string;
  postId: string;
  owner: string;
  _id?: string;
};

const testComment: CommentTemplate = {
  comment: "Test Comment",
  postId: "123456",
  owner: "Test Owner",
};

const invalidComment = {
  content: "Invalid Comment",
};

beforeAll(async () => {
  console.log("Initializing tests...");
  app = await appInit();
  await userModel.deleteMany({});
  await commentModel.deleteMany({});

  // Register and login user
  await request(app).post("/auth/register").send(testUser);
  const response = await request(app).post("/auth/login").send(testUser);
  testUser.token = response.body.accessToken;
  testUser.id = response.body._id;
  expect(response.statusCode).toBe(200);
});

beforeEach(async () => {
  await commentModel.deleteMany({});
  console.log("Cleared comments before each test");
});

afterAll(async () => {
  console.log("Closing database connection...");
  await mongoose.connection.close();
});

describe("Comments API Tests", () => {
  test("Get all comments (empty state)", async () => {
    const response = await request(app).get("/comments");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Create a new comment", async () => {
    const response = await request(app)
      .post("/comments")
      .set("authorization", `JWT ${testUser.token}`)
      .send(testComment);

    expect(response.statusCode).toBe(201);
    expect(response.body.comment).toBe(testComment.comment);
    expect(response.body.postId).toBe(testComment.postId);
    testComment._id = response.body._id;
  });

  test("Get all comments", async () => {
    await request(app)
      .post("/comments")
      .set("authorization", `JWT ${testUser.token}`)
      .send(testComment);

    const response = await request(app).get("/comments");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test("Get comment by ID", async () => {
    const createResponse = await request(app)
      .post("/comments")
      .set("authorization", `JWT ${testUser.token}`)
      .send(testComment);

    const response = await request(app).get(`/comments/${createResponse.body._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(createResponse.body._id);
  });

  test("Update a comment", async () => {
    const createResponse = await request(app)
      .post("/comments")
      .set("authorization", `JWT ${testUser.token}`)
      .send(testComment);

    const updateResponse = await request(app)
      .put(`/comments/${createResponse.body._id}`)
      .set("authorization", `JWT ${testUser.token}`)
      .send({ comment: "Updated Comment" });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.comment).toBe("Updated Comment");
  });

  test("Delete a comment", async () => {
    const createResponse = await request(app)
      .post("/comments")
      .set("authorization", `JWT ${testUser.token}`)
      .send(testComment);

    const deleteResponse = await request(app)
      .delete(`/comments/${createResponse.body._id}`)
      .set("authorization", `JWT ${testUser.token}`);

    expect(deleteResponse.statusCode).toBe(200);

    const getResponse = await request(app).get(`/comments/${createResponse.body._id}`);
    expect(getResponse.statusCode).toBe(404);
  });

  test("Create a comment with invalid data (failure)", async () => {
    const response = await request(app)
      .post("/comments")
      .set("authorization", `JWT ${testUser.token}`)
      .send(invalidComment);

    expect(response.statusCode).toBe(400);
  });

  test("Get comment by invalid ID (failure)", async () => {
    const invalidId = "nonexistent-id";
    const response = await request(app).get(`/comments/${invalidId}`);
    expect(response.statusCode).toBe(404);
  });
});
