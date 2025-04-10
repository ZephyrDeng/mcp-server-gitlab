import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { gitlabApiClient } from '../../utils/gitlabApiClientInstance';
import { GitlabCreateMRTool } from "../GitlabCreateMRTool";
import type { Context, ContentResult, TextContent } from 'fastmcp';

describe("GitlabCreateMRTool", () => {
  const mockContext = {} as Context<Record<string, unknown> | undefined>;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(gitlabApiClient, 'apiRequest').mockResolvedValue({ id: 789, title: "test mr" } as any);
  });

  it("should have correct metadata", () => {
    expect(GitlabCreateMRTool.name).toBe("Gitlab Create MR Tool");
    expect(GitlabCreateMRTool.description).toContain("Merge Request");
  });

  it("should create merge request with required params", async () => {
    const params = {
      projectId: "123",
      sourceBranch: "feature-branch",
      targetBranch: "main",
      title: "Test MR"
    };
    const result = await GitlabCreateMRTool.execute(params, mockContext) as ContentResult;
    expect(result.content[0].type).toBe("text");
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data.id).toBe(789);
    expect(data.title).toBe("test mr");
  });

  it("should create merge request with assignee and reviewers", async () => {
    const params = {
      projectId: "123",
      sourceBranch: "feature-branch",
      targetBranch: "main",
      title: "Test MR",
      assigneeId: 123,
      reviewerIds: [234, 345]
    };
    const result = await GitlabCreateMRTool.execute(params, mockContext) as ContentResult;
    expect(result.content[0].type).toBe("text");
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data.id).toBe(789);
  });

  it("should filter response fields", async () => {
    const params = {
      projectId: "123",
      sourceBranch: "feature-branch",
      targetBranch: "main",
      title: "Test MR",
      fields: ["id", "title"]
    };
    const result = await GitlabCreateMRTool.execute(params, mockContext) as ContentResult;
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("title");
  });

  it("should handle api error gracefully", async () => {
    jest.spyOn(gitlabApiClient, "apiRequest").mockRejectedValue(new Error("API error"));
    const params = {
      projectId: "123",
      sourceBranch: "feature-branch",
      targetBranch: "main",
      title: "Test MR"
    };
    const result = await GitlabCreateMRTool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("API error");
  });
});