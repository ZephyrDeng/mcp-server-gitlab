#!/usr/bin/env node
/**
 * GitLab MCP Server implementation based on fastmcp
 *
 * Provides various GitLab API tools, supports clients like Claude, Smithery, etc.
 */

import { FastMCP } from "fastmcp";

// GitLab related tools
import { registerLogger, registerTools } from "./tools";

// Parse command line arguments and environment variables
const args = process.argv.slice(2);
const transportType = process.env.MCP_TRANSPORT_TYPE || 
  (args.includes('--http-stream') ? 'httpStream' : 'stdio');
const port = parseInt(process.env.MCP_PORT || '3000');
const endpoint = process.env.MCP_ENDPOINT || '/mcp';
const host = process.env.MCP_HOST || (transportType === 'httpStream' ? '0.0.0.0' : 'localhost');

// Create FastMCP server instance
const server = new FastMCP({
  name: "GitLab MCP Server",
  version: "1.0.0",
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