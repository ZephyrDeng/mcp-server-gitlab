[中文版](./README.md)

![](https://badge.mcpx.dev?type=server&features=tools 'MCP server with tools') [![Build Status](https://github.com/ZephyrDeng/mcp-server-gitlab/actions/workflows/ci.yml/badge.svg)](https://github.com/ZephyrDeng/mcp-server-gitlab/actions) [![Node Version](https://img.shields.io/node/v/@zephyr-mcp/gitlab)](https://nodejs.org) [![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

[![Downloads](https://img.shields.io/npm/dm/@zephyr-mcp/gitlab)](https://npmjs.com/package/@zephyr-mcp/gitlab) [![npm version](https://img.shields.io/npm/v/@zephyr-mcp/gitlab)](https://npmjs.com/package/@zephyr-mcp/gitlab) [![smithery badge](https://smithery.ai/badge/@ZephyrDeng/mcp-server-gitlab)](https://smithery.ai/server/@ZephyrDeng/mcp-server-gitlab)



<a href="https://glama.ai/mcp/servers/@ZephyrDeng/mcp-server-gitlab">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@ZephyrDeng/mcp-server-gitlab/badge" />
</a>

# mcp-gitlab MCP Server (English)

A GitLab integration server built on the fastmcp framework, providing various GitLab RESTful API tools. Supports integration with Claude, Smithery, and other platforms.

## Features

- **GitlabSearchUserProjectsTool**: Search users and their active projects by username
- **GitlabGetUserTasksTool**: Get current user's pending tasks
- **GitlabSearchProjectDetailsTool**: Search projects and details
- **GitlabCreateMRCommentTool**: Add comments to merge requests
- **GitlabAcceptMRTool**: Accept and merge merge requests
- **GitlabUpdateMRTool**: Update merge request assignee, reviewers, title, description, and labels
- **GitlabCreateMRTool**: Create a new merge request with assignee and reviewers
- **GitlabRawApiTool**: Call any GitLab API with custom parameters

## Quick Start

### Stdio Mode (Default)
```bash
# Install dependencies
bun install

# Build the project
bun run build

# Start the server with stdio transport (default)
bun run start
```

### HTTP Stream Mode (Server Deployment)
```bash
# Install dependencies
bun install

# Build the project
bun run build

# Start the server with HTTP stream transport
MCP_TRANSPORT_TYPE=httpStream MCP_PORT=3000 bun run start

# Or using command line flag
bun dist/index.js --http-stream
```

## Environment Variables

```env
# Required for all modes (optional for httpStream mode - can be provided via HTTP headers)
GITLAB_API_URL=https://your-gitlab-instance.com

# Required for stdio mode, optional for httpStream mode
# (can be provided via HTTP headers in httpStream mode)
GITLAB_TOKEN=your_access_token

# Optional: Provide a mapping from usernames to user IDs (JSON string)
# This can reduce API calls, especially when referencing the same users frequently
# Example: '{"username1": 123, "username2": 456}'
GITLAB_USER_MAPPING={"username1": 123, "username2": 456}

# Optional: Provide a mapping from project names to project IDs (JSON string)
# Project IDs can be numbers or strings (e.g., 'group/project')
# This can reduce API calls and ensure the correct project is used
# Example: '{"project-name-a": 1001, "group/project-b": "group/project-b"}'
GITLAB_PROJECT_MAPPING={"project-name-a": 1001, "group/project-b": "group/project-b"}

# MCP Transport Configuration (Optional)
# Transport type: stdio (default) or httpStream  
MCP_TRANSPORT_TYPE=stdio

# HTTP Stream Configuration (Only used when MCP_TRANSPORT_TYPE=httpStream)
# Server binding address (default: 0.0.0.0 for httpStream, localhost for stdio)
# For Docker deployments, use 0.0.0.0 to allow external access
MCP_HOST=0.0.0.0

# Server port (default: 3000)
MCP_PORT=3000

# API endpoint path (default: /mcp)
MCP_ENDPOINT=/mcp
```

## Usage Examples

### Direct HTTP API Usage

You can also interact with the MCP server directly via HTTP requests:

```bash
# Example: Get user tasks using Bearer token
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
# Example: Search projects using PRIVATE-TOKEN header
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
# Example: Use dynamic GitLab instance URL with Bearer token
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

### Tool Examples

For detailed examples of each tool's parameters, see [USAGE.md](./USAGE.md).

Key benefits of HTTP Stream mode with dynamic authentication:
- **Multi-tenant support**: Single server instance can serve multiple users
- **Security**: Each request uses its own authentication token and GitLab instance URL
- **Flexibility**: Tokens and GitLab URLs can be configured per client without server restart
- **Multi-instance support**: Connect to different GitLab instances from the same server

## Transport Modes

This server supports two transport modes:

### 1. Stdio Transport (Default)
- Best for local development and direct integration with MCP clients
- Uses stdin/stdout for communication
- No network configuration needed

### 2. HTTP Stream Transport
- Enables server deployment for remote access
- Uses HTTP POST requests with streaming responses
- Allows multiple clients to connect to the same server instance
- Ideal for production deployments
- **Supports dynamic token authentication via HTTP headers**

When using HTTP Stream mode, clients can connect to:
```
POST http://localhost:3000/mcp
Content-Type: application/json
```

#### Authentication Methods

HTTP Stream mode supports multiple ways to provide GitLab tokens and instance URLs:

**Token Authentication:**

**1. Bearer Token (Recommended):**
```http
POST http://localhost:3000/mcp
Content-Type: application/json
Authorization: Bearer your-gitlab-access-token
```

**2. Private Token Header:**
```http
POST http://localhost:3000/mcp
Content-Type: application/json
PRIVATE-TOKEN: your-gitlab-access-token
```

**3. Alternative Private Token Header:**
```http
POST http://localhost:3000/mcp
Content-Type: application/json
private-token: your-gitlab-access-token
```

**4. Custom GitLab Token Header:**
```http
POST http://localhost:3000/mcp
Content-Type: application/json
x-gitlab-token: your-gitlab-access-token
```

**GitLab Instance URL Configuration:**

**1. GitLab URL Header (Recommended):**
```http
POST http://localhost:3000/mcp
Content-Type: application/json
x-gitlab-url: https://gitlab.company.com
```

**2. Alternative GitLab URL Headers:**
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

**5. Fallback to Environment Variables:**
If no token or URL is provided in headers, the server will fall back to the `GITLAB_TOKEN` and `GITLAB_API_URL` environment variables.

**Complete Example:**
```http
POST http://localhost:3000/mcp
Content-Type: application/json
Authorization: Bearer your-gitlab-access-token
x-gitlab-url: https://gitlab.company.com
```

## Project Structure

```
src/
├── server/
│   └── GitlabMCPServer.ts          # MCP server entry point
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
smithery.json                      # Smithery config
USAGE.md                          # Usage examples
package.json
tsconfig.json
```

## Integration

### Claude Desktop Client

#### Stdio Mode (Default)
Add to your config:

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

#### HTTP Stream Mode (Server Deployment)

**Server Setup:**
First start the server (note that both `GITLAB_TOKEN` and `GITLAB_API_URL` are optional when using HTTP headers):

```bash
# On your server - no token or URL required in env vars
MCP_TRANSPORT_TYPE=httpStream MCP_PORT=3000 MCP_HOST=0.0.0.0 npx @zephyr-mcp/gitlab

# Or with Docker
docker run -d \
  -p 3000:3000 \
  -e MCP_TRANSPORT_TYPE=httpStream \
  -e MCP_HOST=0.0.0.0 \
  -e MCP_PORT=3000 \
  gitlab-mcp-server
```

**Client Configuration:**

Option 1: **With Bearer Token** (Recommended)
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

Option 2: **With Private Token Header**
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

Option 3: **With Dynamic GitLab URL and Token**
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

**Multi-tenant Usage:**
Each user can configure their own token and GitLab instance URL in their client configuration, allowing the same server instance to serve multiple users with different GitLab permissions and instances.

### Smithery

Use directly on Smithery platform:

```bash
smithery add @zephyr-mcp/gitlab
```

Or search "@zephyr-mcp/gitlab" in Smithery UI and add to your workspace.

Environment variables:

- `GITLAB_API_URL`: Base URL of your GitLab API (required for stdio mode, optional for httpStream mode - can be provided via HTTP headers)
- `GITLAB_TOKEN`: Access token for GitLab API authentication (required for stdio mode, optional for httpStream mode - can be provided via HTTP headers)
- `MCP_TRANSPORT_TYPE`: Transport type (stdio/httpStream)
- `MCP_HOST`: Server binding address for HTTP stream mode
- `MCP_PORT`: HTTP port for HTTP stream mode
- `MCP_ENDPOINT`: HTTP endpoint path for HTTP stream mode

## Deployment

### Docker Deployment

The repository includes a Dockerfile for easy deployment:

```bash
# Build the Docker image
docker build -t gitlab-mcp-server .

# Run with environment variables (both token and URL can be provided via HTTP headers)
docker run -d \
  -p 3000:3000 \
  -e MCP_TRANSPORT_TYPE=httpStream \
  -e MCP_HOST=0.0.0.0 \
  -e MCP_PORT=3000 \
  gitlab-mcp-server
```

#### Docker Compose Example

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
      # Both GITLAB_API_URL and GITLAB_TOKEN are optional when using HTTP headers
      # - GITLAB_API_URL=https://your-gitlab-instance.com
      # - GITLAB_TOKEN=your_gitlab_token
    command: npx -y @zephyr-mcp/gitlab@latest
```

**Important for Docker:** When running in Docker containers, make sure to set `MCP_HOST=0.0.0.0` to allow external access. The default value for httpStream transport is already `0.0.0.0`, but setting it explicitly ensures compatibility.

### Manual Deployment

```bash
# Install dependencies and build
npm install
npm run build

# Start the server in HTTP stream mode
export GITLAB_API_URL=https://your-gitlab-instance.com
export GITLAB_TOKEN=your_access_token
export MCP_TRANSPORT_TYPE=httpStream
export MCP_PORT=3000

# Run the server
node dist/index.js
```

### Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'gitlab-mcp-server',
    script: 'dist/index.js',
    env: {
      GITLAB_API_URL: 'https://your-gitlab-instance.com',
      GITLAB_TOKEN: 'your_access_token',
      MCP_TRANSPORT_TYPE: 'httpStream',
      MCP_PORT: 3000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Related Links

- [fastmcp](https://github.com/punkpeye/fastmcp)
- [Smithery](https://smithery.ai/docs)
- [GitLab API](https://docs.gitlab.com/ee/api/rest/)