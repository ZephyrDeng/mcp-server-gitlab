import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GitlabCreateMRCommentTool } from "../GitlabCreateMRCommentTool";
import { gitlabApiClient } from '../../utils/gitlabApiClientInstance';
import type { Context, ContentResult, TextContent } from 'fastmcp';

// 移除 vi.mock，改为 spyOn

describe("GitlabCreateMRCommentTool", () => {
  let mockApiRequest: any; // To hold the mocked instance method
  const mockContext = {} as Context<Record<string, unknown> | undefined>;
  
  beforeEach(() => {
    // @ts-ignore
    mockApiRequest = jest.fn().mockResolvedValue({ id: 1, body: '请尽快审核' });
    jest.spyOn(gitlabApiClient, 'apiRequest').mockImplementation(mockApiRequest);
  });
  
  it("should have correct metadata", () => {
    // Tool instance is created in beforeEach
    expect(GitlabCreateMRCommentTool.name).toBe("Gitlab Create MR Comment Tool");
    expect(GitlabCreateMRCommentTool.description).toContain("评论");
  });

  it("should create comment successfully", async () => {
    const mockResponse = { id: 1, body: "请尽快审核" };
    // Mock should be set up by beforeEach

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      comment: "请尽快审核"
    };
    const result = await GitlabCreateMRCommentTool.execute(params, mockContext) as ContentResult;
    expect(result).toEqual({
      content: [{ type: "text", text: JSON.stringify(mockResponse) }]
    });
  });

  it("should handle api error gracefully", async () => {
    // Override the mock implementation for this specific test
    mockApiRequest.mockRejectedValue(new Error("API error"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      comment: "请尽快审核"
    };
    const result = await GitlabCreateMRCommentTool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("API error");
  });

  it("should handle 404 not found error", async () => {
    mockApiRequest.mockRejectedValue(new Error("404 Project Not Found"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      comment: "请尽快审核"
    };
    const result = await GitlabCreateMRCommentTool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("404 Project Not Found");
  });

  it("should handle 403 forbidden error", async () => {
    mockApiRequest.mockRejectedValue(new Error("403 Forbidden"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      comment: "请尽快审核"
    };
    const result = await GitlabCreateMRCommentTool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("403 Forbidden");
  });

  it("should handle 500 internal server error", async () => {
    mockApiRequest.mockRejectedValue(new Error("500 Internal Server Error"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      comment: "请尽快审核"
    };
    const result = await GitlabCreateMRCommentTool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("500 Internal Server Error");
  });
});