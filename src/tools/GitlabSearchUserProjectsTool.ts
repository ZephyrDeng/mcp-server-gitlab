import { z } from "zod";
import { gitlabApiClient } from "../utils/gitlabApiClientInstance";
import { createFieldsSchema } from '../utils/zodSchemas'
import type { Tool, ContentResult, Context } from 'fastmcp';
import { filterResponseFields } from '../tools/gitlab/FieldFilterUtils'

export const GitlabSearchUserProjectsTool: Tool<Record<string, unknown> | undefined> = {
  name: "Gitlab Search User Projects Tool",
  description: "根据用户名搜索用户信息及其活跃项目。支持字段过滤，提升响应效率。",
  parameters: z.object({
    username: z.string().describe("用户名"),
    fields: createFieldsSchema(),
  }),
  async execute(args: unknown, context: Context<Record<string, unknown> | undefined>) {
    const typedArgs = args as {
      username: string;
      fields?: string[] | string;
    };

    try {
      const users = await gitlabApiClient.apiRequest("/users", "GET", { search: typedArgs.username });
      if (!Array.isArray(users) || users.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `未找到用户名为 ${typedArgs.username} 的用户`
            }
          ],
          isError: true
        };
      }
      
      const user = users[0];
      const projects = await gitlabApiClient.apiRequest(`/users/${user.id}/projects`, "GET", {});
      const result = { user, projects };

      if (typedArgs.fields) {
        const fieldsArray = Array.isArray(typedArgs.fields)
          ? typedArgs.fields
          : typedArgs.fields.split(",").map(f => f.trim()).filter(f => f);
        const filteredResult = filterResponseFields(result, fieldsArray);
        return {
          content: [{ type: "text", text: JSON.stringify(filteredResult) }]
        } as ContentResult;
      } else {
        return {
          content: [{ type: "text", text: JSON.stringify(result) }]
        } as ContentResult;
      }
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
  },
};