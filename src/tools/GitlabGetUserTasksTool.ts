import { z } from "zod";
import { createFieldsSchema } from "../utils/zodSchemas";
import { gitlabApiClient } from "../utils/gitlabApiClientInstance";
import { filterResponseFields } from "./gitlab/FieldFilterUtils";
import type { Tool, ContentResult, Context } from 'fastmcp';

export const GitlabGetUserTasksTool: Tool<Record<string, unknown> | undefined> = {
  name: "Gitlab Get User Tasks Tool",
  description: "获取当前用户的待办任务，支持多种过滤条件。",
  parameters: z.object({
    taskFilterType: z.enum([
      "ALL",
      "ASSIGNED_MRS",
      "REVIEW_MRS",
      "MY_ISSUES",
      "MY_PIPELINES",
      "MR_CREATED_TODAY",
      "ISSUES_CREATED_TODAY",
      "CUSTOM",
    ]).optional().describe("任务过滤类型"),
    fields: createFieldsSchema(),
  }),
  async execute(args: unknown, context: Context<Record<string, unknown> | undefined>) {
    const typedArgs = args as {
      taskFilterType?: string;
      fields?: string[];
    };
    
    try {
      const params: Record<string, any> = {};

      switch (typedArgs.taskFilterType) {
        case "ALL":
          break;
        case "ASSIGNED_MRS":
          params.include_assigned_mrs = true;
          break;
        case "REVIEW_MRS":
          params.include_review_mrs = true;
          break;
        case "MY_ISSUES":
          params.include_issues = true;
          break;
        case "MY_PIPELINES":
          params.include_pipelines = true;
          break;
        case "MR_CREATED_TODAY":
          params.type = "merge_request";
          params.created_after = new Date().toISOString().split("T")[0] + "T00:00:00Z";
          params.created_before = new Date().toISOString().split("T")[0] + "T23:59:59Z";
          break;
        case "ISSUES_CREATED_TODAY":
          params.type = "issue";
          params.created_after = new Date().toISOString().split("T")[0] + "T00:00:00Z";
          params.created_before = new Date().toISOString().split("T")[0] + "T23:59:59Z";
          break;
        case "CUSTOM":
          break;
        default:
          break;
      }

      const response = await gitlabApiClient.apiRequest("/merge_requests", "GET", params);
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