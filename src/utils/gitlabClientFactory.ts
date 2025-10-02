import { GitlabApiClient } from "../tools/gitlab/GitlabApiClient";
import { GitlabConfig } from "../config/GitlabConfig";
import { Context } from "fastmcp";
import { extractGitlabToken, extractGitlabBaseUrl } from "./typeGuards";

const config = new GitlabConfig({
  baseUrl: process.env.GITLAB_API_URL,
  privateToken: process.env.GITLAB_TOKEN,
  allowEmptyBaseUrl: process.env.MCP_TRANSPORT_TYPE === 'httpStream',
});

/**
 * Extract GitLab token and base URL from context and create client
 * @param context MCP request context
 * @returns GitLab API client instance
 */
export function createGitlabClientFromContext(context?: Context<Record<string, unknown> | undefined>): GitlabApiClient {
  // Use type-safe functions to extract token and base URL
  const token = extractGitlabToken(context?.session);
  const baseUrl = extractGitlabBaseUrl(context?.session);

  // Create config with dynamic values if provided
  const configWithDynamicValues = new GitlabConfig({
    baseUrl: baseUrl || config.baseUrl,
    privateToken: token || config.privateToken,
    allowEmptyBaseUrl: process.env.MCP_TRANSPORT_TYPE === 'httpStream',
  });

  return new GitlabApiClient(configWithDynamicValues);
}

/**
 * Create GitLab API client instance (maintains backward compatibility)
 * @param token Optional dynamic token, uses configured token if not provided
 * @param baseUrl Optional dynamic base URL, uses configured URL if not provided
 * @returns GitLab API client instance
 */
export function createGitlabApiClient(token?: string, baseUrl?: string): GitlabApiClient {
  // Create config with dynamic values if provided
  const configWithDynamicValues = new GitlabConfig({
    baseUrl: baseUrl || config.baseUrl,
    privateToken: token || config.privateToken,
    allowEmptyBaseUrl: process.env.MCP_TRANSPORT_TYPE === 'httpStream',
  });

  return new GitlabApiClient(configWithDynamicValues);
}

// Default instance for backward compatibility
export const gitlabApiClient = createGitlabApiClient();