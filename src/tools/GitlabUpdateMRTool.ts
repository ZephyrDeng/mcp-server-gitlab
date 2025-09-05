import { z } from "zod";
import { gitlabApiClient } from "../utils/gitlabApiClientInstance";
import { filterResponseFields } from "./gitlab/FieldFilterUtils";
import type { Tool, ContentResult, Context } from "fastmcp";

export const GitlabUpdateMRTool: Tool<Record<string, unknown> | undefined> = {
  name: "Gitlab Update MR Tool",
  description: "更新指定项目的 Merge Request，包括指派 assignee 和 reviewers。",
  parameters: z.object({
    projectId: z.union([z.string(), z.number()]).describe("项目 ID 或名称"),
    mergeRequestId: z.number().describe("Merge Request ID"),
    assigneeId: z.union([z.string(), z.number()]).optional().describe("指派的用户 ID 或用户名"),
    reviewerIds: z.array(z.union([z.string(), z.number()])).optional().describe("Reviewer 用户 ID 或用户名列表"),
    title: z.string().optional().describe("新的标题"),
    description: z.string().optional().describe("新的描述"),
    labels: z.array(z.string()).optional().describe("标签数组"),
    fields: z.array(z.string()).optional().describe("需要返回的字段路径数组"),
  }),
  async execute(args: unknown, context: Context<Record<string, unknown> | undefined>) {
    const typedArgs = args as {
      projectId: string | number;
      mergeRequestId: number;
      assigneeId?: string | number;
      reviewerIds?: (string | number)[];
      title?: string;
      description?: string;
      labels?: string[];
      fields?: string[];
    };

    const { projectId: projectIdOrName, mergeRequestId, assigneeId: assigneeIdOrName, reviewerIds: reviewerIdsOrNames, title, description, labels, fields } = typedArgs;

    try {
      const resolvedProjectId = await gitlabApiClient.resolveProjectId(projectIdOrName);
      if (!resolvedProjectId) {
        throw new Error(`无法解析项目 ID 或名称：${projectIdOrName}`);
      }
      const endpoint = `/projects/${encodeURIComponent(String(resolvedProjectId))}/merge_requests/${mergeRequestId}`;

      let resolvedAssigneeId: number | undefined | null = undefined;
      if (assigneeIdOrName !== undefined) {
        if (assigneeIdOrName === 0 || assigneeIdOrName === "") {
            resolvedAssigneeId = null;
        } else {
            const resolved = await gitlabApiClient.resolveUserId(assigneeIdOrName);
            if (resolved) {
                resolvedAssigneeId = resolved;
            } else {
                console.warn(`无法解析指派人 ID 或用户名：${assigneeIdOrName}，将忽略此参数`);
                resolvedAssigneeId = undefined;
            }
        }
      }


      let resolvedReviewerIds: number[] | undefined = undefined;
      if (reviewerIdsOrNames !== undefined) {
          if (reviewerIdsOrNames.length === 0) {
              resolvedReviewerIds = [];
          } else {
              const reviewerPromises = reviewerIdsOrNames.map(idOrName => gitlabApiClient.resolveUserId(idOrName));
              const results = await Promise.all(reviewerPromises);
              resolvedReviewerIds = results.filter((id): id is number => {
                  if (id === null) {
                      const originalInput = reviewerIdsOrNames[results.indexOf(id)];
                      console.warn(`无法解析审阅人 ID 或用户名：${originalInput}，将忽略此审阅人`);
                  }
                  return id !== null;
              });
              if (resolvedReviewerIds.length === 0 && reviewerIdsOrNames.length > 0) {
                  console.warn(`所有提供的审阅人均无法解析，将不更新审阅人列表。`);
                  resolvedReviewerIds = undefined;
              }
          }
      }


      const updateData: Record<string, any> = {};
      if (resolvedAssigneeId !== undefined) updateData.assignee_id = resolvedAssigneeId;
      if (resolvedReviewerIds !== undefined) updateData.reviewer_ids = resolvedReviewerIds;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (labels !== undefined) updateData.labels = labels.join(",");

      if (Object.keys(updateData).length === 0) {
         return {
           content: [{ type: "text", text: "没有提供需要更新的字段。" }]
         } as ContentResult;
      }


      const response = await gitlabApiClient.apiRequest(endpoint, "PUT", undefined, updateData);

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