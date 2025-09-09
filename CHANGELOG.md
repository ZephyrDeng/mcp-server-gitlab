# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-09-09

### Added
- MCP_HOST environment variable support for better Docker deployment compatibility
- Enhanced Docker deployment documentation with MCP_HOST configuration

### Fixed
- Docker HTTP stream connection issues by adding configurable host binding
- Server binding address configuration for containerized environments

### Changed
- Updated documentation for Docker deployment with MCP_HOST support
- Improved transport test coverage for HTTP stream mode

## [0.3.0] - 2025-09-05

### Changed
- Updated build system from Bun to npm/Jest for better compatibility
- Switched from Chinese comments to English for international accessibility
- Updated fastmcp to v3.15.2 to support httpStream transport
- Fixed Jest configuration for proper testing

### Fixed
- CI pipeline configuration and test execution
- TypeScript configuration and build process
- Import path resolution in compiled JavaScript

### Security
- Updated @modelcontextprotocol/inspector to v0.16.6 to address security vulnerability

## [0.2.0] - 2025-08-XX

### Added
- HTTP stream transport support for server deployment  
- Comprehensive deployment documentation
- Docker deployment support with examples

### Changed  
- Enhanced MCP server configuration for both stdio and HTTP modes
- Improved server startup and transport handling

### Fixed
- Transport configuration and mode switching
- Server initialization and connection handling

## [0.1.0] - Initial Release

### Added
- **GitlabSearchUserProjectsTool**: Search users and their active projects by username
- **GitlabGetUserTasksTool**: Get current user's pending tasks  
- **GitlabSearchProjectDetailsTool**: Search projects and details
- **GitlabCreateMRCommentTool**: Add comments to merge requests
- **GitlabAcceptMRTool**: Accept and merge merge requests
- **GitlabUpdateMRTool**: Update merge request assignee, reviewers, title, description, and labels
- **GitlabCreateMRTool**: Create a new merge request with assignee and reviewers
- **GitlabRawApiTool**: Call any GitLab API with custom parameters
- Support for both stdio and httpStream transport modes
- Comprehensive test coverage
- Docker deployment support
- Integration with Claude Desktop, Smithery, and other MCP clients