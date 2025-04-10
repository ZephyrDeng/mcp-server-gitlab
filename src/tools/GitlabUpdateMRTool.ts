import { z } from "zod";
import { gitlabApiClient } from "../utils/gitlabApiClientInstance";
import { filterResponseFields } from "./gitlab/FieldFilterUtils";
import type { Tool, ContentResult, Context } from "fastmcp";

export const GitlabUpdateMRTool: Tool<Record<string, unknown> | undefined> = {
  name: "Gitlab Update MR Tool",
  description: "更新指定项目的 Merge Request，包括指派 assignee 和 reviewers。",
  parameters: z.object({
    projectId: z.string().describe("项目 ID"),
    mergeRequestId: z.number().describe("Merge Request ID"),
    assigneeId: z.number().optional().describe("指派的用户 ID"),
    reviewerIds: z.array(z.number()).optional().describe("Reviewer 用户 ID 列表"),
    title: z.string().optional().describe("新的标题"),
    description: z.string().optional().describe("新的描述"),
    labels: z.array(z.string()).optional().describe("标签数组"),
    fields: z.array(z.string()).optional().describe("需要返回的字段路径数组"),
  }),
  async execute(args: unknown, context: Context<Record<string, unknown> | undefined>) {
    const typedArgs = args as {
      projectId: string;
      mergeRequestId: number;
      assigneeId?: number;
      reviewerIds?: number[];
      title?: string;
      description?: string;
      labels?: string[];
      fields?: string[];
    };

    const { projectId, mergeRequestId, assigneeId, reviewerIds, title, description, labels, fields } = typedArgs;

    const endpoint = `/projects/${encodeURIComponent(projectId)}/merge_requests/${mergeRequestId}`;

    const updateData: Record<string, any> = {};
    if (assigneeId !== undefined) updateData.assignee_id = assigneeId;
    if (reviewerIds !== undefined) updateData.reviewer_ids = reviewerIds;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (labels !== undefined) updateData.labels = labels.join(",");

    try {
      const response = await gitlabApiClient.apiRequest(endpoint, "PUT", undefined, updateData);

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