import request from "supertest";
import appInit from "../server";
import mongoose from "mongoose";
import commentModel from "../models/comments_model";
import postModel from "../models/posts_model";
import userModel, { IUser } from "../models/users_model";
import { Express } from "express";

let app: Express;

type User = IUser & { token?: string };
const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
};


const testComments: {
  postId: string;
  comment: string;
  owner: string;
}[] = [
  { postId: "", comment: "This is a test comment", owner: "Test Owner" }
];

let postId = "";
let commentId = "";

beforeAll(async () => {
  console.log("beforeAll");
  app = await appInit();
  await commentModel.deleteMany();
  await postModel.deleteMany();
  await userModel.deleteMany();
  await request(app).post("/auth/register").send(testUser);
  const res = await request(app).post("/auth/login").send(testUser);
  testUser.token = res.body.accessToken;
  testUser._id = res.body._id;
  expect(testUser.token).toBeDefined();

  // Create a post to associate comments with
  const postRes = await request(app).post("/posts")
    .set({ authorization: "JWT " + testUser.token })
    .send({
      title: "Test Post",
      comment: "Test Comment",
      owner: testUser._id,
    });
  postId = postRes.body._id;
});

beforeEach(async () => {
  await commentModel.deleteMany({});
  await postModel.deleteMany({});

  const post = await postModel.create({
      title: "Test Post",
      content: "Test Content",
      owner: testUser._id, // משתמש לדוגמה
  });

  testComments[0].postId = post._id.toString();
  await commentModel.create(testComments[0]); // יצירת תגובה לדוגמה
});

afterAll(async () => {
  console.log("afterAll");
  await mongoose.connection.close();
});

describe("Comments Tests", () => {
  test("Comments test get all", async () => {
    const response = await request(app).get("/comments");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });

  test("Test Create Comment", async () => {
    const response = await request(app).post("/comments")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        comment: testComments[0].comment,
        postId: postId,
        owner: testUser._id,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.postId).toBe(postId);
    expect(response.body.comment).toBe(testComments[0].comment);
    expect(response.body.owner).toBe(testUser._id);
    commentId = response.body._id;
  });

  test("Test Create Comment with Missing Post ID", async () => {
    const response = await request(app).post("/comments")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        comment: testComments[0].comment,
        owner: testUser._id,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Post Id required");
  });

  test("Test Create Comment with Invalid Post ID", async () => {
    const response = await request(app).post("/comments")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        comment: testComments[0].comment,
        postId: "invalidPostId",
        owner: testUser._id,
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid Post Id");
  });

  test("Test Create Comment with Non-Existent Post ID", async () => {
    const nonExistentPostId = new mongoose.Types.ObjectId().toString();
    const response = await request(app).post("/comments")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        comment: testComments[0].comment,
        postId: nonExistentPostId,
        owner: testUser._id,
      });
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Post not found");
  });

  test("Test get comment by owner", async () => {
    const response = await request(app).get(`/comments?owner=${testUser._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1); 
    expect(response.body[0].postId).toBe(testComments[0].postId);
    expect(response.body[0].comment).toBe(testComments[0].comment);
    expect(response.body[0].owner).toBe(testUser._id);
});

  test("Get comments by post ID", async () => {
    // Create a comment first
    await request(app).post("/comments")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        comment: testComments[0].comment,
        postId: postId,
        owner: testUser._id,
      });

    const response = await request(app).get("/comments/post/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].postId).toBe(postId);
    expect(response.body[0].comment).toBe(testComments[0].comment);
    expect(response.body[0].owner).toBe(testUser._id);
  });

  test("Test Update Comment", async () => {
    // Create a comment first
    const createRes = await request(app).post("/comments")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        comment: testComments[0].comment,
        postId: postId,
        owner: testUser._id,
      });
    commentId = createRes.body._id;

    const response = await request(app).put("/comments/" + commentId)
      .set({ authorization: "JWT " + testUser.token })
      .send({
        comment: "Updated Comment",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.comment).toBe("Updated Comment");
  });

  test("Test Delete Comment", async () => {
    // Create a comment first
    const createRes = await request(app).post("/comments")
      .set({ authorization: "JWT " + testUser.token })
      .send({
        comment: testComments[0].comment,
        postId: postId,
        owner: testUser._id,
      });
    commentId = createRes.body._id;

    const response = await request(app).delete("/comments/" + commentId)
      .set({ authorization: "JWT " + testUser.token });
    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get("/comments/" + commentId);
    expect(getResponse.statusCode).toBe(404);
  });
});