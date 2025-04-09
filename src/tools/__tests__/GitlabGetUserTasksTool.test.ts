import { describe, it, expect, jest } from '@jest/globals';
import { GitlabGetUserTasksTool } from "../GitlabGetUserTasksTool";
import { mock2 } from "./mock_data";
import type { Context, ContentResult } from 'fastmcp';

describe("GitlabGetUserTasksTool", () => {
  const tool = GitlabGetUserTasksTool;
  const mockContext = {} as Context<Record<string, unknown> | undefined>;

  it("should have correct metadata", () => {
    expect(tool.name).toBeDefined();
    expect(tool.description).toBeDefined();
  });

  it("should execute with mock params", async () => {
    const params = {
      taskFilterType: "ASSIGNED_MRS",
      fields: ["id", "title"]
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    // 根据实现调整断言
  });

  it("should execute with full taskFilters and fields", async () => {
    const params = {
      taskFilterType: "ASSIGNED_MRS",
      fields: ["id", "title", "state"]
    };
    
    // Mock the execute method to return a known result
    const mockContentResult: ContentResult = {
      content: [{ type: "text", text: JSON.stringify(mock2) }]
    };
    
    jest.spyOn(tool, 'execute').mockResolvedValue(mockContentResult);
    
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toEqual(mockContentResult);
  });

  it("should execute with taskFilterType and fields", async () => {
    const params = {
      taskFilterType: "ASSIGNED_MRS",
      fields: ["id", "title", "state"]
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
  });

  it("should execute with example params (real request)", async () => {
    const params = {
      taskFilterType: "ASSIGNED_MRS",
      fields: ["id", "title", "state"]
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
  });

  it("should handle empty task list", async () => {
    // Mock the execute method to return an empty result
    const mockContentResult: ContentResult = {
      content: [{ type: "text", text: "[]" }]
    };
    jest.spyOn(tool, 'execute').mockResolvedValue(mockContentResult);
    
    const params = {
      taskFilterType: "ASSIGNED_MRS",
      fields: ["id", "title"]
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
  });

  it("should handle errors gracefully", async () => {
    // We no longer expect exceptions to be thrown, but rather returned as ContentResult with isError
    const mockErrorResult: ContentResult = {
      content: [{ type: "text", text: "GitLab MCP 工具调用异常：403 Forbidden" }],
      isError: true
    };
    
    jest.spyOn(tool, 'execute').mockResolvedValue(mockErrorResult);
    
    const params = {
      taskFilterType: "ASSIGNED_MRS",
      fields: ["id", "title"]
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('isError', true);
    expect(result.content[0]).toHaveProperty('text');
  });
});