#!/usr/bin/env node
/**
 * GitLab MCP Server 基于 fastmcp 的实现
 *
 * 提供 GitLab 多种 API 工具，支持 Claude、Smithery 等客户端调用
 */

import { FastMCP } from "fastmcp";

// GitLab 相关工具
import { registerLogger, registerTools } from "./tools";


// 创建 FastMCP 服务器实例
const server = new FastMCP({
  name: "GitLab MCP Server",
  version: "1.0.0",
});

// 注册示范资源：GitLab 所有项目

// 注册 GitLab 相关工具
registerTools(server)
registerLogger()

// 启动 MCP 服务器，使用 stdio 传输
server.start({
  transportType: "stdio",
});