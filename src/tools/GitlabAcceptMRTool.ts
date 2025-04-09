import { z } from "zod";

interface GitlabAcceptMRInput {
  projectId: string;
  mergeRequestId: number;
  mergeOptions?: {
    mergeCommitMessage?: string;
    squash?: boolean;
    shouldRemoveSourceBranch?: boolean;
  };
}

import { GitlabBaseTool } from "./GitlabBaseTool";

export class GitlabAcceptMRTool extends GitlabBaseTool<GitlabAcceptMRInput> {
  name = "Gitlab Accept MR Tool";
  description = `
接受并合并指定项目的合并请求。
支持自定义合并选项，如提交信息、是否压缩、是否删除源分支。
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
    mergeOptions: {
      type: z.object({
        mergeCommitMessage: z.string().optional(),
        squash: z.boolean().optional(),
        shouldRemoveSourceBranch: z.boolean().optional()
      }).optional(),
      description: "合并选项"
    }
  };

  async execute(input: GitlabAcceptMRInput): Promise<any> {
    return this.safeExecute(async () => {
      return this.apiClient.apiRequest(
        `/projects/${encodeURIComponent(input.projectId)}/merge_requests/${input.mergeRequestId}/merge`,
        'PUT',
        undefined,
        input.mergeOptions
      );
    });
  }
}