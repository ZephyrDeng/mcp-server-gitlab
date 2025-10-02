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
  /** Index signature to satisfy FastMCPSessionAuth constraint */
  [key: string]: unknown;
}