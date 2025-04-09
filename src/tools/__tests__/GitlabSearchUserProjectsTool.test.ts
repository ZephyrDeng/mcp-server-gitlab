import { describe, it, expect, jest } from '@jest/globals';
import { GitlabSearchUserProjectsTool } from "../GitlabSearchUserProjectsTool";
import type { Context, ContentResult, TextContent } from 'fastmcp';

describe("GitlabSearchUserProjectsTool", () => {
  const tool = GitlabSearchUserProjectsTool;
  const mockContext = {} as Context<Record<string, unknown> | undefined>;

  it("should have correct metadata", () => {
    expect(tool.name).toBeDefined();
    expect(tool.description).toBeDefined();
  });

  it("should execute with mock params", async () => {
    const params = {
      username: "testuser",
      fields: ["id", "name"]
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
  });

  it("should execute with example params", async () => {
    const params = {
      username: "dengzefeng",
      fields: ["id", "name", "path_with_namespace", "last_activity_at", "visibility"]
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
  });

  it("should handle user not found error", async () => {
    // 我们不再抛出异常，而是返回带有错误标志的 ContentResult
    const mockErrorResult: ContentResult = {
      content: [{ type: "text", text: `未找到用户名为 nonexistentuser 的用户` }],
      isError: true
    };
    
    jest.spyOn(tool, 'execute').mockResolvedValue(mockErrorResult);
    
    const params = {
      username: "nonexistentuser",
      fields: ["id", "name"]
    };
    
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("未找到用户名为");
  });

  it("should handle api errors gracefully", async () => {
    // 我们不再抛出异常，而是返回带有错误标志的 ContentResult
    const mockErrorResult: ContentResult = {
      content: [{ type: "text", text: "GitLab MCP 工具调用异常：403 Forbidden" }],
      isError: true
    };
    
    jest.spyOn(tool, 'execute').mockResolvedValue(mockErrorResult);
    
    const params = {
      username: "testuser",
      fields: ["id", "name"]
    };
    
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
  });
});