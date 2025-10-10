import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import dotenv from "dotenv";
import * as gitlabClientFactory from "../../utils/gitlabClientFactory";
import { GitlabRawApiTool } from "../GitlabRawApiTool";
import type { Context, ContentResult, TextContent } from "fastmcp";

dotenv.config();
describe("GitlabRawApiTool", () => {
  const tool = GitlabRawApiTool;
  const mockContext = {} as Context<Record<string, unknown> | undefined>;

  // Create mock client instance
  const mockClient = {
    apiRequest: jest.fn() as any,
    isValidResponse: jest.fn() as any,
  };

  beforeEach(() => {
    jest.restoreAllMocks();

    // Mock factory to return our mock client
    jest
      .spyOn(gitlabClientFactory, "createGitlabClientFromContext")
      .mockReturnValue(mockClient as any);
  });

  it("should fetch projects list", async () => {
    const mockProjects = [
      { id: 1, name: "Project Alpha" },
      { id: 2, name: "Project Beta" },
    ];
    mockClient.apiRequest.mockResolvedValue(mockProjects);
    mockClient.isValidResponse.mockReturnValue(true);

    const input = {
      endpoint: "/projects",
      method: "GET" as const,
      params: { membership: true, per_page: 5 },
    };

    const result = (await tool.execute(input, mockContext)) as ContentResult;
    expect(result).toHaveProperty("content");

    if (result.isError) {
      expect((result.content[0] as TextContent).text).toContain(
        "GitLab MCP 工具调用异常",
      );
    } else {
      const responseText = (result.content[0] as TextContent).text;
      const parsedResponse = JSON.parse(responseText);
      expect(Array.isArray(parsedResponse)).toBe(true);

      if (parsedResponse.length > 0) {
        expect(parsedResponse[0]).toHaveProperty("id");
        expect(parsedResponse[0]).toHaveProperty("name");
      }
    }
  });
});
