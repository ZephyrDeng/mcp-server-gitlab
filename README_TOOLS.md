# GitLab MCP Tools

这个包提供了 GitLab API 的 MCP 工具集合，可以作为 npm 包在其他项目中使用，支持 `@modelcontextprotocol/sdk` 和 `fastmcp` 两种框架。

## 安装

```bash
npm install @zephyr-mcp/gitlab
# 或
bun add @zephyr-mcp/gitlab
```

## 使用方式

### 1. 与 @modelcontextprotocol/sdk 配合使用

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGitLabToolsForMcpSDK } from '@zephyr-mcp/gitlab/tools';

const server = new McpServer({
  name: 'my-app',
  version: '1.0.0',
  capabilities: { tools: {} }
});

// 注册所有 GitLab 工具
registerGitLabToolsForMcpSDK(server);

// 或者只注册特定工具
registerGitLabToolsForMcpSDK(server, {
  toolFilter: {
    allowList: ['Gitlab_Create_MR_Tool', 'Gitlab_Search_User_Projects_Tool']
  }
});
```

### 2. 与 fastmcp 配合使用

```typescript
import { FastMCP } from 'fastmcp';
import { registerGitLabToolsForFastMCP } from '@zephyr-mcp/gitlab/tools';

const server = new FastMCP({
  name: 'my-app',
  version: '1.0.0'
});

// 注册所有 GitLab 工具
registerGitLabToolsForFastMCP(server);

// 或者只注册特定工具
registerGitLabToolsForFastMCP(server, {
  toolFilter: {
    allowList: ['Gitlab_Create_MR_Tool', 'Gitlab_Search_User_Projects_Tool']
  }
});
```

## 环境变量配置

在使用工具前，需要设置以下环境变量：

```bash
# 必需配置
GITLAB_API_URL=https://your-gitlab-instance.com
GITLAB_TOKEN=your_access_token

# 可选映射配置
GITLAB_USER_MAPPING={"username1": 123}
GITLAB_PROJECT_MAPPING={"project-name": 1001}

# 日志配置
ENABLE_LOGGER=true
```

## 可用工具

### 1. Gitlab_Search_User_Projects_Tool
搜索用户及其活跃项目。

```typescript
// 调用示例
{
  "tool": "Gitlab_Search_User_Projects_Tool",
  "arguments": {
    "username": "john_doe",
    "fields": ["id", "name", "web_url"]
  }
}
```

### 2. Gitlab_Get_User_Tasks_Tool
获取当前用户的待办任务。

```typescript
// 调用示例
{
  "tool": "Gitlab_Get_User_Tasks_Tool",
  "arguments": {
    "taskFilterType": "ASSIGNED_MRS",
    "fields": ["id", "title", "web_url"]
  }
}
```

### 3. Gitlab_Search_Project_Details_Tool
搜索项目详情。

```typescript
// 调用示例
{
  "tool": "Gitlab_Search_Project_Details_Tool",
  "arguments": {
    "projectName": "my-project",
    "fields": ["id", "name", "description", "web_url"]
  }
}
```

### 4. Gitlab_Create_MR_Tool
创建新的 Merge Request。

```typescript
// 调用示例
{
  "tool": "Gitlab_Create_MR_Tool",
  "arguments": {
    "projectId": "my-project",
    "sourceBranch": "feature-branch",
    "targetBranch": "main",
    "title": "Add new feature",
    "description": "Description of the feature",
    "assigneeId": "john_doe",
    "reviewerIds": ["jane_doe"],
    "labels": ["feature", "enhancement"]
  }
}
```

### 5. Gitlab_Update_MR_Tool
更新 Merge Request。

```typescript
// 调用示例
{
  "tool": "Gitlab_Update_MR_Tool",
  "arguments": {
    "projectId": "my-project",
    "mergeRequestId": 123,
    "title": "Updated title",
    "description": "Updated description"
  }
}
```

### 6. Gitlab_Accept_MR_Tool
接受并合并 Merge Request。

```typescript
// 调用示例
{
  "tool": "Gitlab_Accept_MR_Tool",
  "arguments": {
    "projectId": "my-project",
    "mergeRequestId": 123,
    "mergeOptions": {
      "squash": true,
      "shouldRemoveSourceBranch": true
    }
  }
}
```

### 7. Gitlab_Create_MR_Comment_Tool
为 Merge Request 添加评论。

```typescript
// 调用示例
{
  "tool": "Gitlab_Create_MR_Comment_Tool",
  "arguments": {
    "projectId": "my-project",
    "mergeRequestId": 123,
    "comment": "Looks good to me!"
  }
}
```

### 8. Gitlab_Raw_API_Tool
通用 GitLab API 调用工具。

```typescript
// 调用示例
{
  "tool": "Gitlab_Raw_API_Tool",
  "arguments": {
    "endpoint": "/projects",
    "method": "GET",
    "params": {
      "owned": true
    }
  }
}
```

## 配置选项

### GitLabToolsRegistryOptions

```typescript
interface GitLabToolsRegistryOptions {
  /** 过滤选项，控制注册哪些工具 */
  toolFilter?: {
    /** 允许注册的工具列表 */
    allowList?: GitLabToolName[];
    /** 禁止注册的工具列表 */
    blockList?: GitLabToolName[];
  };
  /** 是否启用日志 */
  enableLogger?: boolean;
}
```

### 类型定义

```typescript
/** 可用的 GitLab 工具名称 */
type GitLabToolName =
  | "Gitlab_Search_User_Projects_Tool"
  | "Gitlab_Get_User_Tasks_Tool"
  | "Gitlab_Search_Project_Details_Tool"
  | "Gitlab_Create_MR_Tool"
  | "Gitlab_Update_MR_Tool"
  | "Gitlab_Accept_MR_Tool"
  | "Gitlab_Create_MR_Comment_Tool"
  | "Gitlab_Raw_API_Tool";
