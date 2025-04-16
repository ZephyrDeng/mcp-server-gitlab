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

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Start the server
bun run start
```

## Environment Variables

```env
GITLAB_API_URL=https://your-gitlab-instance.com
GITLAB_TOKEN=your_access_token
```

## Usage Examples

See [USAGE.md](./USAGE.md) for detailed examples of each tool's parameters.

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

### Smithery

Use directly on Smithery platform:

```bash
smithery add @zephyr-mcp/gitlab
```

Or search "@zephyr-mcp/gitlab" in Smithery UI and add to your workspace.

Environment variables:

- `GITLAB_API_URL`: Base URL of your GitLab API
- `GITLAB_TOKEN`: Access token for GitLab API authentication

## Related Links

- [fastmcp](https://github.com/punkpeye/fastmcp)
- [Smithery](https://smithery.ai/docs)
- [GitLab API](https://docs.gitlab.com/ee/api/rest/)