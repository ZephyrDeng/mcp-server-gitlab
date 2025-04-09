import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { gitlabApiClient } from '../../utils/gitlabApiClientInstance';
import { GitlabAcceptMRTool } from "../GitlabAcceptMRTool";
import type { Context, ContentResult, TextContent } from 'fastmcp';

describe("GitlabAcceptMRTool", () => {
  beforeEach(() => {
    jest.spyOn(gitlabApiClient, 'apiRequest').mockResolvedValue({ id: 456, merged: true } as any);
  });
  const tool = GitlabAcceptMRTool;
  const mockContext = {} as Context<Record<string, unknown> | undefined>;

  beforeEach(() => {
    jest.restoreAllMocks();
    // @ts-ignore
    (tool as any).apiClient = { apiRequest: jest.fn().mockResolvedValue({ id: 456, merged: true }) };
    jest.spyOn(gitlabApiClient, 'apiRequest').mockResolvedValue({ id: 456, merged: true } as any);
  });

  it("should have correct metadata", () => {
    expect(tool.name).toBe("Gitlab Accept MR Tool");
    expect(tool.description).toContain("合并请求");
  });

  it("should accept merge request with example params", async () => {
    const mockResponse = { id: 456, merged: true };
    // mock 已在 beforeEach 中设置

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true
      }
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(mockResponse) }]
    });
  });

  it("should handle api error gracefully", async () => {
    jest.spyOn(gitlabApiClient, "apiRequest").mockRejectedValue(new Error("API error"));
  
    const params = {
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true
      }
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
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true
      }
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
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true
      }
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("403 Forbidden");
  });

  it("should handle 409 merge conflict error", async () => {
    jest.spyOn(gitlabApiClient, "apiRequest").mockRejectedValue(new Error("409 Merge Conflict"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true
      }
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("409 Merge Conflict");
  });

  it("should handle 500 internal server error", async () => {
    jest.spyOn(gitlabApiClient, "apiRequest").mockRejectedValue(new Error("500 Internal Server Error"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true
      }
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("500 Internal Server Error");
  });
});