```

## 示例项目

### 完整的 MCP SDK 项目示例

```typescript
#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGitLabTools } from '@zephyr-mcp/gitlab/tools';

const server = new McpServer({
  name: 'my-gitlab-app',
  version: '1.0.0',
  capabilities: {
    tools: {}
  }
});

// 注册 GitLab 工具
registerGitLabTools(server, {
  enableLogger: true,
  toolFilter: {
    allowList: [
      'Gitlab_Create_MR_Tool',
      'Gitlab_Search_User_Projects_Tool',
      'Gitlab_Get_User_Tasks_Tool'
    ]
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

### 完整的 FastMCP 项目示例

```typescript
#!/usr/bin/env node

import { FastMCP } from 'fastmcp';
import { registerGitLabToolsForFastMCP } from '@zephyr-mcp/gitlab/tools';

const server = new FastMCP({
  name: 'my-gitlab-app',
  version: '1.0.0'
});

// 注册 GitLab 工具
registerGitLabToolsForFastMCP(server, {
  enableLogger: true,
  toolFilter: {
    allowList: ["Gitlab_Create_MR_Tool", "Gitlab_Search_User_Projects_Tool"]
  }
});

// 启动服务器
server.start({
  transportType: 'stdio'
});
```

## 工具特性

1. **自动映射解析**: 自动将用户名和项目名映射为对应的 ID
2. **字段过滤**: 支持过滤 API 响应字段，优化性能
3. **错误处理**: 统一的错误处理和用户友好的错误消息
4. **类型安全**: 完整的 TypeScript 类型定义
5. **灵活配置**: 支持工具过滤和日志配置
6. **双框架支持**: 同时支持 MCP SDK 和 fastmcp
7. **简单明确**: 开发者明确选择使用哪个框架的注册函数

## 故障排除

### 常见问题

1. **认证失败**: 确保 `GITLAB_TOKEN` 环境变量设置正确
2. **API URL 错误**: 确保 `GITLAB_API_URL` 指向正确的 GitLab 实例
3. **权限不足**: 确保访问令牌具有足够的权限
4. **用户/项目映射失败**: 检查映射配置或使用 ID 而非名称

### 调试

启用日志以查看详细的 API 调用信息：

```typescript
registerGitLabTools(server, {
  enableLogger: true
});
```

## 许可证

MIT License