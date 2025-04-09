import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { gitlabApiClient } from '../../utils/gitlabApiClientInstance';
import { GitlabSearchProjectDetailsTool } from "../GitlabSearchProjectDetailsTool";
import type { Context, ContentResult, TextContent } from 'fastmcp';

describe("GitlabSearchProjectDetailsTool", () => {
  beforeEach(() => {
    jest.spyOn(gitlabApiClient, 'apiRequest').mockResolvedValue([
      { id: 1, name: "mcp", description: "desc" },
      { id: 2, name: "mcp2", description: "desc2" }
    ] as any);
  });
  const tool = GitlabSearchProjectDetailsTool;
  const mockContext = {} as Context<Record<string, unknown> | undefined>;

  it("should have correct metadata", () => {
    expect(tool.name).toBe("Gitlab Search Project Details Tool");
    expect(tool.description).toContain("搜索项目");
  });

  it("should return project list with example params", async () => {
    const mockProjects = [
      { id: 1, name: "mcp", description: "desc" },
      { id: 2, name: "mcp2", description: "desc2" }
    ];
    jest.spyOn(gitlabApiClient, "apiRequest").mockResolvedValue(mockProjects);

    const params = {
      projectName: "mcp",
      fields: ["id", "name", "description"]
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    
    const responseText = (result.content[0] as TextContent).text;
    const parsedResponse = JSON.parse(responseText);
    
    expect(Array.isArray(parsedResponse)).toBe(true);
    expect(parsedResponse.length).toBeGreaterThan(0);
    expect(parsedResponse[0]).toHaveProperty("id");
    expect(parsedResponse[0]).toHaveProperty("name");
  });

  it("should handle api error gracefully", async () => {
    jest.spyOn(gitlabApiClient, "apiRequest").mockRejectedValue(new Error("API error"));
    const params = {
      projectName: "mcp",
      fields: ["id", "name", "description"]
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("API error");
  });

  it("should handle 404 not found error", async () => {
    jest.spyOn(gitlabApiClient, "apiRequest").mockRejectedValue(new Error("404 Project Not Found"));
    const params = {
      projectName: "mcp",
      fields: ["id", "name", "description"]
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("404 Project Not Found");
  });

  it("should handle 403 forbidden error", async () => {
    jest.spyOn(gitlabApiClient, "apiRequest").mockRejectedValue(new Error("403 Forbidden"));
    const params = {
      projectName: "mcp",
      fields: ["id", "name", "description"]
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("403 Forbidden");
  });

  it("should handle 500 internal server error", async () => {
    jest.spyOn(gitlabApiClient, "apiRequest").mockRejectedValue(new Error("500 Internal Server Error"));
    const params = {
      projectName: "mcp",
      fields: ["id", "name", "description"]
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("500 Internal Server Error");
  });
});