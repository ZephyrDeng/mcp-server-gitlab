import { GitLabSession } from "../types/GitLabSession";

/**
 * Type guard: Check if session is GitLabSession
 */
export function isGitLabSession(session: unknown): session is GitLabSession {
  return session !== null &&
         typeof session === 'object' &&
         'gitlabToken' in session;
}

/**
 * Safely extract GitLab token from context
 */
export function extractGitlabToken(session: unknown): string | undefined {
  if (isGitLabSession(session)) {
    return session.gitlabToken;
  }
  return undefined;
}

/**
 * Safely extract GitLab base URL from context
 */
export function extractGitlabBaseUrl(session: unknown): string | undefined {
  if (isGitLabSession(session)) {
    return session.gitlabBaseUrl;
  }
  return undefined;
}

/**
 * Safely extract headers from context
 */
export function extractHeaders(session: unknown): Record<string, string | string[] | undefined> | undefined {
  if (isGitLabSession(session)) {
    return session.headers;
  }
  return undefined;
}