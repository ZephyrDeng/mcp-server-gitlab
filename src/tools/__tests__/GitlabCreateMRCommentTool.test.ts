import { GitlabCreateMRCommentTool } from "../GitlabCreateMRCommentTool";

describe("GitlabCreateMRCommentTool", () => {
  const tool = new GitlabCreateMRCommentTool();

  it("should have correct metadata", () => {
    expect(tool.name).toBe("Gitlab Create MR Comment Tool");
    expect(tool.description).toContain("评论");
  });

  it("should create comment successfully", async () => {
    const mockResponse = { id: 1, body: "请尽快审核" };
    jest.spyOn((tool as any).apiClient, "apiRequest").mockResolvedValue(mockResponse);

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      comment: "请尽快审核"
    };
    const result = await tool.execute(params);
    expect(result).toEqual(mockResponse);
  });

  it("should handle api error gracefully", async () => {
    jest.spyOn((tool as any).apiClient, "apiRequest").mockRejectedValue(new Error("API error"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      comment: "请尽快审核"
    };
    const result = await tool.execute(params);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].text).toContain("GitLab MCP 工具调用异常");
    expect(result[0].text).toContain("API error");
  });

  it("should handle 404 not found error", async () => {
    jest.spyOn((tool as any).apiClient, "apiRequest").mockRejectedValue(new Error("404 Project Not Found"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      comment: "请尽快审核"
    };
    const result = await tool.execute(params);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].text).toContain("GitLab MCP 工具调用异常");
    expect(result[0].text).toContain("404 Project Not Found");
  });

  it("should handle 403 forbidden error", async () => {
    jest.spyOn((tool as any).apiClient, "apiRequest").mockRejectedValue(new Error("403 Forbidden"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      comment: "请尽快审核"
    };
    const result = await tool.execute(params);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].text).toContain("GitLab MCP 工具调用异常");
    expect(result[0].text).toContain("403 Forbidden");
  });

  it("should handle 500 internal server error", async () => {
    jest.spyOn((tool as any).apiClient, "apiRequest").mockRejectedValue(new Error("500 Internal Server Error"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      comment: "请尽快审核"
    };
    const result = await tool.execute(params);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].text).toContain("GitLab MCP 工具调用异常");
    expect(result[0].text).toContain("500 Internal Server Error");
  });
});