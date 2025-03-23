import httpMocks from "node-mocks-http";
import { createPost } from "../../controllers/postController";
import Post from "../../models/postModel";

jest.mock("../../models/postModel");

describe("Post Controller", () => {
  it("should return 400 if post text is missing", async () => {
    const req = httpMocks.createRequest({ body: {}, user: { id: "user123" } });
    const res = httpMocks.createResponse();

    await createPost(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ message: "Post text is required" });
  });

  it("should create a post successfully", async () => {
    const req = httpMocks.createRequest({
      body: { text: "New post!" },
      file: { filename: "image.png" },
      user: { id: "user123" },
    });
    const res = httpMocks.createResponse();

    (Post as any).mockImplementation(() => ({ save: jest.fn().mockResolvedValue(true) }));
    (Post.create as jest.Mock) = jest.fn();

    await createPost(req, res);

    expect(res._getStatusCode()).toBe(201);
  });
});
