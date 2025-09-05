# mcp-server-gitlab

mcp-server-gitlab is a GitLab MCP (Model Context Protocol) server built with TypeScript, Bun, and the fastmcp framework. It provides GitLab REST API integration tools for managing projects, merge requests, and user tasks through various MCP-compatible clients like Claude Desktop and Smithery.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap, Build, and Test the Repository:

1. **Install Bun runtime (required)**:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   source ~/.bashrc
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```
   - Fresh install: ~20 seconds, subsequent installs: ~0.02 seconds (cached)
   - Installs 608+ packages including TypeScript, Jest, fastmcp, and axios

3. **Build the project**:
   ```bash
   bun run build
   ```
   - Takes approximately 2-3 seconds
   - NEVER CANCEL - Always wait for completion
   - Runs: clean → TypeScript compilation → post-build script (fixes ES module imports)
   - Output: Compiled JavaScript in `dist/` directory with executable permissions

4. **Run tests**:
   ```bash
   bun test
   ```
   - Takes approximately 0.14 seconds - very fast
   - NEVER CANCEL - Always wait for completion
   - Requires environment variables to be set (see Environment Setup section)
   - 84 tests across 18 files, all unit tests with mocked API calls

### Environment Setup (CRITICAL):

**Create `.env` file before running tests or application**:
```bash
cp .env.example .env
```

**Edit `.env` with actual values**:
```env
GITLAB_TOKEN=glpat-your-actual-token-here
GITLAB_API_URL=https://your-gitlab-instance.com
```

**Optional environment variables**:
```env
# User ID mapping to reduce API calls
GITLAB_USER_MAPPING={"username1": 123, "username2": 456}

# Project ID mapping to reduce API calls  
GITLAB_PROJECT_MAPPING={"project-name": 1001, "group/project": "group/project"}
```

### Run the Application:

1. **Start MCP server**:
   ```bash
   bun run start
   ```
   - Builds then starts the MCP server via stdio transport
   - Server will wait for MCP protocol messages on stdin
   - Will output JSON-RPC responses and ping messages

2. **Development mode with auto-reload**:
   ```bash
   bun run dev
   ```
   - Runs TypeScript compiler in watch mode + nodemon for auto-restart
   - Use for active development

3. **Test MCP Inspector** (for debugging):
   ```bash
   bun run inspect
   ```
   - Launches MCP inspector tool for testing the server interactively
   - Rebuilds first, then opens inspector interface

## Validation

### Manual Validation Requirements:
- **ALWAYS run through complete MCP protocol communication after making changes**
- **Test server initialization**: Send MCP initialize message and verify response contains GitLab tools
- **Environment validation**: Ensure both valid and invalid GitLab tokens/URLs are handled gracefully
- **NEVER just start/stop the application** - actual functionality testing is required

### Complete Validation Scenario:
```bash
# 1. Build and start server
bun run build && echo '{"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"roots":{"listChanged":true},"sampling":{}},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1,"jsonrpc":"2.0"}' | timeout 10s bun dist/index.js

# Expected response: JSON with GitLab MCP server capabilities
# Should return: {"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{},"logging":{}},"serverInfo":{"name":"GitLab MCP Server","version":"1.0.0"}},"jsonrpc":"2.0","id":1}
```

### Pre-commit Validation:
- **ALWAYS run all tests**: `bun test`
- **ALWAYS verify build succeeds**: `bun run build`
- **Check for TypeScript errors**: `tsc --noEmit` (no output = success)
- **Validate environment setup**: Tests should pass with proper .env configuration
- **Clean build validation**: `bun run clean && bun run build && bun test`

## Common Tasks

### Important File Locations:
- **Main entry point**: `src/index.ts` (registers tools and starts FastMCP server)
- **Tool definitions**: `src/tools/*.ts` (GitlabSearchProjectDetailsTool, etc.)
- **GitLab API client**: `src/tools/gitlab/GitlabApiClient.ts`
- **Configuration**: `src/config/GitlabConfig.ts`
- **Tests**: `src/tools/__tests__/*.test.ts`
- **Build output**: `dist/` (generated, executable)

### Available Scripts:
- `bun run clean` - Remove dist directory
- `bun run build` - Full build process (2-3 seconds)
- `bun run start` - Build and start MCP server
- `bun run dev` - Development with auto-reload
- `bun run test` - Run Jest test suite (0.15 seconds)
- `bun run test:watch` - Run tests in watch mode
- `bun run inspect` - Launch MCP inspector
- `bun run deploy` - Deploy to Smithery platform

### Common Project Structure:
```
src/
├── config/GitlabConfig.ts          # Environment configuration
├── index.ts                        # Main MCP server entry point
├── tools/                          # GitLab API tools
│   ├── GitlabAcceptMRTool.ts
│   ├── GitlabCreateMRCommentTool.ts
│   ├── GitlabCreateMRTool.ts
│   ├── GitlabGetUserTasksTool.ts
│   ├── GitlabRawApiTool.ts
│   ├── GitlabSearchProjectDetailsTool.ts
│   ├── GitlabSearchUserProjectsTool.ts
│   ├── GitlabUpdateMRTool.ts
│   ├── gitlab/                     # Core GitLab client
│   │   ├── FieldFilterUtils.ts
│   │   ├── GitlabApiClient.ts
│   │   └── GitlabApiTypes.ts
│   └── __tests__/                  # Comprehensive test suite
└── utils/                          # Utility functions
```

### Development Workflow:
1. **Make changes to source files in `src/`**
2. **Run tests**: `bun test` (validate immediately)
3. **Build**: `bun run build` (verify compilation)
4. **Test functionality**: Use `bun run inspect` or manual MCP protocol testing
5. **For tool changes**: Update corresponding test file in `src/tools/__tests__/`

### Integration Testing:
- **Claude Desktop**: Add server to mcpServers config with command `npx -y @zephyr-mcp/gitlab`
- **Smithery Platform**: Deploy using `bun run deploy` with environment variables
- **Manual Protocol Testing**: Send MCP JSON-RPC messages to server via stdin

### Common Debugging:
- **"Cannot access before initialization" errors**: Environment variables missing, create .env file
- **GitLab API errors**: Check GITLAB_TOKEN and GITLAB_API_URL in .env
- **Build failures**: Usually TypeScript errors, check with `tsc --noEmit`
- **Test failures**: Often due to missing mocks or environment setup

### Timing Expectations:
- **Dependency installation**: Fresh: ~20 seconds, Cached: ~0.02 seconds (NEVER CANCEL)
- **Build process**: ~2-3 seconds (NEVER CANCEL)
- **Test execution**: ~0.14 seconds (NEVER CANCEL)
- **Development commands**: Start immediately, use Ctrl+C to stop

### CRITICAL Reminders:
- **NEVER CANCEL builds or tests** - they complete very quickly
- **ALWAYS create .env file** before running tests or application
- **ALWAYS test actual MCP protocol functionality** after changes
- **Use `bun` commands, not `npm`** - this project uses Bun runtime
- **Check dist/ output** after builds to ensure files are properly generated