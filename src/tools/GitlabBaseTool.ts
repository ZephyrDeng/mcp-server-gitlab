import { MCPTool } from "mcp-framework";
import { GitlabApiClient } from "./gitlab/GitlabApiClient";
import { GitlabConfig } from "../config/GitlabConfig";

export abstract class GitlabBaseTool<T extends Record<string, any>> extends MCPTool<T> {
  protected apiClient: GitlabApiClient;

  constructor(config: any = {
    baseUrl: process.env.GITLAB_API_URL || "",
    privateToken: process.env.GITLAB_TOKEN || "",
    timeout: 10000
  }) {
    super();
    const gitlabConfig = new GitlabConfig(config);
    this.apiClient = new GitlabApiClient(gitlabConfig);
  }
  getSchema() {
    return (this as any).schema;
  }
  /**
   * 统一封装异常，返回符合 content schema 的错误信息
   */
  protected async safeExecute<T>(fn: () => Promise<T>): Promise<T | { type: string; text: string }[]> {
    try {
      return await fn();
    } catch (error: any) {
      const message = error?.message || String(error);
      return [
        {
          type: "text",
          text: `GitLab MCP 工具调用异常：${message}`
        }
      ];
    }
  }
}