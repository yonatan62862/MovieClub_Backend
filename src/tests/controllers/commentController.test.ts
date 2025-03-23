import httpMocks from "node-mocks-http";
import { addComment } from "../../controllers/commentController";
import Comment from "../../models/commentModel";

jest.mock("../../models/commentModel");

describe("Comment Controller", () => {
  it("should return 400 if comment text is missing", async () => {
    const req = httpMocks.createRequest({ body: { postId: "1" }, user: { id: "u1" } });
    const res = httpMocks.createResponse();
    await addComment(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ message: "Comment text is required" });
  });

  it("should create comment successfully", async () => {
    const req = httpMocks.createRequest({
      body: { postId: "post1", text: "Nice movie!" },
      user: { id: "user123" },
    });
    const res = httpMocks.createResponse();

    (Comment as any).mockImplementation(() => ({ save: jest.fn().mockResolvedValue(true) }));

    await addComment(req, res);

    expect(res._getStatusCode()).toBe(201);
  });
});
