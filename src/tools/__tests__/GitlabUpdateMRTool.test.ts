import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import * as gitlabClientFactory from "../../utils/gitlabClientFactory";
import { GitlabUpdateMRTool } from "../GitlabUpdateMRTool";
import type { Context, ContentResult, TextContent } from "fastmcp";

describe("GitlabUpdateMRTool", () => {
  const mockContext = {} as Context<Record<string, unknown> | undefined>;

  // Create mock client instance
  const mockClient = {
    resolveProjectId: jest.fn() as any,
    resolveUserId: jest.fn() as any,
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
      if (idOrName === "123" || idOrName === 123 || idOrName === "project-name")
        return 123;
      return null;
    });
    mockClient.resolveUserId.mockImplementation(async (idOrName: any) => {
      if (idOrName === 123 || idOrName === "user-assignee") return 123;
      if (idOrName === 234 || idOrName === "user-reviewer1") return 234;
      if (idOrName === 345 || idOrName === "user-reviewer2") return 345;
      return null;
    });
    mockClient.apiRequest.mockResolvedValue({
      id: 456,
      assignee: { id: 123 },
      reviewers: [{ id: 234 }, { id: 345 }],
    });
    mockClient.isValidResponse.mockReturnValue(true);
  });

  it("should have correct metadata", () => {
    expect(GitlabUpdateMRTool.name).toBe("Gitlab Update MR Tool");
    expect(GitlabUpdateMRTool.description).toContain("Merge Request");
  });

  it("should update assignee and reviewers", async () => {
    const params = {
      projectId: "project-name",
      mergeRequestId: 456,
      assigneeId: "user-assignee",
      reviewerIds: ["user-reviewer1", 345],
    };
    const result = (await GitlabUpdateMRTool.execute(
      params,
      mockContext,
    )) as ContentResult;
    expect(result.isError).toBeFalsy();
    expect(result.content[0].type).toBe("text");
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data.id).toBe(456);
    expect(mockClient.apiRequest).toHaveBeenCalledWith(
      expect.stringContaining("/projects/123/merge_requests/456"),
      "PUT",
      undefined,
      expect.objectContaining({ assignee_id: 123, reviewer_ids: [234, 345] }),
    );
  });

  it("should filter response fields", async () => {
    const params = {
      projectId: 123,
      mergeRequestId: 456,
      assigneeId: 123,
      reviewerIds: [234],
      fields: ["id", "assignee.id"],
    };
    mockClient.apiRequest.mockResolvedValue({
      id: 456,
      assignee: { id: 123 },
    });

    const result = (await GitlabUpdateMRTool.execute(
      params,
      mockContext,
    )) as ContentResult;
    expect(result.isError).toBeFalsy();
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data).toEqual({ id: 456, assignee: { id: 123 } });
  });

  it("should handle api error gracefully", async () => {
    // Test error during ID resolution
    mockClient.resolveProjectId.mockResolvedValue(null);
    let params: any = { projectId: "invalid-project", mergeRequestId: 456 };
    let result = (await GitlabUpdateMRTool.execute(
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
    params = { projectId: "123", mergeRequestId: 456, title: "New Title" };
    result = (await GitlabUpdateMRTool.execute(
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
      message: "Invalid MR",
    });
    mockClient.isValidResponse.mockReturnValue(false);
    params = { projectId: "123", mergeRequestId: 456, title: "New Title" };
    result = (await GitlabUpdateMRTool.execute(
      params,
      mockContext,
    )) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain(
      "GitLab API error: Invalid MR",
    );
  });
});
