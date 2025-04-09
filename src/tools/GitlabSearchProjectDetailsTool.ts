import { z } from "zod";
import { createFieldsSchema } from "../utils/zodSchemas";
import { gitlabApiClient } from "../utils/gitlabApiClientInstance";
import type { Tool, ContentResult, Context } from 'fastmcp';
import { filterResponseFields } from './gitlab/FieldFilterUtils';

export const GitlabSearchProjectDetailsTool: Tool<Record<string, unknown> | undefined> = {
  name: "Gitlab Search Project Details Tool",
  description: "根据项目名称搜索项目及其详细信息，支持字段过滤，提升响应效率。",
  parameters: z.object({
    projectName: z.string().describe("项目名称"),
    fields: createFieldsSchema(),
  }),
  async execute(args: unknown, context: Context<Record<string, unknown> | undefined>) {
    const typedArgs = args as {
      projectName: string;
      fields?: string[];
    };
    
    try {
      const response = await gitlabApiClient.apiRequest('/projects', 'GET', { search: typedArgs.projectName });
      let result = response;
      
      if (typedArgs.fields) {
        result = filterResponseFields(response, typedArgs.fields);
      }
      
      if (!Array.isArray(result)) {
        result = [result];
      }
      
      return {
        content: [{ type: "text", text: JSON.stringify(result) }]
      } as ContentResult;
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `GitLab MCP 工具调用异常：${error?.message || String(error)}`
          }
        ],
        isError: true
      };
    }
  }
};