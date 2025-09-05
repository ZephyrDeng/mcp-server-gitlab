#!/usr/bin/env node
/**
 * GitLab MCP Server 基于 fastmcp 的实现
 *
 * 提供 GitLab 多种 API 工具，支持 Claude、Smithery 等客户端调用
 */

import { FastMCP } from "fastmcp";

// GitLab 相关工具
import { registerLogger, registerTools } from "./tools";

// 解析命令行参数和环境变量
const args = process.argv.slice(2);
const transportType = process.env.MCP_TRANSPORT_TYPE || 
  (args.includes('--http-stream') ? 'httpStream' : 'stdio');
const port = parseInt(process.env.MCP_PORT || '3000');
const endpoint = process.env.MCP_ENDPOINT || '/mcp';

// 创建 FastMCP 服务器实例
const server = new FastMCP({
  name: "GitLab MCP Server",
  version: "1.0.0",
});

// 注册示范资源：GitLab 所有项目

// 注册 GitLab 相关工具
registerTools(server)
registerLogger()

// Start MCP server according to transport type
if (transportType === 'httpStream') {
  console.log(`Starting GitLab MCP Server with HTTP Stream transport on port ${port}, endpoint ${endpoint}`);
  server.start({
    transportType: "httpStream",
    httpStream: {
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