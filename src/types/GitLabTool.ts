import { Tool } from "fastmcp";
import { GitLabSession } from "./GitLabSession";

/**
 * Base type definition for GitLab tools
 *
 * Uses Record<string, unknown> | undefined to maintain full compatibility with FastMCPSessionAuth
 * In tool implementations, we ensure type safety through type guards
 */
export type GitLabTool = Tool<Record<string, unknown> | undefined>;