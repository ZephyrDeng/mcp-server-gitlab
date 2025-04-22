import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { gitlabApiClient } from '../../utils/gitlabApiClientInstance';
import { GitlabCreateMRTool } from "../GitlabCreateMRTool";
import type { Context, ContentResult, TextContent } from 'fastmcp';

describe("GitlabCreateMRTool", () => {
  const mockContext = {} as Context<Record<string, unknown> | undefined>;

  beforeEach(() => {
    jest.restoreAllMocks();
    // Mock ID resolution
    jest.spyOn(gitlabApiClient, 'resolveProjectId').mockImplementation(async (idOrName) => {
      if (idOrName === '123' || idOrName === 123 || idOrName === 'project-name') return 123;
      return null;
    });
    jest.spyOn(gitlabApiClient, 'resolveUserId').mockImplementation(async (idOrName) => {
      if (idOrName === 123 || idOrName === 'user-assignee') return 123;
      if (idOrName === 234 || idOrName === 'user-reviewer1') return 234;
      if (idOrName === 345 || idOrName === 'user-reviewer2') return 345;
      return null;
    });
    // Mock the final API request
    jest.spyOn(gitlabApiClient, 'apiRequest').mockResolvedValue({
      id: 789,
      title: "Test MR",
      assignee: { id: 123 },
      reviewers: [{ id: 234 }, { id: 345 }]
    } as any);
    // Mock isValidResponse
    jest.spyOn(gitlabApiClient, 'isValidResponse').mockReturnValue(true);
  });

  it("should have correct metadata", () => {
    expect(GitlabCreateMRTool.name).toBe("Gitlab Create MR Tool");
    expect(GitlabCreateMRTool.description).toContain("Merge Request");
  });

  it("should create merge request with required params", async () => {
    const params = {
      projectId: "project-name", // Use name
      sourceBranch: "feature-branch",
      targetBranch: "main",
      title: "Test MR"
    };
    const result = await GitlabCreateMRTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBeFalsy();
    expect(result.content[0].type).toBe("text");
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data.id).toBe(789);
    expect(data.title).toBe("Test MR"); // Should match mock response now
    expect(gitlabApiClient.apiRequest).toHaveBeenCalledWith(
      '/projects/123/merge_requests', // Resolved project ID
      'POST',
      undefined,
      expect.objectContaining({ source_branch: 'feature-branch', target_branch: 'main', title: 'Test MR' })
    );
  });

  it("should create merge request with assignee and reviewers", async () => {
    const params = {
      projectId: 123, // Use ID
      sourceBranch: "feature-branch",
      targetBranch: "main",
      title: "Test MR with Users",
      assigneeId: "user-assignee", // Use name
      reviewerIds: ["user-reviewer1", 345] // Mix names and IDs
    };
    const result = await GitlabCreateMRTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBeFalsy();
    expect(result.content[0].type).toBe("text");
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data.id).toBe(789);
    expect(gitlabApiClient.apiRequest).toHaveBeenCalledWith(
      '/projects/123/merge_requests',
      'POST',
      undefined,
      expect.objectContaining({ assignee_id: 123, reviewer_ids: [234, 345], title: "Test MR with Users" }) // Resolved IDs
    );
  });

  it("should filter response fields", async () => {
    const params = {
      projectId: 123,
      sourceBranch: "feature-branch",
      targetBranch: "main",
      title: "Test MR Filtered",
      fields: ["id", "title"]
    };
     // Adjust mock response for this specific test if needed
     jest.spyOn(gitlabApiClient, 'apiRequest').mockResolvedValue({
       id: 789,
       title: "Test MR Filtered",
       // Other fields omitted
     } as any);

    const result = await GitlabCreateMRTool.execute(params, mockContext) as ContentResult;
     expect(result.isError).toBeFalsy();
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data).toEqual({ id: 789, title: "Test MR Filtered" });
  });

  it("should handle api error gracefully", async () => {
    // Test error during ID resolution
    jest.spyOn(gitlabApiClient, "resolveProjectId").mockResolvedValue(null);
    let params: any = { projectId: "invalid", sourceBranch: "f", targetBranch: "m", title: "t" };
    let result = await GitlabCreateMRTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain("无法解析项目 ID 或名称：invalid");

    // Reset mock and test error during API request
    jest.spyOn(gitlabApiClient, "resolveProjectId").mockResolvedValue(123);
    jest.spyOn(gitlabApiClient, "apiRequest").mockRejectedValue(new Error("API error after resolution"));
    params = { projectId: "123", sourceBranch: "f", targetBranch: "m", title: "t" };
    result = await GitlabCreateMRTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("API error after resolution");

    // Test error response from API
    jest.spyOn(gitlabApiClient, "apiRequest").mockResolvedValue({ error: true, message: "MR creation failed" });
    jest.spyOn(gitlabApiClient, 'isValidResponse').mockReturnValue(false);
    params = { projectId: "123", sourceBranch: "f", targetBranch: "m", title: "t" };
    result = await GitlabCreateMRTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain("GitLab API 错误：MR creation failed");
  });
});