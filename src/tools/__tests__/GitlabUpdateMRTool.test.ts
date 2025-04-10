import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { gitlabApiClient } from '../../utils/gitlabApiClientInstance';
import { GitlabUpdateMRTool } from "../GitlabUpdateMRTool";
import type { Context, ContentResult, TextContent } from 'fastmcp';

describe("GitlabUpdateMRTool", () => {
  const mockContext = {} as Context<Record<string, unknown> | undefined>;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(gitlabApiClient, 'apiRequest').mockResolvedValue({ id: 456, assignee: { id: 123 }, reviewers: [{ id: 234 }] } as any);
  });

  it("should have correct metadata", () => {
    expect(GitlabUpdateMRTool.name).toBe("Gitlab Update MR Tool");
    expect(GitlabUpdateMRTool.description).toContain("Merge Request");
  });

  it("should update assignee and reviewers", async () => {
    const params = {
      projectId: "123",
      mergeRequestId: 456,
      assigneeId: 123,
      reviewerIds: [234, 345]
    };
    const result = await GitlabUpdateMRTool.execute(params, mockContext) as ContentResult;
    expect(result.content[0].type).toBe("text");
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data.id).toBe(456);
  });

  it("should filter response fields", async () => {
    const params = {
      projectId: "123",
      mergeRequestId: 456,
      assigneeId: 123,
      reviewerIds: [234],
      fields: ["id", "assignee.id"]
    };
    const result = await GitlabUpdateMRTool.execute(params, mockContext) as ContentResult;
    const data = JSON.parse((result.content[0] as TextContent).text);
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("assignee.id");
  });

  it("should handle api error gracefully", async () => {
    jest.spyOn(gitlabApiClient, "apiRequest").mockRejectedValue(new Error("API error"));
    const params = {
      projectId: "123",
      mergeRequestId: 456,
      assigneeId: 123
    };
    const result = await GitlabUpdateMRTool.execute(params, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('isError', true);
    expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    expect((result.content[0] as TextContent).text).toContain("API error");
  });
});