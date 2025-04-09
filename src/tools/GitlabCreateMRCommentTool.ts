import { MCPTool } from "mcp-framework";
import { z } from "zod";
import { GitlabApiClient } from "./gitlab/GitlabApiClient";
import { GitlabConfig } from "../config/GitlabConfig";

interface GitlabCreateMRCommentInput {
  projectId: string;
  mergeRequestId: number;
  comment: string;
}

import { GitlabBaseTool } from "./GitlabBaseTool";

export class GitlabCreateMRCommentTool extends GitlabBaseTool<GitlabCreateMRCommentInput> {
  name = "Gitlab Create MR Comment Tool";
  description = `
为指定项目的合并请求添加评论。
需提供项目 ID、合并请求 ID 和评论内容。
`.trim();

  schema = {
    projectId: {
      type: z.string(),
      description: "项目 ID"
    },
    mergeRequestId: {
      type: z.number(),
      description: "合并请求 ID"
    },
    comment: {
      type: z.string(),
      description: "评论内容"
    }
  };

  async execute(input: GitlabCreateMRCommentInput): Promise<any> {
    return this.safeExecute(async () => {
      return this.apiClient.apiRequest(
        `/projects/${encodeURIComponent(input.projectId)}/merge_requests/${input.mergeRequestId}/notes`,
        'POST',
        undefined,
        { body: input.comment }
      );
    });
  }
}