import { GitlabAcceptMRTool } from "../GitlabAcceptMRTool";

describe("GitlabAcceptMRTool", () => {
  const tool = new GitlabAcceptMRTool();

  it("should have correct metadata", () => {
    expect(tool.name).toBe("Gitlab Accept MR Tool");
    expect(tool.description).toContain("合并请求");
  });

  it("should accept merge request with example params", async () => {
    const mockResponse = { id: 456, merged: true };
    jest.spyOn((tool as any).apiClient, "apiRequest").mockResolvedValue(mockResponse);

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true,
        merge_when_pipeline_succeeds: false
      }
    };
    const result = await tool.execute(params);
    expect(result).toEqual(mockResponse);
  });

  it("should handle api error gracefully", async () => {
    jest.spyOn((tool as any).apiClient, "apiRequest").mockRejectedValue(new Error("API error"));
  
    const params = {
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true,
        merge_when_pipeline_succeeds: false
      }
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
      mergeOptions: {
        squash: true,
        merge_when_pipeline_succeeds: false
      }
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
      mergeOptions: {
        squash: true,
        merge_when_pipeline_succeeds: false
      }
    };
    const result = await tool.execute(params);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].text).toContain("GitLab MCP 工具调用异常");
    expect(result[0].text).toContain("403 Forbidden");
  });

  it("should handle 409 merge conflict error", async () => {
    jest.spyOn((tool as any).apiClient, "apiRequest").mockRejectedValue(new Error("409 Merge Conflict"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true,
        merge_when_pipeline_succeeds: false
      }
    };
    const result = await tool.execute(params);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].text).toContain("GitLab MCP 工具调用异常");
    expect(result[0].text).toContain("409 Merge Conflict");
  });

  it("should handle 500 internal server error", async () => {
    jest.spyOn((tool as any).apiClient, "apiRequest").mockRejectedValue(new Error("500 Internal Server Error"));

    const params = {
      projectId: "123",
      mergeRequestId: 456,
      mergeOptions: {
        squash: true,
        merge_when_pipeline_succeeds: false
      }
    };
    const result = await tool.execute(params);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].text).toContain("GitLab MCP 工具调用异常");
    expect(result[0].text).toContain("500 Internal Server Error");
  });
});