import { GitlabSearchProjectDetailsTool } from "../GitlabSearchProjectDetailsTool";

describe("GitlabSearchProjectDetailsTool", () => {
  const tool = new GitlabSearchProjectDetailsTool();

  it("should have correct metadata", () => {
    expect(tool.name).toBe("Gitlab Search Project Details Tool");
    expect(tool.description).toContain("搜索项目");
  });

  it("should return project list with example params", async () => {
    const mockProjects = [
      { id: 1, name: "mcp", description: "desc" },
      { id: 2, name: "mcp2", description: "desc2" }
    ];
    jest.spyOn((tool as any).apiClient, "apiRequest").mockResolvedValue(mockProjects);

    const params = {
      projectName: "mcp",
      fields: ["id", "name", "description"]
    };
    const result = await tool.execute(params);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("name");
  });

  it("should handle api error gracefully", async () => {
    jest.spyOn((tool as any).apiClient, "apiRequest").mockRejectedValue(new Error("API error"));
    const params = {
      projectName: "mcp",
      fields: ["id", "name", "description"]
    };
    const result = await tool.execute(params);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].text).toContain("GitLab MCP 工具调用异常");
    expect(result[0].text).toContain("API error");
  });

  it("should handle 404 not found error", async () => {
    jest.spyOn((tool as any).apiClient, "apiRequest").mockRejectedValue(new Error("404 Project Not Found"));
    const params = {
      projectName: "mcp",
      fields: ["id", "name", "description"]
    };
    const result = await tool.execute(params);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].text).toContain("GitLab MCP 工具调用异常");
    expect(result[0].text).toContain("404 Project Not Found");
  });

  it("should handle 403 forbidden error", async () => {
    jest.spyOn((tool as any).apiClient, "apiRequest").mockRejectedValue(new Error("403 Forbidden"));
    const params = {
      projectName: "mcp",
      fields: ["id", "name", "description"]
    };
    const result = await tool.execute(params);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].text).toContain("GitLab MCP 工具调用异常");
    expect(result[0].text).toContain("403 Forbidden");
  });

  it("should handle 500 internal server error", async () => {
    jest.spyOn((tool as any).apiClient, "apiRequest").mockRejectedValue(new Error("500 Internal Server Error"));
    const params = {
      projectName: "mcp",
      fields: ["id", "name", "description"]
    };
    const result = await tool.execute(params);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].text).toContain("GitLab MCP 工具调用异常");
    expect(result[0].text).toContain("500 Internal Server Error");
  });
});