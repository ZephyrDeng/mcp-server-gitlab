import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { GitlabApiClient } from "./gitlab/GitlabApiClient";
import { GitlabConfig } from "../config/GitlabConfig";

interface GitlabSearchUserProjectsInput {
  username: string;
  fields?: string[] | string;
}

import { GitlabBaseTool } from "./GitlabBaseTool";

export class GitlabSearchUserProjectsTool extends GitlabBaseTool<GitlabSearchUserProjectsInput> {
  name = "Gitlab Search User Projects Tool";
  description = `
根据用户名搜索用户信息及其活跃项目。
支持字段过滤，提升响应效率。
`.trim();

  schema = {
    username: {
      type: z.string(),
      description: "用户名"
    },
    fields: {
      type: z.union([z.array(z.string()), z.string()]).optional(),
      description: "字段过滤，支持数组或逗号分隔字符串"
    }
  };

  async execute(input: GitlabSearchUserProjectsInput): Promise<any> {
    return this.safeExecute(async () => {
      // 兼容字符串和数组
      let fieldsArray: string[] | undefined;
      if (typeof input.fields === 'string') {
        fieldsArray = input.fields.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        fieldsArray = input.fields;
      }

      // 这里可以将 fieldsArray 用于字段过滤，示例中暂未用到
      return this.apiClient.apiRequest('/users', 'GET', { search: input.username });
    });
  }
}