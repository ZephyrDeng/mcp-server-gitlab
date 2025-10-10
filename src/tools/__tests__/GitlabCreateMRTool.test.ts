import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import * as gitlabClientFactory from "../../utils/gitlabClientFactory";
import { GitlabCreateMRTool } from "../GitlabCreateMRTool";
import type { Context, ContentResult, TextContent } from "fastmcp";

describe("GitlabCreateMRTool", () => {
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
      id: 789,
      title: "Test MR",
      assignee: { id: 123 },
      reviewers: [{ id: 234 }, { id: 345 }],
    });
    mockClient.isValidResponse.mockReturnValue(true);
  });

  it("should have correct metadata", () => {
    expect(GitlabCreateMRTool.name).toBe("Gitlab Create MR Tool");
    expect(GitlabCreateMRTool.description).toContain("Merge Request");
  });

  it("should create merge request with required params", async () => {
    const params = {
      projectId: "project-name",
      sourceBranch: "feature-branch",
      targetBranch: "main",
      title: "Test MR",
    };
    const result = (await GitlabCreateMRTool.execute(
      params,
      mockContext,
    )) as ContentResult;
    expect(result.isError).toBeFalsy();
    expect(result.content[0].type).toBe("text");
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data.id).toBe(789);
    expect(data.title).toBe("Test MR");
    expect(mockClient.apiRequest).toHaveBeenCalledWith(
      "/projects/123/merge_requests",
      "POST",
      undefined,
      expect.objectContaining({
        source_branch: "feature-branch",
        target_branch: "main",
        title: "Test MR",
      }),
    );
  });

  it("should create merge request with assignee and reviewers", async () => {
    const params = {
      projectId: 123,
      sourceBranch: "feature-branch",
      targetBranch: "main",
      title: "Test MR with Users",
      assigneeId: "user-assignee",
      reviewerIds: ["user-reviewer1", 345],
    };
    const result = (await GitlabCreateMRTool.execute(
      params,
      mockContext,
    )) as ContentResult;
    expect(result.isError).toBeFalsy();
    expect(result.content[0].type).toBe("text");
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data.id).toBe(789);
    expect(mockClient.apiRequest).toHaveBeenCalledWith(
      "/projects/123/merge_requests",
      "POST",
      undefined,
      expect.objectContaining({
        assignee_id: 123,
        reviewer_ids: [234, 345],
        title: "Test MR with Users",
      }),
    );
  });

  it("should filter response fields", async () => {
    const params = {
      projectId: 123,
      sourceBranch: "feature-branch",
      targetBranch: "main",
      title: "Test MR Filtered",
      fields: ["id", "title"],
    };
    // Adjust mock response for this specific test if needed
    jest
      .spyOn(gitlabClientFactory, "createGitlabClientFromContext")
      .mockReturnValue({
        resolveProjectId: (jest.fn() as any).mockResolvedValue(123),
        apiRequest: (jest.fn() as any).mockResolvedValue({
          id: 789,
          title: "Test MR Filtered",
          // Other fields omitted
        }),
        isValidResponse: (jest.fn() as any).mockReturnValue(true),
      } as any);

    const result = (await GitlabCreateMRTool.execute(
      params,
      mockContext,
    )) as ContentResult;
    expect(result.isError).toBeFalsy();
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data).toEqual({ id: 789, title: "Test MR Filtered" });
  });

  it("should handle api error gracefully", async () => {
    // Test error during ID resolution
    jest
      .spyOn(gitlabClientFactory, "createGitlabClientFromContext")
      .mockReturnValue({
        resolveProjectId: (jest.fn() as any).mockResolvedValue(null) as any,
        apiRequest: jest.fn() as any,
        isValidResponse: jest.fn() as any,
      } as any);
    let params: any = {
      projectId: "invalid",
      sourceBranch: "f",
      targetBranch: "m",
      title: "t",
    };
    let result = (await GitlabCreateMRTool.execute(
      params,
      mockContext,
    )) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain(
      "无法解析项目 ID 或名称：invalid",
    );

    // Reset mock and test error during API request
    jest
      .spyOn(gitlabClientFactory, "createGitlabClientFromContext")
      .mockReturnValue({
        resolveProjectId: (jest.fn() as any).mockResolvedValue(123),
        apiRequest: (jest.fn() as any).mockRejectedValue(
          new Error("API error after resolution"),
        ),
        isValidResponse: jest.fn() as any,
      } as any);
    params = {
      projectId: "123",
      sourceBranch: "f",
      targetBranch: "m",
      title: "t",
    };
    result = (await GitlabCreateMRTool.execute(
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
    jest
      .spyOn(gitlabClientFactory, "createGitlabClientFromContext")
      .mockReturnValue({
        resolveProjectId: (jest.fn() as any).mockResolvedValue(123),
        apiRequest: (jest.fn() as any).mockResolvedValue({
          error: true,
          message: "MR creation failed",
        }),
        isValidResponse: (jest.fn() as any).mockReturnValue(false),
      } as any);
    params = {
      projectId: "123",
      sourceBranch: "f",
      targetBranch: "m",
      title: "t",
    };
    result = (await GitlabCreateMRTool.execute(
      params,
      mockContext,
    )) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain(
      "GitLab API error: MR creation failed",
    );
  });
});
