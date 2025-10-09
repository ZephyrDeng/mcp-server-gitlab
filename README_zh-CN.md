[English Version](./README.md)

![](https://badge.mcpx.dev?type=server&features=tools 'MCP server with tools') [![Build Status](https://github.com/ZephyrDeng/mcp-server-gitlab/actions/workflows/ci.yml/badge.svg)](https://github.com/ZephyrDeng/mcp-server-gitlab/actions) [![Node Version](https://img.shields.io/node/v/@zephyr-mcp/gitlab)](https://nodejs.org) [![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

[![Downloads](https://img.shields.io/npm/dm/@zephyr-mcp/gitlab)](https://npmjs.com/package/@zephyr-mcp/gitlab) [![npm version](https://img.shields.io/npm/v/@zephyr-mcp/gitlab)](https://npmjs.com/package/@zephyr-mcp/gitlab) [![smithery badge](https://smithery.ai/badge/@ZephyrDeng/mcp-server-gitlab)](https://smithery.ai/server/@ZephyrDeng/mcp-server-gitlab)


<a href="https://glama.ai/mcp/servers/@ZephyrDeng/mcp-server-gitlab">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@ZephyrDeng/mcp-server-gitlab/badge" />
</a>

基于 fastmcp 框架构建的 GitLab 集成服务器，提供多种 GitLab RESTful API 工具，支持 Claude、Smithery 等平台集成。

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

### Stdio 模式（默认）
```bash
# 安装依赖
bun install

# 构建项目
bun run build

# 启动 stdio 传输模式的服务器（默认）
bun run start
```

### HTTP Stream 模式（服务器部署）
```bash
# 安装依赖
bun install

# 构建项目
bun run build

# 启动 HTTP stream 传输模式的服务器
MCP_TRANSPORT_TYPE=httpStream MCP_PORT=3000 bun run start

# 或使用命令行标志
bun dist/index.js --http-stream
```

## 环境变量配置

```env
# 所有模式必需（httpStream 模式下可通过 HTTP headers 提供）
GITLAB_API_URL=https://your-gitlab-instance.com

# stdio 模式必需，httpStream 模式可选
# (可在 httpStream 模式下通过 HTTP headers 提供)
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

# MCP 传输配置（可选）
# 传输类型：stdio（默认）或 httpStream
MCP_TRANSPORT_TYPE=stdio

# HTTP Stream 配置（仅在 MCP_TRANSPORT_TYPE=httpStream 时使用）
# 服务器绑定地址（httpStream 模式默认为 0.0.0.0，stdio 模式默认为 localhost）
# 对于 Docker 部署，请使用 0.0.0.0 以允许外部访问
MCP_HOST=0.0.0.0

# 服务器端口（默认：3000）
MCP_PORT=3000

# API 端点路径（默认：/mcp）
MCP_ENDPOINT=/mcp
```

## 使用示例

### 直接 HTTP API 使用

您也可以直接通过 HTTP 请求与 MCP 服务器交互：

```bash
# 示例：使用 Bearer token 获取用户任务
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-gitlab-token" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "Gitlab Get User Tasks Tool",
      "arguments": {
        "taskFilterType": "ASSIGNED_MRS",
        "fields": ["id", "title", "source_branch", "target_branch"]
      }
    }
  }'
```

```bash
# 示例：使用 PRIVATE-TOKEN header 搜索项目
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "PRIVATE-TOKEN: your-gitlab-token" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "Gitlab Search Project Details Tool",
      "arguments": {
        "projectName": "my-project",
        "fields": ["id", "name", "description", "web_url"]
      }
    }
  }'
```

```bash
# 示例：使用 Bearer token 和动态 GitLab 实例 URL
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-gitlab-token" \
  -H "x-gitlab-url: https://gitlab.company.com" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "Gitlab Get User Tasks Tool",
      "arguments": {
        "taskFilterType": "ASSIGNED_MRS",
        "fields": ["id", "title", "source_branch", "target_branch"]
      }
    }
  }'
```

### 工具示例

详细工具参数示例请参见 [USAGE.md](./USAGE.md)。

HTTP Stream 模式下动态认证的主要优势：
- **多租户支持**：单个服务器实例可以服务多个用户
- **安全性**：每个请求使用自己的认证令牌和 GitLab 实例 URL
- **灵活性**：可以在不重启服务器的情况下轮换客户端令牌
- **多实例支持**：从同一服务器连接到不同的 GitLab 实例

## 传输模式

本服务器支持两种传输模式：

### 1. Stdio 传输（默认）
- 最适合本地开发与 MCP 客户端的直接集成
- 使用 stdin/stdout 进行通信
- 无需网络配置

### 2. HTTP Stream 传输
- 支持服务器部署以实现远程访问
- 使用 HTTP POST 请求和流式响应
- 允许多个客户端连接到同一服务器实例
- 适用于生产部署
- **支持通过 HTTP headers 进行动态 token 认证**

使用 HTTP Stream 模式时，客户端可以连接到：
```
POST http://localhost:3000/mcp
Content-Type: application/json
```

#### 认证方式

HTTP Stream 模式支持多种提供 GitLab token 和实例 URL 的方式：

**Token 认证：**

**1. Bearer Token（推荐）：**
```http
POST http://localhost:3000/mcp
Content-Type: application/json
Authorization: Bearer your-gitlab-access-token
```

**2. Private Token Header：**
```http
POST http://localhost:3000/mcp
Content-Type: application/json
PRIVATE-TOKEN: your-gitlab-access-token
```

**3. 替代 Private Token Header：**
```http
POST http://localhost:3000/mcp
Content-Type: application/json
private-token: your-gitlab-access-token
```

**4. 自定义 GitLab Token Header：**
```http
POST http://localhost:3000/mcp
Content-Type: application/json
x-gitlab-token: your-gitlab-access-token
```

**GitLab 实例 URL 配置：**

**1. GitLab URL Header（推荐）：**
```http
POST http://localhost:3000/mcp
Content-Type: application/json
x-gitlab-url: https://gitlab.company.com
```

**2. 替代 GitLab URL Headers：**
```http
POST http://localhost:3000/mcp
Content-Type: application/json
gitlab-url: https://gitlab.company.com
```

```http
POST http://localhost:3000/mcp
Content-Type: application/json
gitlab-api-url: https://gitlab.company.com
```

**5. 回退到环境变量：**
如果 headers 中没有提供 token 或 URL，服务器将回退到 `GITLAB_TOKEN` 和 `GITLAB_API_URL` 环境变量。

**完整示例：**
```http
POST http://localhost:3000/mcp
Content-Type: application/json
Authorization: Bearer your-gitlab-access-token
x-gitlab-url: https://gitlab.company.com
```

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

#### Stdio 模式（默认）

在配置文件中添加：

```json
{
  "mcpServers": {
    "@zephyr-mcp/gitlab": {
      "command": "npx",
      "args": ["-y", "@zephyr-mcp/gitlab"]
    }
  }
}
```

#### HTTP Stream 模式（服务器部署）

**服务器设置：**
首先启动服务器（注意使用 HTTP headers 时 `GITLAB_TOKEN` 是可选的）：

```bash
# 在您的服务器上 - 环境变量中不需要 token
MCP_TRANSPORT_TYPE=httpStream MCP_PORT=3000 MCP_HOST=0.0.0.0 npx @zephyr-mcp/gitlab

# 或使用 Docker
docker run -d \
  -p 3000:3000 \
  -e GITLAB_API_URL=https://your-gitlab-instance.com \
  -e MCP_TRANSPORT_TYPE=httpStream \
  -e MCP_HOST=0.0.0.0 \
  -e MCP_PORT=3000 \
  gitlab-mcp-server
```

**客户端配置：**

选项 1：**使用 Bearer Token**（推荐）
```json
{
  "mcpServers": {
    "@zephyr-mcp/gitlab": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/client-cli",
        "http://your-server:3000/mcp",
        "--header", "Authorization: Bearer your-gitlab-access-token"
      ]
    }
  }
}
```

选项 2：**使用 Private Token Header**
```json
{
  "mcpServers": {
    "@zephyr-mcp/gitlab": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/client-cli",
        "http://your-server:3000/mcp",
        "--header", "PRIVATE-TOKEN: your-gitlab-access-token"
      ]
    }
  }
}
```

选项 3：**使用动态 GitLab URL 和 Token**
```json
{
  "mcpServers": {
    "@zephyr-mcp/gitlab": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/client-cli",
        "http://your-server:3000/mcp",
        "--header", "Authorization: Bearer your-gitlab-access-token",
        "--header", "x-gitlab-url: https://gitlab.company.com"
      ]
    }
  }
}
```

**多租户使用：**
每个用户可以在自己的客户端配置中配置自己的 token 和 GitLab 实例 URL，允许同一个服务器实例服务具有不同 GitLab 权限和实例的多个用户。

### Smithery

直接在 Smithery 平台上使用：

```bash
smithery add @zephyr-mcp/gitlab
```

或在 Smithery UI 中搜索 "@zephyr-mcp/gitlab" 并添加到您的工作区。

环境变量：

- `GITLAB_API_URL`: GitLab API 的基础 URL（stdio 模式必需，httpStream 模式可选 - 可通过 HTTP headers 提供）
- `GITLAB_TOKEN`: GitLab API 认证的访问令牌（stdio 模式必需，httpStream 模式可选 - 可通过 HTTP headers 提供）
- `MCP_TRANSPORT_TYPE`: 传输类型（stdio/httpStream）
- `MCP_HOST`: HTTP stream 模式的服务器绑定地址
- `MCP_PORT`: HTTP stream 模式的 HTTP 端口
- `MCP_ENDPOINT`: HTTP stream 模式的 HTTP 端点路径

## 部署

### Docker 部署

仓库包含用于轻松部署的 Dockerfile：

```bash
# 构建 Docker 镜像
docker build -t gitlab-mcp-server .

# 使用环境变量运行（token 和 URL 都可通过 HTTP headers 提供）
docker run -d \
  -p 3000:3000 \
  -e MCP_TRANSPORT_TYPE=httpStream \
  -e MCP_HOST=0.0.0.0 \
  -e MCP_PORT=3000 \
  gitlab-mcp-server
```

#### Docker Compose 示例

```yaml
services:
  gitlab-mcp:
    image: node:22.14.0
    container_name: gitlab-mcp
    ports:
      - "3000:3000"
    environment:
      - MCP_TRANSPORT_TYPE=httpStream
      - MCP_HOST=0.0.0.0
      - MCP_PORT=3000
      # 使用 HTTP headers 时 GITLAB_API_URL 和 GITLAB_TOKEN 都是可选的
      # - GITLAB_API_URL=https://your-gitlab-instance.com
      # - GITLAB_TOKEN=your_gitlab_token
    command: npx -y @zephyr-mcp/gitlab@latest
```

**Docker 重要提示**：在 Docker 容器中运行时，确保设置 `MCP_HOST=0.0.0.0` 以允许外部访问。httpStream 传输的默认值已经是 `0.0.0.0`，但明确设置它可确保兼容性。

### 手动部署

```bash
# 安装依赖并构建
npm install
npm run build

# 启动 HTTP stream 模式的服务器（使用 HTTP headers 时 GITLAB_API_URL 是可选的）
export MCP_TRANSPORT_TYPE=httpStream
export MCP_PORT=3000
# 可选：设置默认的 GitLab 实例 URL（可在 HTTP headers 中覆盖）
# export GITLAB_API_URL=https://your-gitlab-instance.com

# 运行服务器
node dist/index.js
```

### 进程管理器 (PM2)

```bash
# 安装 PM2
npm install -g pm2

# 创建生态系统文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'gitlab-mcp-server',
    script: 'dist/index.js',
    env: {
      MCP_TRANSPORT_TYPE: 'httpStream',
      MCP_PORT: 3000
      // 使用 HTTP headers 时 GITLAB_API_URL 是可选的
      // GITLAB_API_URL: 'https://your-gitlab-instance.com',
    }
  }]
}
EOF

# 使用 PM2 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 相关链接

- [fastmcp](https://github.com/punkpeye/fastmcp)
- [Smithery](https://smithery.ai/docs)
- [GitLab API](https://docs.gitlab.com/ee/api/rest/)
