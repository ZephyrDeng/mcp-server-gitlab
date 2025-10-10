import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import * as gitlabClientFactory from "../../utils/gitlabClientFactory";
import { GitlabAcceptMRTool } from "../GitlabAcceptMRTool";
import type { Context, ContentResult, TextContent } from "fastmcp";

describe("GitlabAcceptMRTool", () => {
  const tool = GitlabAcceptMRTool;
  const mockContext = {} as Context<Record<string, unknown> | undefined>;

  // Create mock client instance
  const mockClient = {
    resolveProjectId: jest.fn() as any,
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
    mockClient.resolveProjectId.mockImplementation(async (idOrName: any) => {
      if (idOrName === "123" || idOrName === 123 || idOrName === "test-project")
        return 123;
      return null;
    });
    mockClient.apiRequest.mockResolvedValue({ id: 456, merged: true });
    mockClient.isValidResponse.mockReturnValue(true);
  });

  it("should have correct metadata", () => {
    expect(tool.name).toBe("Gitlab Accept MR Tool");
    expect(tool.description).toContain("合并请求");
  });

  it("should accept merge request with example params", async () => {
    const mockResponse = { id: 456, merged: true };

    const params = {
      projectId: "test-project",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true,
      },
    };
    const result = (await tool.execute(params, mockContext)) as ContentResult;
    expect(result.isError).toBeFalsy();
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse((result.content[0] as TextContent).text)).toEqual(
      mockResponse,
    );
    // Verify apiRequest was called with resolved ID
    expect(mockClient.apiRequest).toHaveBeenCalledWith(
      "/projects/123/merge_requests/456/merge",
      "PUT",
      undefined,
      { squash: true },
    );
  });

  it("should handle api error gracefully", async () => {
    // Test error during ID resolution
    mockClient.resolveProjectId.mockResolvedValue(null);
    let params: any = { projectId: "invalid-project", mergeRequestId: 456 };
    let result = (await tool.execute(params, mockContext)) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain(
      "无法解析项目 ID 或名称：invalid-project",
    );

    // Reset mock and test error during API request
    mockClient.resolveProjectId.mockResolvedValue(123);
    mockClient.apiRequest.mockRejectedValue(
      new Error("API error after resolution"),
    );
    params = { projectId: "123", mergeRequestId: 456 };
    result = (await tool.execute(params, mockContext)) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain(
      "GitLab MCP 工具调用异常",
    );
    expect((result.content[0] as TextContent).text).toContain(
      "API error after resolution",
    );

    // Test error response from API
    mockClient.apiRequest.mockResolvedValue({
      error: true,
      message: "Merge failed",
    });
    mockClient.isValidResponse.mockReturnValue(false);
    params = { projectId: "123", mergeRequestId: 456 };
    result = (await tool.execute(params, mockContext)) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain(
      "GitLab API error: Merge failed",
    );
  });

  it("should handle 404 not found error", async () => {
    mockClient.apiRequest.mockRejectedValue(new Error("404 Project Not Found"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true,
      },
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

  it("should handle 403 forbidden error", async () => {
    mockClient.apiRequest.mockRejectedValue(new Error("403 Forbidden"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true,
      },
    };
    const result = (await tool.execute(params, mockContext)) as ContentResult;
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("isError", true);
    expect((result.content[0] as TextContent).text).toContain(
      "GitLab MCP 工具调用异常",
    );
    expect((result.content[0] as TextContent).text).toContain("403 Forbidden");
  });

  it("should handle 409 merge conflict error", async () => {
    mockClient.apiRequest.mockRejectedValue(new Error("409 Merge Conflict"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true,
      },
    };
    const result = (await tool.execute(params, mockContext)) as ContentResult;
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("isError", true);
    expect((result.content[0] as TextContent).text).toContain(
      "GitLab MCP 工具调用异常",
    );
    expect((result.content[0] as TextContent).text).toContain(
      "409 Merge Conflict",
    );
  });

  it("should handle 500 internal server error", async () => {
    mockClient.apiRequest.mockRejectedValue(
      new Error("500 Internal Server Error"),
    );

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true,
      },
    };
    const result = (await tool.execute(params, mockContext)) as ContentResult;
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("isError", true);
    expect((result.content[0] as TextContent).text).toContain(
      "GitLab MCP 工具调用异常",
    );
    expect((result.content[0] as TextContent).text).toContain(
      "500 Internal Server Error",
    );
  });
});
