import { describe, it, expect, jest } from '@jest/globals';
import dotenv from "dotenv";
import { GitlabRawApiTool } from "../GitlabRawApiTool";
import type { Context, ContentResult, TextContent } from 'fastmcp';

dotenv.config();
describe("GitlabRawApiTool", () => {
  const tool = GitlabRawApiTool;
  const mockContext = {} as Context<Record<string, unknown> | undefined>;

  it("should fetch projects list", async () => {
    const input = {
      endpoint: "/projects",
      method: "GET" as const,
      params: { membership: true, per_page: 5 }
    };

    const result = await tool.execute(input, mockContext) as ContentResult;
    expect(result).toHaveProperty('content');
    
    if (result.isError) {
      // 如果返回错误
      expect((result.content[0] as TextContent).text).toContain("GitLab MCP 工具调用异常");
    } else {
      // 如果成功返回项目列表
      const responseText = (result.content[0] as TextContent).text;
      const parsedResponse = JSON.parse(responseText);
      expect(Array.isArray(parsedResponse)).toBe(true);
      
      if (parsedResponse.length > 0) {
        expect(parsedResponse[0]).toHaveProperty("id");
        expect(parsedResponse[0]).toHaveProperty("name");
      }
    }
  });
});