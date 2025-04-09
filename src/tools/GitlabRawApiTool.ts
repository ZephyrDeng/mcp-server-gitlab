import { z } from "zod";
import { MCPTool } from "mcp-framework";
import { GitlabApiClient } from "./gitlab/GitlabApiClient";
import { GitlabConfig } from "../config/GitlabConfig";

export class GitlabRawApiTool extends MCPTool<any> {
  name = "Gitlab Raw API Tool";
  description = `
专为高级用户设计，支持自定义调用任意 GitLab REST API。
传入 endpoint、method、params、data，实现灵活扩展。
适合快速试验、调试、调用未封装的 GitLab API。
`.trim();

  private apiClient: GitlabApiClient;

  constructor(config: any = {
    baseUrl: process.env.GITLAB_API_URL || "",
    privateToken: process.env.GITLAB_TOKEN || "",
    timeout: 10000
  }) {
    super();
    const gitlabConfig = new GitlabConfig(config);
    this.apiClient = new GitlabApiClient(gitlabConfig);
  }

  schema = {
    endpoint: {
      type: z.string(),
      description: "GitLab API 路径，如 /projects"
    },
    method: {
      type: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
      description: "HTTP 方法"
    },
    params: {
      type: z.record(z.any()).optional(),
      description: "查询参数"
    },
    data: {
      type: z.record(z.any()).optional(),
      description: "请求体"
    }
  };

  async execute(input: any): Promise<any> {
    const { endpoint, method, params, data } = input;
    return await this.apiClient.apiRequest(endpoint, method, params, data);
  }
}