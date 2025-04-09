import { z } from "zod";

interface GitlabSearchProjectDetailsInput {
  projectName: string;
  fields?: string[];
}

import { GitlabBaseTool } from "./GitlabBaseTool";

export class GitlabSearchProjectDetailsTool extends GitlabBaseTool<GitlabSearchProjectDetailsInput> {
  name = "Gitlab Search Project Details Tool";
  description = `
根据项目名称搜索项目及其详细信息。
支持字段过滤，提升响应效率。
`.trim();

  schema = {
    projectName: {
      type: z.string(),
      description: "项目名称"
    },
    fields: {
      type: z.array(z.string()).optional(),
      description: "字段过滤"
    }
  };

  async execute(input: GitlabSearchProjectDetailsInput): Promise<any> {
    return this.safeExecute(async () => {
      return this.apiClient.apiRequest('/projects', 'GET', { search: input.projectName });
    });
  }
}