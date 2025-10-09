import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FastMCP, Tool } from "fastmcp";


import { gitlabApiClient } from "./utils/gitlabApiClientInstance";
import { GitlabAcceptMRTool } from "./tools/GitlabAcceptMRTool";
import { GitlabCreateMRCommentTool } from "./tools/GitlabCreateMRCommentTool";
import { GitlabCreateMRTool } from "./tools/GitlabCreateMRTool";
import { GitlabGetUserTasksTool } from "./tools/GitlabGetUserTasksTool";
import { GitlabRawApiTool } from "./tools/GitlabRawApiTool";
import { GitlabSearchProjectDetailsTool } from "./tools/GitlabSearchProjectDetailsTool";
import { GitlabSearchUserProjectsTool } from "./tools/GitlabSearchUserProjectsTool";
import { GitlabUpdateMRTool } from "./tools/GitlabUpdateMRTool";

/**
 * Union type representing all available GitLab tool names.
 *
 * @public
 */
export type GitLabToolName =
  | "Gitlab_Search_User_Projects_Tool"
  | "Gitlab_Get_User_Tasks_Tool"
  | "Gitlab_Search_Project_Details_Tool"
  | "Gitlab_Create_MR_Tool"
  | "Gitlab_Update_MR_Tool"
  | "Gitlab_Accept_MR_Tool"
  | "Gitlab_Create_MR_Comment_Tool"
  | "Gitlab_Raw_API_Tool";

/**
 * Configuration options for filtering which tools should be registered.
 *
 * @public
 */
export interface GitLabToolFilterOptions {
  /** List of tools that are allowed to be registered. If provided, only these tools will be registered. */
  allowList?: GitLabToolName[];
  /** List of tools that should not be registered. These tools will be excluded from registration. */
  blockList?: GitLabToolName[];
}

/**
 * Configuration options for the GitLab tools registry.
 *
 * @public
 */
export interface GitLabToolsRegistryOptions {
  /** Filter options to control which tools are registered. */
  toolFilter?: GitLabToolFilterOptions;
  /** Enable/disable logger. Defaults to process.env.ENABLE_LOGGER */
  enableLogger?: boolean;
}

/**
 * Mapping of fastmcp tools to their standardized names.
 */
const toolNameMapping = {
  [GitlabSearchUserProjectsTool.name]: "Gitlab_Search_User_Projects_Tool",
  [GitlabGetUserTasksTool.name]: "Gitlab_Get_User_Tasks_Tool",
  [GitlabSearchProjectDetailsTool.name]: "Gitlab_Search_Project_Details_Tool",
  [GitlabCreateMRTool.name]: "Gitlab_Create_MR_Tool",
  [GitlabUpdateMRTool.name]: "Gitlab_Update_MR_Tool",
  [GitlabAcceptMRTool.name]: "Gitlab_Accept_MR_Tool",
  [GitlabCreateMRCommentTool.name]: "Gitlab_Create_MR_Comment_Tool",
  [GitlabRawApiTool.name]: "Gitlab_Raw_API_Tool",
} as const;

/**
 * Available fastmcp tools.
 */
const fastmcpTools = [
  GitlabAcceptMRTool,
  GitlabCreateMRCommentTool,
  GitlabCreateMRTool,
  GitlabGetUserTasksTool,
  GitlabRawApiTool,
  GitlabSearchProjectDetailsTool,
  GitlabSearchUserProjectsTool,
  GitlabUpdateMRTool,
];

/**
 * Determines whether a tool should be registered based on the provided filter options.
 *
 * @param toolName - The name of the tool to check
 * @param filter - Filter options containing allowList and/or blockList
 * @returns `true` if the tool should be registered, `false` otherwise
 *
 * @internal
 */
function shouldRegisterTool(toolName: GitLabToolName, filter?: GitLabToolFilterOptions): boolean {
  if (!filter) {
    return true;
  }

  if (filter.allowList && filter.allowList.length > 0) {
    return filter.allowList.includes(toolName);
  }

  if (filter.blockList && filter.blockList.length > 0) {
    return !filter.blockList.includes(toolName);
  }

  return true;
}

/**
 * Registers GitLab tools with a fastmcp server instance.
 *
 * @param server - The FastMCP server instance
 * @param options - Configuration options for tool registration
 *
 * @example
 * ```typescript
 * import { FastMCP } from 'fastmcp';
 * import { registerGitLabToolsForFastMCP } from './gitlab-tools-sdk';
 *
 * const server = new FastMCP<GitLabSession>({ name: 'my-app', version: '1.0.0' });
 *
 * // Register all tools
 * registerGitLabToolsForFastMCP(server);
 *
 * // Register only specific tools
 * registerGitLabToolsForFastMCP(server, {
 *   toolFilter: {
 *     allowList: ['Gitlab_Create_MR_Tool', 'Gitlab_Search_User_Projects_Tool']
 *   }
 * });
 * ```
 *
 * @public
 */
