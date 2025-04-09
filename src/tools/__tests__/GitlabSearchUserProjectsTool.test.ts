import { GitlabSearchUserProjectsTool } from "../GitlabSearchUserProjectsTool";

describe("GitlabSearchUserProjectsTool", () => {
  const tool = new GitlabSearchUserProjectsTool();

  it("should have correct metadata", () => {
    expect(tool.name).toBeDefined();
    expect(tool.description).toBeDefined();
  });

  it("should execute with mock params", async () => {
    const params = {
      username: "testuser",
      fields: ["id", "name"]
    };
    const result = await tool.execute(params);
    expect(result).toBeDefined();
  });
  it("should execute with example params", async () => {
    const params = {
      username: "dengzefeng",
      fields: ["id", "name", "path_with_namespace", "last_activity_at", "visibility"]
    };
    const result = await tool.execute(params);
    expect(result).toBeDefined();
  });
  it("should handle user not found error", async () => {
    jest.spyOn(tool, "execute").mockRejectedValue(new Error("404 User Not Found"));
    const params = {
      username: "nonexistentuser",
      fields: ["id", "name"]
    };
    await expect(tool.execute(params)).rejects.toThrow("404 User Not Found");
  });

  it("should handle 403 forbidden error", async () => {
    jest.spyOn(tool, "execute").mockRejectedValue(new Error("403 Forbidden"));
    const params = {
      username: "testuser",
      fields: ["id", "name"]
    };
    await expect(tool.execute(params)).rejects.toThrow("403 Forbidden");
  });

  it("should handle 500 internal server error", async () => {
    jest.spyOn(tool, "execute").mockRejectedValue(new Error("500 Internal Server Error"));
    const params = {
      username: "testuser",
      fields: ["id", "name"]
    };
    await expect(tool.execute(params)).rejects.toThrow("500 Internal Server Error");
  });
});