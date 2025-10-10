import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import * as gitlabClientFactory from "../../utils/gitlabClientFactory";
import { GitlabSearchProjectDetailsTool } from "../GitlabSearchProjectDetailsTool";
import type { Context, ContentResult, TextContent } from "fastmcp";

describe("GitlabSearchProjectDetailsTool", () => {
  const tool = GitlabSearchProjectDetailsTool;
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

    // Setup default mock behaviors
    mockClient.apiRequest.mockResolvedValue([
      { id: 1, name: "mcp", description: "desc" },
      { id: 2, name: "mcp2", description: "desc2" },
    ]);
    mockClient.isValidResponse.mockReturnValue(true);
  });

  it("should have correct metadata", () => {
    expect(tool.name).toBe("Gitlab Search Project Details Tool");
    expect(tool.description).toContain("搜索项目");
  });

  it("should return project list with example params", async () => {
    const mockProjects = [
      { id: 1, name: "mcp", description: "desc" },
      { id: 2, name: "mcp2", description: "desc2" },
    ];
    mockClient.apiRequest.mockResolvedValue(mockProjects);

    const params = {
      projectName: "mcp",
      fields: ["id", "name", "description"],
    };
    const result = (await tool.execute(params, mockContext)) as ContentResult;
    expect(result).toHaveProperty("content");

    const responseText = (result.content[0] as TextContent).text;
    const parsedResponse = JSON.parse(responseText);

    expect(Array.isArray(parsedResponse)).toBe(true);
    expect(parsedResponse.length).toBeGreaterThan(0);
    expect(parsedResponse[0]).toHaveProperty("id");
    expect(parsedResponse[0]).toHaveProperty("name");
  });

  it("should handle api error gracefully", async () => {
    mockClient.apiRequest.mockRejectedValue(new Error("API error"));
    const params = {
      projectName: "mcp",
      fields: ["id", "name", "description"],
    };
    const result = (await tool.execute(params, mockContext)) as ContentResult;
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("isError", true);
    expect((result.content[0] as TextContent).text).toContain(
      "GitLab MCP 工具调用异常",
    );
    expect((result.content[0] as TextContent).text).toContain("API error");
  });

  it("should handle 404 not found error", async () => {
    mockClient.apiRequest.mockRejectedValue(new Error("404 Project Not Found"));
    const params = {
      projectName: "mcp",
      fields: ["id", "name", "description"],
    };
    const result = (await tool.execute(params, mockContext)) as ContentResult;
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("isError", true);
    expect((result.content[0] as TextContent).text).toContain(
      "GitLab MCP 工具调用异常",
    );
    expect((result.content[0] as TextContent).text).toContain(
      "404 Project Not Found",
    );
  });
});
