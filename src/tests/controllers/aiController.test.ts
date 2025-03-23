import httpMocks from "node-mocks-http";
import { getRecommendations } from "../../controllers/aiController";

jest.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: () => ({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () =>
                Promise.resolve(
                  "**The Matrix** - A reality-bending sci-fi classic.\n**Inception** - A mind-twisting dream thriller."
                ),
            },
          }),
        }),
      };
    }),
  };
});

describe("AI Controller", () => {
  it("should return 400 if symptoms are missing", async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();
    await getRecommendations(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ message: "Please provide symptoms" });
  });

  it("should return movie recommendations if symptoms are provided", async () => {
    const req = httpMocks.createRequest({ body: { symptoms: "anxiety" } });
    const res = httpMocks.createResponse();
    await getRecommendations(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = res._getJSONData();
    expect(data.recommendations).toContain("**The Matrix**");
    expect(data.recommendations).toContain("**Inception**");
  });
});
