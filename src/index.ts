#!/usr/bin/env node
/**
 * GitLab MCP Server implementation based on fastmcp
 *
 * Provides various GitLab API tools, supports clients like Claude, Smithery, etc.
 */

import { FastMCP } from "fastmcp";

// GitLab related tools
import { registerLogger, registerTools } from "./tools";
import { GitLabSession } from "./types/GitLabSession";

// Parse command line arguments and environment variables
const args = process.argv.slice(2);
const transportType = process.env.MCP_TRANSPORT_TYPE || 
  (args.includes('--http-stream') ? 'httpStream' : 'stdio');
const port = parseInt(process.env.MCP_PORT || '3000');
const endpoint = process.env.MCP_ENDPOINT || '/mcp';
const host = process.env.MCP_HOST || (transportType === 'httpStream' ? '0.0.0.0' : 'localhost');

// Create FastMCP server instance
const server = new FastMCP<GitLabSession>({
  name: "GitLab MCP Server",
  version: "1.0.0",
  authenticate: async (request) => {
    // Extract GitLab token from HTTP headers
    const tokenHeader = request.headers["authorization"]?.replace('Bearer ', '') ||
                       request.headers["private-token"] ||
                       request.headers["PRIVATE-TOKEN"] ||
                       request.headers["x-gitlab-token"];

    // Extract GitLab base URL from HTTP headers
    const baseUrlHeader = request.headers["x-gitlab-url"] ||
                          request.headers["gitlab-url"] ||
                          request.headers["gitlab-api-url"];

    // Ensure token and base URL are string types
    const token = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader;
    const baseUrl = Array.isArray(baseUrlHeader) ? baseUrlHeader[0] : baseUrlHeader;

    // Return session data that will be available in context.session
    return {
      gitlabToken: token,
      gitlabBaseUrl: baseUrl,
      headers: request.headers,
      authenticatedAt: new Date().toISOString(),
    };
  },
});

// Register demo resources: all GitLab projects

// Register GitLab related tools
registerTools(server)
registerLogger()

// Start MCP server according to transport type
if (transportType === 'httpStream') {
  console.log(`Starting GitLab MCP Server with HTTP Stream transport on ${host}:${port}, endpoint ${endpoint}`);
  server.start({
    transportType: "httpStream",
    httpStream: {
      host: host,
      port: port,
      endpoint: endpoint as `/${string}`,
    },
  });
} else {
  console.log('Starting GitLab MCP Server with stdio transport');
  server.start({
    transportType: "stdio",
  });
}