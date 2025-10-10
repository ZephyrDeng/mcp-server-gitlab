import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { GitlabCreateMRCommentTool } from "../GitlabCreateMRCommentTool";
import * as gitlabClientFactory from "../../utils/gitlabClientFactory";
import type { Context, ContentResult, TextContent } from "fastmcp";

describe("GitlabCreateMRCommentTool", () => {
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
    mockClient.apiRequest.mockResolvedValue({ id: 1, body: "请尽快审核" });
    mockClient.resolveProjectId.mockImplementation(async (idOrName: any) => {
      if (idOrName === "123" || idOrName === 123 || idOrName === "test-project")
        return 123;
      return null;
    });
    mockClient.isValidResponse.mockReturnValue(true);
  });

  it("should have correct metadata", () => {
    // Tool instance is created in beforeEach
    expect(GitlabCreateMRCommentTool.name).toBe(
      "Gitlab Create MR Comment Tool",
    );
    expect(GitlabCreateMRCommentTool.description).toContain("评论");
  });

  it("should create comment successfully", async () => {
    const mockResponse = { id: 1, body: "请尽快审核" };

    const params = {
      projectId: "test-project",
      mergeRequestId: 456,
      comment: "请尽快审核",
    };
    const result = (await GitlabCreateMRCommentTool.execute(
      params,
      mockContext,
    )) as ContentResult;
    expect(result.isError).toBeFalsy();
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse((result.content[0] as TextContent).text)).toEqual(
      mockResponse,
    );
    expect(mockClient.apiRequest).toHaveBeenCalledWith(
      "/projects/123/merge_requests/456/notes",
      "POST",
      undefined,
      { body: "请尽快审核" },
    );
  });

  it("should handle api error gracefully", async () => {
    // Test error during ID resolution
    mockClient.resolveProjectId.mockResolvedValue(null);
    let params: any = {
      projectId: "invalid-project",
      mergeRequestId: 456,
      comment: "test",
    };
    let result = (await GitlabCreateMRCommentTool.execute(
      params,
      mockContext,
    )) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain(
      "无法解析项目 ID 或名称：invalid-project",
    );

    // Reset mock and test error during API request
    mockClient.resolveProjectId.mockResolvedValue(123);
    mockClient.apiRequest.mockRejectedValue(
      new Error("API error after resolution"),
    );
    params = { projectId: "123", mergeRequestId: 456, comment: "test" };
    result = (await GitlabCreateMRCommentTool.execute(
      params,
      mockContext,
    )) as ContentResult;
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
      message: "Cannot add comment",
    });
    mockClient.isValidResponse.mockReturnValue(false);
    params = { projectId: "123", mergeRequestId: 456, comment: "test" };
    result = (await GitlabCreateMRCommentTool.execute(
      params,
      mockContext,
    )) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain(
      "GitLab API error: Cannot add comment",
    );
  });
});
