import httpMocks from "node-mocks-http";
import { loginUser } from "../../../src/controllers/authController";
import User from "../../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("../../models/userModel");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("loginUser", () => {
  it("should return 400 if user not found", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: {
        email: "nonexistent@example.com",
        password: "password123",
      },
    });
    const res = httpMocks.createResponse();

    (User.findOne as jest.Mock).mockResolvedValue(null);

    await loginUser(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      message: "Invalid email or password",
    });
  });

  it("should return 400 if password does not match", async () => {
    const fakeUser = {
      _id: "123",
      email: "test@example.com",
      password: "hashedPassword",
    };

    (User.findOne as jest.Mock).mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const req = httpMocks.createRequest({
      method: "POST",
      body: {
        email: "test@example.com",
        password: "wrongpassword",
      },
    });
    const res = httpMocks.createResponse();

    await loginUser(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      message: "Invalid email or password",
    });
  });

  it("should return token and user data on successful login", async () => {
    const fakeUser = {
      _id: "123",
      email: "test@example.com",
      password: "hashedPassword",
      username: "TestUser",
      profileImage: "/uploads/avatar.png",
    };

    (User.findOne as jest.Mock).mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mocked-token");

    const req = httpMocks.createRequest({
      method: "POST",
      body: {
        email: "test@example.com",
        password: "password123",
      },
    });
    const res = httpMocks.createResponse();

    await loginUser(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      token: "mocked-token",
      user: {
        id: "123",
        username: "TestUser",
        email: "test@example.com",
        profileImage: "/uploads/avatar.png",
      },
    });
  });
});
