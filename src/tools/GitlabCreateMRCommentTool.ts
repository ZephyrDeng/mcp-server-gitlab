import { z } from "zod";
import { gitlabApiClient } from "../utils/gitlabApiClientInstance";
import { filterResponseFields } from "./gitlab/FieldFilterUtils";
import type { Tool, ContentResult, Context } from 'fastmcp';

export const GitlabCreateMRCommentTool: Tool<Record<string, unknown> | undefined> = {
  name: "Gitlab Create MR Comment Tool",
  description: "为指定项目的合并请求添加评论。",
  parameters: z.object({
    projectId: z.string().describe("项目 ID"),
    mergeRequestId: z.number().describe("合并请求 ID"),
    comment: z.string().describe("评论内容"),
    fields: z.array(z.string()).optional().describe("需要返回的字段路径数组"),
  }),
  async execute(args: unknown, context: Context<Record<string, unknown> | undefined>) {
    const typedArgs = args as {
      projectId: string;
      mergeRequestId: number;
      comment: string;
      fields?: string[];
    };
    
    const { projectId, mergeRequestId, comment, fields } = typedArgs;
    const endpoint = `/projects/${encodeURIComponent(projectId)}/merge_requests/${mergeRequestId}/notes`;
    
    try {
      const response = await gitlabApiClient.apiRequest(endpoint, "POST", undefined, { body: comment });
      
      if (fields) {
        const filteredResponse = filterResponseFields(response, fields);
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