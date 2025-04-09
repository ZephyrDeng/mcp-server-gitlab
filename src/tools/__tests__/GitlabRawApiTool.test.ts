import dotenv from "dotenv";
dotenv.config();
import { GitlabRawApiTool } from "../GitlabRawApiTool";

describe("GitlabRawApiTool", () => {
  const tool = new GitlabRawApiTool({
    baseUrl: process.env.GITLAB_API_URL || "",
    privateToken: process.env.GITLAB_TOKEN || "",
    timeout: 10000
  });

  it("should fetch projects list", async () => {
    const input = {
      endpoint: "/projects",
      method: "GET",
      params: { membership: true, per_page: 5 }
    };

    const result = await tool.execute(input);
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("name");
    }
  });
});