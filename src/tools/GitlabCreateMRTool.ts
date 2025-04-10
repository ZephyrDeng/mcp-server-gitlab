import { z } from "zod";
import { gitlabApiClient } from "../utils/gitlabApiClientInstance";
import { filterResponseFields } from "./gitlab/FieldFilterUtils";
import type { Tool, ContentResult, Context } from "fastmcp";

export const GitlabCreateMRTool: Tool<Record<string, unknown> | undefined> = {
  name: "Gitlab Create MR Tool",
  description: "创建新的 Merge Request，支持指派 assignee 和 reviewers。",
  parameters: z.object({
    projectId: z.string().describe("项目 ID"),
    sourceBranch: z.string().describe("源分支"),
    targetBranch: z.string().describe("目标分支"),
    title: z.string().describe("标题"),
    description: z.string().optional().describe("描述"),
    assigneeId: z.number().optional().describe("指派的用户 ID"),
    reviewerIds: z.array(z.number()).optional().describe("Reviewer 用户 ID 列表"),
    labels: z.array(z.string()).optional().describe("标签数组"),
    fields: z.array(z.string()).optional().describe("需要返回的字段路径数组"),
  }),
  async execute(args: unknown, context: Context<Record<string, unknown> | undefined>) {
    const typedArgs = args as {
      projectId: string;
      sourceBranch: string;
      targetBranch: string;
      title: string;
      description?: string;
      assigneeId?: number;
      reviewerIds?: number[];
      labels?: string[];
      fields?: string[];
    };

    const { projectId, sourceBranch, targetBranch, title, description, assigneeId, reviewerIds, labels, fields } = typedArgs;

    const endpoint = `/projects/${encodeURIComponent(projectId)}/merge_requests`;

    const createData: Record<string, any> = {
      source_branch: sourceBranch,
      target_branch: targetBranch,
      title,
    };
    if (description !== undefined) createData.description = description;
    if (assigneeId !== undefined) createData.assignee_id = assigneeId;
    if (reviewerIds !== undefined) createData.reviewer_ids = reviewerIds;
    if (labels !== undefined) createData.labels = labels.join(",");

    try {
      const response = await gitlabApiClient.apiRequest(endpoint, "POST", undefined, createData);

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