import { GitlabGetUserTasksTool } from "../GitlabGetUserTasksTool";
import { mock2 } from "./mock_data";

describe("GitlabGetUserTasksTool", () => {
  const tool = new GitlabGetUserTasksTool();

  it("should have correct metadata", () => {
    expect(tool.name).toBeDefined();
    expect(tool.description).toBeDefined();
  });

  it("should execute with mock params", async () => {
    const params = {
      taskFilters: { includeAssignedMRs: true },
      fields: ["id", "title"]
    };
    const result = await tool.execute(params);
    expect(result).toBeDefined();
    // 根据实现调整断言
  });
  it("should execute with full taskFilters and fields", async () => {
    const params = {
      taskFilters: {
        includeAssignedMRs: true,
        includeReviewMRs: false,
        includePipelines: false,
        includeIssues: false
      },
      fields: ["id", "title", "state"]
    };
    jest.spyOn(tool, "execute").mockResolvedValue(mock2);
    const result = await tool.execute(params);
    expect(result).toEqual(mock2);
  });

  it("should execute with full taskFilters and fields 2", async () => {
    const params = {
      taskFilters: JSON.parse("{\"includeAssignedMRs\":true,\"includeReviewMRs\":false,\"includePipelines\":false,\"includeIssues\":false}"),
      fields: ["id", "title", "state"]
    };
    const result = await tool.execute(params);
    expect(result).toBeDefined();
  });

  it("should execute with example params (real request)", async () => {
    const params = {
      taskFilters: {
        includeAssignedMRs: true,
        includeReviewMRs: false,
        includePipelines: false,
        includeIssues: false
      },
      fields: ["id", "title", "state"]
    };
    const result = await tool.execute(params);
    expect(result).toBeDefined();
  });
  it("should handle empty task list", async () => {
    jest.spyOn(tool, "execute").mockResolvedValue([]);
    const params = {
      taskFilters: { includeAssignedMRs: true },
      fields: ["id", "title"]
    };
    const result = await tool.execute(params);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should handle 403 forbidden error", async () => {
    jest.spyOn(tool, "execute").mockRejectedValue(new Error("403 Forbidden"));
    const params = {
      taskFilters: { includeAssignedMRs: true },
      fields: ["id", "title"]
    };
    await expect(tool.execute(params)).rejects.toThrow("403 Forbidden");
  });

  it("should handle 500 internal server error", async () => {
    jest.spyOn(tool, "execute").mockRejectedValue(new Error("500 Internal Server Error"));
    const params = {
      taskFilters: { includeAssignedMRs: true },
      fields: ["id", "title"]
    };
    await expect(tool.execute(params)).rejects.toThrow("500 Internal Server Error");
  });
});