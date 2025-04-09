# @zephyr-mcp/gitlab-restful-api

一个基于 Model Context Protocol (MCP) 框架构建的 GitLab 集成服务器，提供与 GitLab 实例的强大集成能力。该服务可作为 Claude 等大型语言模型的插件，允许模型通过 RESTful API 安全地访问 GitLab 资源。

## 功能特点

- **GitLab RESTful API 集成**: 提供与任何 GitLab 实例的 API 的无缝访问，支持丰富的查询和操作能力
- **智能字段映射**: 自动将简单字段名映射到实际嵌套路径，降低使用门槛
- **字段过滤系统**: 精确控制返回的数据字段，减少不必要的数据传输
- **多种操作支持**: 提供用户任务查询、项目搜索、合并请求管理等多种集成操作
- **Smithery 兼容**: 完全兼容 Smithery 部署和分发标准

## 快速开始

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动服务
npm run start
```

## 环境变量配置

服务需要以下环境变量：

```
GITLAB_API_URL=https://your-gitlab-instance.com  # GitLab 实例 URL
GITLAB_TOKEN=your_access_token                    # GitLab 访问令牌
```

## 工具说明

### GitlabRestfulApiTool

GitLab RESTful API 工具允许 LLM 执行各种 GitLab 操作，包括查询用户任务、搜索用户和项目、管理合并请求等。该工具支持智能字段映射和字段过滤功能，大幅简化了 API 操作。

#### 字段映射系统

工具提供智能字段映射系统，无需了解 API 响应的内部结构就能轻松获取数据：

- 基本字段如 `id`、`name` 会自动映射到相应对象的字段 
- 特殊数组表示如 `project_names` 可获取数组中所有元素的 name 字段
- 字段猜测机制在找不到映射时会尝试推断可能的路径

#### 支持的操作

工具支持以下主要操作类型：

1. **getCurrentUserTasks**: 获取当前用户的任务（合并请求、待评审请求、问题等）
2. **searchUserWithProjects**: 搜索用户及其活跃项目
3. **searchProjectWithDetails**: 搜索项目并获取详细信息
4. **createMRComment**: 在合并请求上添加评论
5. **acceptMR**: 接受并合并指定的合并请求
6. **raw**: 直接访问 GitLab API 端点的兜底方案

#### 使用示例

```javascript
// 获取当前用户任务
await mcp.runTool("gitlab_restful_api", {
  operation: "getCurrentUserTasks",
  includeAssignedMRs: "true",
  includeReviewMRs: "true",
  fields: ["id", "name", "username", "assigned_mrs"]
});

// 搜索用户及其项目
await mcp.runTool("gitlab_restful_api", {
  operation: "searchUserWithProjects",
  username: "张三",
  fields: ["id", "name", "username", "project_names"]
});

// 搜索项目并获取详情
await mcp.runTool("gitlab_restful_api", {
  operation: "searchProjectWithDetails",
  projectName: "前端项目",
  fields: ["id", "name", "description", "branch_names", "member_names"]
});

// 创建合并请求评论
await mcp.runTool("gitlab_restful_api", {
  operation: "createMRComment",
  projectId: "group/project-name",
  mergeRequestId: 123,
  comment: "代码看起来不错，已批准！",
  fields: ["id", "body", "created_at"]
});

// 接受合并请求
await mcp.runTool("gitlab_restful_api", {
  operation: "acceptMR",
  projectId: "group/project-name",
  mergeRequestId: 789,
  mergeOptions: {
    shouldRemoveSourceBranch: true
  },
  fields: ["id", "state", "title"]
});
```

## 项目结构

```
gitlab-restful-api/
├── src/
│   ├── tools/
│   │   └── GitlabRestfulApiTool.ts    # GitLab RESTful API 工具
│   └── index.ts                       # 服务器入口
├── smithery.json                      # Smithery 配置
├── USAGE.md                           # 用法文档
├── package.json
└── tsconfig.json
```

## 在 Claude 桌面客户端中使用

### NPM 安装

安装后在 Claude 桌面客户端配置文件中添加以下配置：

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "@zephyr-mcp/gitlab-restful-api": {
      "command": "npx",
      "args": ["-y", "@zephyr-mcp/gitlab-restful-api"]
    }
  }
}
```

## Smithery 安装

如果您使用 Smithery，可以直接通过以下命令安装：

```bash
smithery install @zephyr-mcp/gitlab-restful-api
```

然后在您的 Smithery 配置中启用此工具。

## 了解更多

- [MCP Framework 文档](https://mcp-framework.com)
- [Smithery 文档](https://smithery.ai/docs)
- [GitLab API 文档](https://docs.gitlab.com/ee/api/rest/)