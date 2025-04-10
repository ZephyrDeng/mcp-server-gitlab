[English Version](./README.en.md)

# mcp-gitlab MCP Server
[![smithery badge](https://smithery.ai/badge/@ZephyrDeng/mcp-server-gitlab)](https://smithery.ai/server/@ZephyrDeng/mcp-server-gitlab)

基于 Model Context Protocol (MCP) 框架构建的 GitLab 集成服务器，提供多种 GitLab RESTful API 工具，支持 Claude、Smithery 等平台集成。

## 功能概览

- **GitlabSearchUserProjectsTool**：根据用户名搜索用户及其活跃项目
- **GitlabGetUserTasksTool**：获取当前用户的待办任务
- **GitlabSearchProjectDetailsTool**：搜索项目及详细信息
- **GitlabCreateMRCommentTool**：为合并请求添加评论
- **GitlabAcceptMRTool**：接受并合并合并请求
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
      "args": ["-y", "@zephyr-mcp/gitlab@0.0.4"]
    }
  }
}
```

### Smithery

在 Smithery 平台上直接使用：

```bash
smithery add @zephyr-mcp/gitlab
```

或者在 Smithery 用户界面中搜索 "@zephyr-mcp/gitlab" 并添加到您的工作空间。

配置参数：
- `GITLAB_API_URL`: GitLab API 的基础 URL
- `GITLAB_TOKEN`: 用于验证 GitLab API 请求的访问令牌

## 相关链接

- [fastmcp](https://github.com/punkpeye/fastmcp)
- [Smithery](https://smithery.ai/docs)
- [GitLab API](https://docs.gitlab.com/ee/api/rest/)
