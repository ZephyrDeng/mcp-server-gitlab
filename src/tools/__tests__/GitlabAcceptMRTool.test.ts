import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { gitlabApiClient } from '../../utils/gitlabApiClientInstance';
import { GitlabAcceptMRTool } from "../GitlabAcceptMRTool";
import type { Context, ContentResult, TextContent } from 'fastmcp';

describe("GitlabAcceptMRTool", () => {
  const tool = GitlabAcceptMRTool;
  const mockContext = {} as Context<Record<string, unknown> | undefined>;
  let mockApiRequest: jest.SpiedFunction<typeof gitlabApiClient.apiRequest>; // Use SpiedFunction for better typing

  beforeEach(() => {
    jest.restoreAllMocks();
    // Mock ID resolution
    jest.spyOn(gitlabApiClient, 'resolveProjectId').mockImplementation(async (idOrName) => {
       if (idOrName === '123' || idOrName === 123 || idOrName === 'test-project') return 123;
       return null;
    });
     // Mock the final API request
    mockApiRequest = jest.spyOn(gitlabApiClient, 'apiRequest').mockResolvedValue({ id: 456, merged: true } as any);
    // Mock isValidResponse
    jest.spyOn(gitlabApiClient, 'isValidResponse').mockReturnValue(true);
  });

  it("should have correct metadata", () => {
    expect(tool.name).toBe("Gitlab Accept MR Tool");
    expect(tool.description).toContain("合并请求");
  });

  it("should accept merge request with example params", async () => {
    const mockResponse = { id: 456, merged: true };
    // Mocks are set up in beforeEach

    const params = {
      projectId: "test-project", // Use name
      mergeRequestId: 456,
      mergeOptions: {
        squash: true
      }
    };
    const result = await tool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBeFalsy();
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse((result.content[0] as TextContent).text)).toEqual(mockResponse);
    // Verify apiRequest was called with resolved ID
    expect(gitlabApiClient.apiRequest).toHaveBeenCalledWith(
      '/projects/123/merge_requests/456/merge', // Resolved project ID
      'PUT',
      undefined,
      { squash: true }
    );
  });

  it("should handle api error gracefully", async () => {
    // Test error during ID resolution
    jest.spyOn(gitlabApiClient, "resolveProjectId").mockResolvedValue(null);
    let params: any = { projectId: "invalid-project", mergeRequestId: 456 };
    let result = await tool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain("无法解析项目 ID 或名称：invalid-project");

    // Reset mock and test error during API request
    jest.spyOn(gitlabApiClient, "resolveProjectId").mockResolvedValue(123); // Make resolution succeed
    mockApiRequest.mockRejectedValue(new Error("API error after resolution"));
    params = { projectId: "123", mergeRequestId: 456 };
    result = await tool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("API error after resolution");

    // Test error response from API
    mockApiRequest.mockResolvedValue({ error: true, message: "Merge failed" });
    jest.spyOn(gitlabApiClient, 'isValidResponse').mockReturnValue(false); // Ensure isValidResponse reflects the error
    params = { projectId: "123", mergeRequestId: 456 };
    result = await tool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain("GitLab API 错误：Merge failed");
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