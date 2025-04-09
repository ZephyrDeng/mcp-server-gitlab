import { z } from "zod";
import { GitlabBaseTool } from "./GitlabBaseTool";

interface GitlabGetUserTasksInput {
  taskFilterType?:
    "ALL" |
    "ASSIGNED_MRS" |
    "REVIEW_MRS" |
    "MY_ISSUES" |
    "MY_PIPELINES" |
    "MR_CREATED_TODAY" |
    "ISSUES_CREATED_TODAY" |
    "CUSTOM";
  fields?: string[] | string;
}


export class GitlabGetUserTasksTool extends GitlabBaseTool<GitlabGetUserTasksInput> {
  name = "Gitlab Get User Tasks Tool";
  description = `
获取当前用户的待办任务。
支持过滤合并请求、代码评审、流水线、问题。
可选字段过滤，提升响应效率。
`.trim();

  schema = {
    taskFilterType: {
      type: z.enum([
        "ALL",
        "ASSIGNED_MRS",
        "REVIEW_MRS",
        "MY_ISSUES",
        "MY_PIPELINES",
        "MR_CREATED_TODAY",
        "ISSUES_CREATED_TODAY",
        "CUSTOM"
      ]).optional(),
      description: `
任务过滤类型。

用于指定要查询的任务类别和过滤条件。支持以下枚举值：
- "ALL"：查询所有任务
- "ASSIGNED_MRS"：查询分配给当前用户的合并请求
- "REVIEW_MRS"：查询当前用户需要评审的合并请求
- "MY_ISSUES"：查询分配给当前用户的问题
- "MY_PIPELINES"：查询与当前用户相关的流水线
- "MR_CREATED_TODAY"：查询今天创建的合并请求
- "ISSUES_CREATED_TODAY"：查询今天创建的问题
- "CUSTOM"：自定义过滤（当前版本暂不支持额外参数）
`.trim()
    },
    fields: {
      type: z.array(z.string()).optional(),
      description: "字段过滤"
    }
  };

  async execute(input: GitlabGetUserTasksInput): Promise<any> {
    return this.safeExecute(async () => {
      const params: Record<string, any> = {};

      switch(input.taskFilterType) {
        case "ALL":
          // 不加任何过滤参数
          break;
        case "ASSIGNED_MRS":
          params['include_assigned_mrs'] = true;
          break;
        case "REVIEW_MRS":
          params['include_review_mrs'] = true;
          break;
        case "MY_ISSUES":
          params['include_issues'] = true;
          break;
        case "MY_PIPELINES":
          params['include_pipelines'] = true;
          break;
        case "MR_CREATED_TODAY":
          params['type'] = 'merge_request';
          params['created_after'] = new Date().toISOString().split('T')[0] + 'T00:00:00Z';
          params['created_before'] = new Date().toISOString().split('T')[0] + 'T23:59:59Z';
          break;
        case "ISSUES_CREATED_TODAY":
          params['type'] = 'issue';
          params['created_after'] = new Date().toISOString().split('T')[0] + 'T00:00:00Z';
          params['created_before'] = new Date().toISOString().split('T')[0] + 'T23:59:59Z';
          break;
        case "CUSTOM":
          // 未来支持自定义参数
          break;
        default:
          break;
      }

      if (input.fields && !(typeof input.fields === 'string' && input.fields.trim() === '')) {
        if (Array.isArray(input.fields)) {
          params['fields'] = input.fields.join(',');
        } else {
          params['fields'] = input.fields;
        }
      }

      return this.apiClient.apiRequest('/merge_requests', 'GET', params);
    });
  }
}