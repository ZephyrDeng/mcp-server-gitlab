import { z } from "zod";
import { gitlabApiClient } from "../utils/gitlabApiClientInstance";
import { filterResponseFields } from "./gitlab/FieldFilterUtils";
import type { Tool, ContentResult, TextContent, Context } from 'fastmcp';

export const GitlabAcceptMRTool: Tool<Record<string, unknown> | undefined> = {
  name: "Gitlab Accept MR Tool",
  description: "接受并合并指定项目的合并请求，支持自定义合并选项。",
  parameters: z.object({
    projectId: z.union([z.string(), z.number()]).describe("项目 ID 或名称"),
    mergeRequestId: z.number().describe("合并请求 ID"),
    mergeOptions: z.object({
      mergeCommitMessage: z.string().optional(),
      squash: z.boolean().optional(),
      shouldRemoveSourceBranch: z.boolean().optional(),
    }).optional().describe("合并选项"),
    fields: z.array(z.string()).optional().describe("需要返回的字段路径数组"),
  }),
  async execute(args: unknown, context: Context<Record<string, unknown> | undefined>) {
    const typedArgs = args as {
      projectId: string | number;
      mergeRequestId: number;
      mergeOptions?: {
        mergeCommitMessage?: string;
        squash?: boolean;
        shouldRemoveSourceBranch?: boolean;
      };
      fields?: string[];
    };
    
    const { projectId: projectIdOrName, mergeRequestId, mergeOptions, fields } = typedArgs;

    try {
      const resolvedProjectId = await gitlabApiClient.resolveProjectId(projectIdOrName);
      if (!resolvedProjectId) {
        throw new Error(`无法解析项目 ID 或名称：${projectIdOrName}`);
      }

      const endpoint = `/projects/${encodeURIComponent(String(resolvedProjectId))}/merge_requests/${mergeRequestId}/merge`;
      const response = await gitlabApiClient.apiRequest(endpoint, "PUT", undefined, mergeOptions);

      if (!gitlabApiClient.isValidResponse(response)) {
        throw new Error(`GitLab API 错误：${response?.message || '未知错误'}`);
      }

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