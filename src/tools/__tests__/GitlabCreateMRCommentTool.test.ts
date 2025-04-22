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
    // Add mocks for resolver and validator
    jest.spyOn(gitlabApiClient, 'resolveProjectId').mockImplementation(async (idOrName) => {
       if (idOrName === '123' || idOrName === 123 || idOrName === 'test-project') return 123;
       return null;
    });
    jest.spyOn(gitlabApiClient, 'isValidResponse').mockReturnValue(true);
  });

  it("should have correct metadata", () => {
    // Tool instance is created in beforeEach
    expect(GitlabCreateMRCommentTool.name).toBe("Gitlab Create MR Comment Tool");
    expect(GitlabCreateMRCommentTool.description).toContain("评论");
  });

  it("should create comment successfully", async () => {
    const mockResponse = { id: 1, body: "请尽快审核" };
    // Mocks are set up in beforeEach

    const params = {
      projectId: "test-project", // Use name to test resolution
      mergeRequestId: 456,
      comment: "请尽快审核"
    };
    const result = await GitlabCreateMRCommentTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBeFalsy();
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse((result.content[0] as TextContent).text)).toEqual(mockResponse);
    // Verify apiRequest was called with resolved ID
    expect(gitlabApiClient.apiRequest).toHaveBeenCalledWith(
      '/projects/123/merge_requests/456/notes', // Resolved project ID
      'POST',
      undefined,
      { body: "请尽快审核" }
    );
  });

  it("should handle api error gracefully", async () => {
    // Override the mock implementation for this specific test
    // Test error during ID resolution
    jest.spyOn(gitlabApiClient, "resolveProjectId").mockResolvedValue(null);
    let params: any = { projectId: "invalid-project", mergeRequestId: 456, comment: "test" };
    let result = await GitlabCreateMRCommentTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain("无法解析项目 ID 或名称：invalid-project");

    // Reset mock and test error during API request
    jest.spyOn(gitlabApiClient, "resolveProjectId").mockResolvedValue(123); // Make resolution succeed
    mockApiRequest.mockRejectedValue(new Error("API error after resolution"));
    params = { projectId: "123", mergeRequestId: 456, comment: "test" };
    result = await GitlabCreateMRCommentTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("API error after resolution");

    // Test error response from API
    mockApiRequest.mockResolvedValue({ error: true, message: "Cannot add comment" });
    jest.spyOn(gitlabApiClient, 'isValidResponse').mockReturnValue(false); // Ensure isValidResponse reflects the error
    params = { projectId: "123", mergeRequestId: 456, comment: "test" };
    result = await GitlabCreateMRCommentTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain("GitLab API 错误：Cannot add comment");
  });
});