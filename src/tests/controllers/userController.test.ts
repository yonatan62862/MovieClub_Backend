import httpMocks from "node-mocks-http";
import { getUserProfile } from "../../controllers/userController";
import User from "../../models/userModel";

jest.mock("../../models/userModel");

describe("User Controller", () => {
  it("should return 404 if user not found", async () => {
    const req = httpMocks.createRequest();
    (req as any).user = { id: "123" };

    const res = httpMocks.createResponse();

    (User.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await getUserProfile(req, res, jest.fn());

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({ message: "User not found" });
  });
});