export function registerGitLabToolsForFastMCP(server: FastMCP, options: GitLabToolsRegistryOptions = {}) {
  const { enableLogger = process.env.ENABLE_LOGGER === 'true' } = options;

  // Configure logger if enabled
  if (enableLogger) {
    gitlabApiClient.setLogger(console);
  }

  // Register tools based on filter options
  fastmcpTools.forEach(tool => {
    const standardizedName = toolNameMapping[tool.name as keyof typeof toolNameMapping];
    if (shouldRegisterTool(standardizedName as GitLabToolName, options.toolFilter)) {
      // GitLabTool is now fully compatible with FastMCP's base type, can be registered directly
      server.addTool(tool);
    }
  });
}

/**
 * Registers GitLab tools with an MCP SDK server instance.
 *
 * @param server - The MCP SDK server instance
 * @param options - Configuration options for tool registration
 *
 * @example
 * ```typescript
 * import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
 * import { registerGitLabToolsForMcpSDK } from './gitlab-tools-sdk';
 *
 * const server = new McpServer({
 *   name: 'my-app',
 *   version: '1.0.0',
 *   capabilities: { tools: {} }
 * });
 *
 * // Register all tools
 * registerGitLabToolsForMcpSDK(server);
 *
 * // Register only specific tools
 * registerGitLabToolsForMcpSDK(server, {
 *   toolFilter: {
 *     allowList: ['Gitlab_Create_MR_Tool', 'Gitlab_Search_User_Projects_Tool']
 *   }
 * });
 * ```
 *
 * @public
 */
export function registerGitLabToolsForMcpSDK(server: McpServer, options: GitLabToolsRegistryOptions = {}) {
  const { enableLogger = process.env.ENABLE_LOGGER === 'true' } = options;

  // Configure logger if enabled
  if (enableLogger) {
    gitlabApiClient.setLogger(console);
  }

  // Convert fastmcp tools to MCP SDK format
  fastmcpTools.forEach(tool => {
    const standardizedName = toolNameMapping[tool.name as keyof typeof toolNameMapping];
    if (shouldRegisterTool(standardizedName as GitLabToolName, options.toolFilter)) {
      server.tool(
        tool.name,
        tool.description || '',
        tool.parameters || {},
        async (params) => {
          // fastmcp tools return ContentResult, convert to MCP SDK format
          // Create an empty context as MCP SDK doesn't support session authentication
          const context = {
            log: {
              debug: () => {},
              error: () => {},
              info: () => {},
              warn: () => {},
            },
            reportProgress: async () => {},
            session: undefined,
            streamContent: async () => {},
          };
          const result = await tool.execute(params, context);

          // Convert fastmcp ContentResult to MCP SDK format
          if (typeof result === 'object' && result !== null && 'isError' in result && result.isError) {
            const errorResult = result as { isError: boolean; content: Array<{ type: string; text: string }> };
            throw new Error(
              errorResult.content?.[0]?.type === 'text'
                ? errorResult.content[0].text
                : 'Unknown error'
            );
          }

          // Return the result in MCP SDK format
          if (typeof result === 'object' && result !== null && 'content' in result) {
            const contentResult = result as { content: Array<{ type: string; text: string }> };
            if (contentResult.content?.[0]?.type === 'text') {
              try {
                return JSON.parse(contentResult.content[0].text);
              } catch {
                return contentResult.content[0].text;
              }
            }
          }

          return result;
        }
      );
    }
  });
}


/**
 * Get all available GitLab tool names.
 *
 * @returns Array of all available GitLab tool names
 *
 * @public
 */
export function getAvailableGitLabTools(): GitLabToolName[] {
  return Object.values(toolNameMapping);
}

/**
 * Legacy function for backward compatibility.
 * @deprecated Use registerGitLabToolsForFastMCP instead.
 */
export const registerTools = registerGitLabToolsForFastMCP;

/**
 * Legacy function for backward compatibility.
 * @deprecated Use registerGitLabTools with enableLogger option instead.
 */
export const registerLogger = () => {
  if (process.env.ENABLE_LOGGER) {
    gitlabApiClient.setLogger(console);
  }
};