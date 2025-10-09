/**
 * GitLab Session type definition
 * Used for FastMCP session authentication data
 */

export interface GitLabSession {
  /** GitLab access token */
  gitlabToken?: string;
  /** GitLab API base URL */
  gitlabBaseUrl?: string;
  /** Original request headers */
  headers?: Record<string, string | string[] | undefined>;
  /** Authentication timestamp */
  authenticatedAt?: string;
  /** User role */
  role?: string;
  /** User ID */
  userId?: string;
  /** Username */
  username?: string;
}

/**
 * GitLab Session type with extra dynamic properties
 * Uses index signature to satisfy FastMCPSessionAuth constraint while maintaining type safety
 */
export type GitLabSessionWithExtras = GitLabSession & Record<string, unknown>;