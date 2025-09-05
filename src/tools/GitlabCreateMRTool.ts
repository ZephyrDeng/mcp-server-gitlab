import { z } from "zod";
import { gitlabApiClient } from "../utils/gitlabApiClientInstance";
import { filterResponseFields } from "./gitlab/FieldFilterUtils";
import type { Tool, ContentResult, Context } from "fastmcp";

export const GitlabCreateMRTool: Tool<Record<string, unknown> | undefined> = {
  name: "Gitlab Create MR Tool",
  description: "创建新的 Merge Request，支持指派 assignee 和 reviewers。",
  parameters: z.object({
    projectId: z.union([z.string(), z.number()]).describe("项目 ID 或名称"),
    sourceBranch: z.string().describe("源分支"),
    targetBranch: z.string().describe("目标分支"),
    title: z.string().describe("标题"),
    description: z.string().optional().describe("描述"),
    assigneeId: z.union([z.string(), z.number()]).optional().describe("指派的用户 ID 或用户名"),
    reviewerIds: z.array(z.union([z.string(), z.number()])).optional().describe("Reviewer 用户 ID 或用户名列表"),
    labels: z.array(z.string()).optional().describe("标签数组"),
    fields: z.array(z.string()).optional().describe("需要返回的字段路径数组"),
  }),
  async execute(args: unknown, context: Context<Record<string, unknown> | undefined>) {
    const typedArgs = args as {
      projectId: string | number;
      sourceBranch: string;
      targetBranch: string;
      title: string;
      description?: string;
      assigneeId?: string | number;
      reviewerIds?: (string | number)[];
      labels?: string[];
      fields?: string[];
    };

    const { projectId: projectIdOrName, sourceBranch, targetBranch, title, description, assigneeId: assigneeIdOrName, reviewerIds: reviewerIdsOrNames, labels, fields } = typedArgs;

    try {
      // 解析项目 ID
      const resolvedProjectId = await gitlabApiClient.resolveProjectId(projectIdOrName);
      if (!resolvedProjectId) {
        throw new Error(`无法解析项目 ID 或名称：${projectIdOrName}`);
      }
      const endpoint = `/projects/${encodeURIComponent(String(resolvedProjectId))}/merge_requests`;

      let resolvedAssigneeId: number | undefined = undefined;
      if (assigneeIdOrName !== undefined) {
        const resolved = await gitlabApiClient.resolveUserId(assigneeIdOrName);
        if (resolved) {
          resolvedAssigneeId = resolved;
        } else {
          // 选择性失败：可以记录警告并继续，或者抛出错误
           console.warn(`无法解析指派人 ID 或用户名：${assigneeIdOrName}，将忽略此参数`);
          // throw new Error(`无法解析指派人 ID 或用户名：${assigneeIdOrName}`);
        }
      }

      let resolvedReviewerIds: number[] = [];
      if (reviewerIdsOrNames && reviewerIdsOrNames.length > 0) {
        const reviewerPromises = reviewerIdsOrNames.map(idOrName => gitlabApiClient.resolveUserId(idOrName));
        const results = await Promise.all(reviewerPromises);
        resolvedReviewerIds = results.filter((id): id is number => {
          if (id === null) {
            // 找到原始输入用于警告
            const originalInput = reviewerIdsOrNames[results.indexOf(id)];
            console.warn(`无法解析审阅人 ID 或用户名：${originalInput}，将忽略此审阅人`);
          }
          return id !== null;
        });
      }


      const createData: Record<string, any> = {
        source_branch: sourceBranch,
        target_branch: targetBranch,
        title,
      };
      if (description !== undefined) createData.description = description;
      if (resolvedAssigneeId !== undefined) createData.assignee_id = resolvedAssigneeId;
      if (resolvedReviewerIds.length > 0) createData.reviewer_ids = resolvedReviewerIds;
      if (labels !== undefined) createData.labels = labels.join(",");


      const response = await gitlabApiClient.apiRequest(endpoint, "POST", undefined, createData);

      if (!gitlabApiClient.isValidResponse(response)) {
        throw new Error(`GitLab API error: ${response?.message || 'Unknown error'}`);
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