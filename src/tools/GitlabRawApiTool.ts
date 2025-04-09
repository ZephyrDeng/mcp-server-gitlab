import { z } from "zod";
import { createFieldsSchema } from "../utils/zodSchemas";
import { gitlabApiClient } from "../utils/gitlabApiClientInstance";
import { filterResponseFields } from "./gitlab/FieldFilterUtils";
import type { Tool, ContentResult, Context } from 'fastmcp';

export const GitlabRawApiTool: Tool<Record<string, unknown> | undefined> = {
  name: "Gitlab Raw API Tool",
  description: "支持自定义调用任意 GitLab REST API，适合调试和高级用法。",
  parameters: z.object({
    endpoint: z.string().describe("GitLab API 路径，如 /projects"),
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).describe("HTTP 方法"),
    params: z.record(z.any()).optional().describe("查询参数"),
    data: z.record(z.any()).optional().describe("请求体"),
    fields: createFieldsSchema(),
  }),
  async execute(args: unknown, context: Context<Record<string, unknown> | undefined>) {
    const typedArgs = args as {
      endpoint: string;
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      params?: Record<string, any>;
      data?: Record<string, any>;
      fields?: string[];
    };
    
    try {
      const response = await gitlabApiClient.apiRequest(
        typedArgs.endpoint, 
        typedArgs.method, 
        typedArgs.params, 
        typedArgs.data
      );
      
      if (typedArgs.fields) {
        const filteredResponse = filterResponseFields(response, typedArgs.fields);
        return {
          content: [{ type: "text", text: JSON.stringify(filteredResponse) }]
        } as ContentResult;
      }
      
      return {
        content: [{ type: "text", text: JSON.stringify(response) }]
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