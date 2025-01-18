import request from "supertest";
import appInit from "../server";
import mongoose from "mongoose";
import postModel from "../models/posts_model";
import userModel, { IUser } from "../models/users_model";
import testPostsData from "./test_posts.json";
import { Express } from "express";

let app: Express;

type Post = {
  _id?: string;
  title: string;
  content: string;
  owner: string;
}

const testPosts: Post[] = testPostsData;

beforeAll(async () => {
  console.log("Before all tests");
  app = await appInit();
  await postModel.deleteMany();
  await userModel.deleteMany();
});

afterAll(() => {
  console.log("After all tests");
  mongoose.connection.close();
});

type User = IUser & {
  accessToken?: string;
  refreshToken?: string;
}

const testUser: User = {
  email: "user@test.com",
  password: "1234567",
}

describe("Auth Test", () => {

  test("Test registration", async () => {
    const response = await request(app).post("/auth/register").send(testUser);
    expect(response.statusCode).toBe(200);
  });

  test("Test registration fail", async () => {
    const response = await request(app).post("/auth/register").send(testUser);
    expect(response.statusCode).not.toBe(200);
  });

  test("Test registration fail", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "",
    });
    expect(response.statusCode).not.toBe(200);
  });

  test("Test login", async () => {
    const response = await request(app).post("/auth/login").send(testUser);
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
    expect(testUser.accessToken).toBeDefined();
    expect(testUser.refreshToken).toBeDefined();
    testUser._id = response.body._id;
  });
  
  test("Test login fail", async () => {
    const response = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });
    expect(response.statusCode).not.toBe(200);
    const response2 = await request(app).post("/auth/login").send({
      email: "asdfasdf",
      password: "wrongpassword",
    });
    expect(response2.statusCode).not.toBe(200);
  });
   
  test("Test Login with missing fields", async () => {
    const response = await request(app).post("/auth" + "/login").send({
        email: testUser.email,
    });
    expect(response.statusCode).not.toBe(200);
});

  test("Get protected API", async () => {
    const responce = await request(app).post("/posts")
    .send({
        title: "Post 1 - without token",
        content: "Content of post 1", 
        owner: "Bar and Jonathan"
    });
    expect(responce.statusCode).not.toBe(201);

    const response2 = await request(app).post("/posts")
    .set({ authorization: "JWT " + testUser.accessToken })
    .send({
        title: "Post 2",
        content: "Content of post 2", 
        owner: "invalid owner"
    });
    expect(response2.statusCode).toBe(201);
});

test("Get protected API invalid token", async () => {
  const responce = await request(app).post("/posts")
  .set({ authorization: "JWT " + testUser.accessToken + '1' })
  .send({
      title: "Post 1 - without token",
      content: "Content of post 1", 
      owner: "Bar and Jonathan"
  });
  expect(responce.statusCode).not.toBe(201); 
});

  test("Using token", async () => {
    const response = await request(app).post("/posts").send(testPosts[0]);
    expect(response.statusCode).not.toBe(201);

    const response2 = await request(app).post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send(testPosts[0]);
    expect(response2.statusCode).toBe(201);

    const response3 = await request(app).post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken + 'f' })
      .send(testPosts[0]);
    expect(response3.statusCode).not.toBe(201);
  });

  test("Test refresh token", async () => {
    const response = await request(app).post("/auth/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
    expect(testUser.accessToken).toBeDefined();
    expect(testUser.refreshToken).toBeDefined();
  });

  test("Test refresh token fail", async () => {
    const response = await request(app).post("/auth/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response.statusCode).toBe(200);
    const newRefreshToken = response.body.refreshToken;
    const response2 = await request(app).post("/auth/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response2.statusCode).not.toBe(200);
    const response3 = await request(app).post("/auth/refresh").send({
      refreshToken: newRefreshToken,
    });
    expect(response3.statusCode).not.toBe(200);
  });

  test("Test logout", async () => {
    const response = await request(app).post("/auth/login").send(testUser);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
    const response2 = await request(app).post("/auth/logout").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response2.statusCode).toBe(200);
    const response3 = await request(app).post("/auth/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response3.statusCode).not.toBe(200);
  });
  
  test("Test distinct tokens", async () => {
    const response = await request(app).post("/auth/login").send(testUser);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
    const response2 = await request(app).post("/auth/login").send(testUser);
    expect(response2.statusCode).toBe(200);
    expect(response2.body.refreshToken).not.toEqual(testUser.refreshToken);
  });

  jest.setTimeout(10000);
  test("Token expired", async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const response = await request(app).post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send(testPosts[0]);
    expect(response.statusCode).not.toBe(201);
    const response2 = await request(app).post("/auth/refresh").send({
      refreshToken: testUser.refreshToken,
    });
    expect(response2.statusCode).toBe(200);
    testUser.accessToken = response2.body.accessToken;
    testUser.refreshToken = response2.body.refreshToken;
    const response3 = await request(app).post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send(testPosts[0]);
    expect(response3.statusCode).toBe(201);
  });

  jest.setTimeout(20000);
    test("Timeout on refresh access token", async() => {
        const response = await request(app).post("/auth" + "/login")
        .send({
            email: testUser.email,
            password: testUser.password,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;

        await new Promise (resolve => setTimeout(resolve, 6000)); // wait for 6 seconds
        const response2 = await request(app).post("/posts")
        .set({ authorization: "JWT " + testUser.accessToken })
        // try to access with expired token (5sec expiration)- fail
        .send({
            title: "Post 1 - without token",
            content: "Content of post 1", 
            owner: "Bar and Jonathan"
        })
        expect(response2.statusCode).not.toBe(201); 
          
        const response3 = await request(app).post("/auth" + "/refresh")
        .send({
            refreshToken: testUser.refreshToken
        });
        expect(response3.statusCode).toBe(200); 
        testUser.accessToken = response3.body.accessToken;
        testUser.refreshToken = response3.body.refreshToken;

        const response4 = await request(app).post("/posts")
        .set({ authorization: "JWT " + testUser.accessToken })
        .send({
            title: "Post 1 - without token",
            content: "Content of post 1", 
            owner: "Bar and Jonathan"
        });
        expect(response4.statusCode).toBe(201);
    });
    test("Test Login with missing fields", async () => {
      const response = await request(app).post("/auth" + "/login").send({
          email: testUser.email,
      });
      expect(response.statusCode).not.toBe(200);
  });
  test("Test Register with existing email", async () => {
      const response = await request(app).post("/auth" + "/register").send(testUser);
      expect(response.statusCode).not.toBe(200);
  });
 test("Test Login with wrong password", async () => {
      const response = await request(app).post("/auth" + "/login").send({
          email: testUser.email,
          password: "12345679",
      });
      expect(response.statusCode).not.toBe(200);
  });
  test("Test Login with unregistered email", async () => {
      const response = await request(app).post("/auth" + "/login").send({
          email: "bobi1234@mail.com",
          password: "12345678",
      });
      expect(response.statusCode).not.toBe(200);
  });
  test("Test authMiddleware with invalid token", async () => {
      const response = await request(app).post("/posts")
          .set({ authorization: "JWT invalidtoken123" })
          .send({ title: "Test post" });
      expect(response.statusCode).toBe(403);
      expect(response.body.error).toBe("Access Denied");
  });
  test("Test refreshTokens array in user model", async () => {
      const loginResponse = await request(app).post("/auth" + "/login").send(testUser);
      const { refreshToken } = loginResponse.body;
  
      const user = await userModel.findOne({ email: testUser.email });
      if(user === null) {
          throw new Error("User not found");
      }
      expect(user.refreshToken).toContain(refreshToken);
  });

});