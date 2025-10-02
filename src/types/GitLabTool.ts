import { Tool } from "fastmcp";
import { GitLabSession } from "./GitLabSession";

/**
 * GitLab 工具的基础类型定义
 *
 * 使用 Record<string, unknown> | undefined 来保持与 FastMCPSessionAuth 的完全兼容性
 * 在工具实现中，我们会通过类型守卫来确保类型安全
 */
export type GitLabTool = Tool<Record<string, unknown> | undefined>;