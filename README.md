[English Version](./README.en.md)

![](https://badge.mcpx.dev?type=server&features=tools 'MCP server with tools') [![Build Status](https://github.com/ZephyrDeng/mcp-server-gitlab/actions/workflows/ci.yml/badge.svg)](https://github.com/ZephyrDeng/mcp-server-gitlab/actions) [![Node Version](https://img.shields.io/node/v/@zephyr-mcp/gitlab)](https://nodejs.org) [![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

[![Downloads](https://img.shields.io/npm/dm/@zephyr-mcp/gitlab)](https://npmjs.com/package/@zephyr-mcp/gitlab) [![npm version](https://img.shields.io/npm/v/@zephyr-mcp/gitlab)](https://npmjs.com/package/@zephyr-mcp/gitlab) [![smithery badge](https://smithery.ai/badge/@ZephyrDeng/mcp-server-gitlab)](https://smithery.ai/server/@ZephyrDeng/mcp-server-gitlab)


<a href="https://glama.ai/mcp/servers/@ZephyrDeng/mcp-server-gitlab">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@ZephyrDeng/mcp-server-gitlab/badge" />
</a>

基于 Model Context Protocol (MCP) 框架构建的 GitLab 集成服务器，提供多种 GitLab RESTful API 工具，支持 Claude、Smithery 等平台集成。

## 功能概览

- **GitlabSearchUserProjectsTool**：根据用户名搜索用户及其活跃项目
- **GitlabGetUserTasksTool**：获取当前用户的待办任务
- **GitlabSearchProjectDetailsTool**：搜索项目及详细信息
- **GitlabCreateMRCommentTool**：为合并请求添加评论
- **GitlabAcceptMRTool**：接受并合并合并请求
- **GitlabUpdateMRTool**：更新 Merge Request 的指派人、评审人、标题、描述、标签
- **GitlabCreateMRTool**：创建新的 Merge Request，支持指派 assignee 和 reviewers
- **GitlabRawApiTool**：自定义调用任意 GitLab API

## 快速开始

```bash
# 安装依赖
bun install

# 构建项目
bun run build

# 启动服务
bun run start
```

## 环境变量配置

```env
GITLAB_API_URL=https://your-gitlab-instance.com
GITLAB_TOKEN=your_access_token

# 可选：提供用户名到用户 ID 的映射（JSON 字符串）
# 这可以减少 API 调用次数，尤其是在频繁引用相同用户时
# 示例：'{"username1": 123, "username2": 456}'
GITLAB_USER_MAPPING={"username1": 123, "username2": 456}

# 可选：提供项目名称到项目 ID 的映射（JSON 字符串）
# 项目 ID 可以是数字或字符串（如 'group/project'）
# 这可以减少 API 调用次数，并确保使用正确的项目
# 示例：'{"project-name-a": 1001, "group/project-b": "group/project-b"}'
GITLAB_PROJECT_MAPPING={"project-name-a": 1001, "group/project-b": "group/project-b"}
```

## 工具示例

详见 [USAGE.md](./USAGE.md)，包括每个工具的参数示例。

## 项目结构

```
src/
├── server/
│   └── GitlabMCPServer.ts          # MCP 服务器入口
├── tools/
│   ├── GitlabAcceptMRTool.ts
│   ├── GitlabCreateMRCommentTool.ts
│   ├── GitlabGetUserTasksTool.ts
│   ├── GitlabRawApiTool.ts
│   ├── GitlabSearchProjectDetailsTool.ts
│   ├── GitlabSearchUserProjectsTool.ts
│   └── gitlab/
│       ├── FieldFilterUtils.ts
│       ├── GitlabApiClient.ts
│       └── GitlabApiTypes.ts
├── utils/
│   ├── is.ts
│   └── sensitive.ts
smithery.json                      # Smithery 配置
USAGE.md                          # 使用示例
package.json
tsconfig.json
```

## 集成方式

### Claude 桌面客户端

在配置文件中添加：

```json
{
  "mcpServers": {
    "@zephyr-mcp/gitlab": {
      "command": "npx",
      "args": ["-y", "@zephyr-mcp/gitlab@0.1.0"]
    }
  }
}
```

配置参数：
- `GITLAB_API_URL`: GitLab API 的基础 URL
- `GITLAB_TOKEN`: 用于验证 GitLab API 请求的访问令牌

## 相关链接

- [fastmcp](https://github.com/punkpeye/fastmcp)
- [Smithery](https://smithery.ai/docs)
- [GitLab API](https://docs.gitlab.com/ee/api/rest/)
