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
GITLAB_API_URL=https://your-gitlab-instance.com
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

See [USAGE.md](./USAGE.md) for detailed examples of each tool's parameters.

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

When using HTTP Stream mode, clients can connect to:
```
POST http://localhost:3000/mcp
Content-Type: application/json
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
For remote server deployment, first start the server:

```bash
# On your server
MCP_TRANSPORT_TYPE=httpStream MCP_PORT=3000 npx @zephyr-mcp/gitlab
```

Then configure Claude Desktop with HTTP transport:

```json
{
  "mcpServers": {
    "@zephyr-mcp/gitlab": {
      "command": "npx",
      "args": ["@modelcontextprotocol/client-cli", "http://your-server:3000/mcp"]
    }
  }
}
```

### Smithery

Use directly on Smithery platform:

```bash
smithery add @zephyr-mcp/gitlab
```

Or search "@zephyr-mcp/gitlab" in Smithery UI and add to your workspace.

Environment variables:

- `GITLAB_API_URL`: Base URL of your GitLab API
- `GITLAB_TOKEN`: Access token for GitLab API authentication
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

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e GITLAB_API_URL=https://your-gitlab-instance.com \
  -e GITLAB_TOKEN=your_access_token \
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
      - GITLAB_TOKEN=your_gitlab_token
      - GITLAB_API_URL=your-gitlab-instance.com
      - MCP_TRANSPORT_TYPE=httpStream
      - MCP_HOST=0.0.0.0
      - MCP_PORT=3000
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