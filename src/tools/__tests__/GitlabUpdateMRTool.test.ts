import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { gitlabApiClient } from '../../utils/gitlabApiClientInstance';
import { GitlabUpdateMRTool } from "../GitlabUpdateMRTool";
import type { Context, ContentResult, TextContent } from 'fastmcp';

describe("GitlabUpdateMRTool", () => {
  const mockContext = {} as Context<Record<string, unknown> | undefined>;

  beforeEach(() => {
    jest.restoreAllMocks();
    // Mock ID resolution
    jest.spyOn(gitlabApiClient, 'resolveProjectId').mockImplementation(async (idOrName) => {
      if (idOrName === '123' || idOrName === 123 || idOrName === 'project-name') return 123;
      return null; // Simulate failure for other inputs if needed
    });
    jest.spyOn(gitlabApiClient, 'resolveUserId').mockImplementation(async (idOrName) => {
      if (idOrName === 123 || idOrName === 'user-assignee') return 123;
      if (idOrName === 234 || idOrName === 'user-reviewer1') return 234;
      if (idOrName === 345 || idOrName === 'user-reviewer2') return 345;
      return null; // Simulate failure
    });
    // Mock the final API request after resolution
    jest.spyOn(gitlabApiClient, 'apiRequest').mockResolvedValue({
      id: 456, // MR ID
      assignee: { id: 123 }, // Reflects resolved assignee
      reviewers: [{ id: 234 }, { id: 345 }] // Reflects resolved reviewers
    } as any);
     // Mock isValidResponse to always return true for successful mocks
    jest.spyOn(gitlabApiClient, 'isValidResponse').mockReturnValue(true);
  });

  it("should have correct metadata", () => {
    expect(GitlabUpdateMRTool.name).toBe("Gitlab Update MR Tool");
    expect(GitlabUpdateMRTool.description).toContain("Merge Request");
  });

  it("should update assignee and reviewers", async () => {
    const params = {
      projectId: "project-name", // Use name
      mergeRequestId: 456,
      assigneeId: "user-assignee", // Use name
      reviewerIds: ["user-reviewer1", 345] // Mix names and IDs
    };
    const result = await GitlabUpdateMRTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBeFalsy(); // Ensure no error
    expect(result.content[0].type).toBe("text");
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data.id).toBe(456);
    // Check if apiRequest was called with resolved IDs
    expect(gitlabApiClient.apiRequest).toHaveBeenCalledWith(
      expect.stringContaining('/projects/123/merge_requests/456'), // Resolved project ID
      'PUT',
      undefined,
      expect.objectContaining({ assignee_id: 123, reviewer_ids: [234, 345] }) // Resolved user IDs
    );
  });

  it("should filter response fields", async () => {
    const params = {
      projectId: 123, // Use ID
      mergeRequestId: 456,
      assigneeId: 123, // Use ID
      reviewerIds: [234], // Use ID
      fields: ["id", "assignee.id"]
    };
     // Adjust mock response for this specific test if needed, or rely on beforeEach mock
     jest.spyOn(gitlabApiClient, 'apiRequest').mockResolvedValue({
       id: 456,
       assignee: { id: 123 }
       // reviewers field is omitted as it wasn't requested in 'fields'
     } as any);

    const result = await GitlabUpdateMRTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBeFalsy();
    const data = JSON.parse((result.content[0] as TextContent).text);
    // Field filtering happens *after* the API call, based on the API response
    expect(data).toEqual({ id: 456, assignee: { id: 123 } });
  });

  it("should handle api error gracefully", async () => {
    // Test error during ID resolution
    jest.spyOn(gitlabApiClient, "resolveProjectId").mockResolvedValue(null);
    let params: any = { projectId: "invalid-project", mergeRequestId: 456 }; // Use 'any' or a more specific type
    let result = await GitlabUpdateMRTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain("无法解析项目 ID 或名称：invalid-project");

    // Reset mock and test error during API request
    jest.spyOn(gitlabApiClient, "resolveProjectId").mockResolvedValue(123); // Make resolution succeed
    jest.spyOn(gitlabApiClient, "apiRequest").mockRejectedValue(new Error("API error after resolution"));
    params = { projectId: "123", mergeRequestId: 456, title: "New Title" }; // TS should be fine now
    result = await GitlabUpdateMRTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("API error after resolution");

     // Test error response from API
    jest.spyOn(gitlabApiClient, "apiRequest").mockResolvedValue({ error: true, message: "Invalid MR" });
    jest.spyOn(gitlabApiClient, 'isValidResponse').mockReturnValue(false); // Ensure isValidResponse reflects the error
    params = { projectId: "123", mergeRequestId: 456, title: "New Title" };
    result = await GitlabUpdateMRTool.execute(params, mockContext) as ContentResult;
    expect(result.isError).toBe(true);
    expect((result.content[0] as TextContent).text).toContain("GitLab API 错误：Invalid MR");
  });
});