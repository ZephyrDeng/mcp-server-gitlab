import { GitlabAcceptMRTool } from "./tools/GitlabAcceptMRTool";
import { GitlabCreateMRCommentTool } from "./tools/GitlabCreateMRCommentTool";
import { GitlabGetUserTasksTool } from "./tools/GitlabGetUserTasksTool";
import { GitlabRawApiTool } from "./tools/GitlabRawApiTool";
import { GitlabSearchUserProjectsTool } from "./tools/GitlabSearchUserProjectsTool";
import { GitlabSearchProjectDetailsTool } from "./tools/GitlabSearchProjectDetailsTool";
import type { FastMCP } from 'fastmcp'
import { gitlabApiClient } from './utils/gitlabApiClientInstance'

export const registerTools = (server: FastMCP) => {
  server.addTool(GitlabAcceptMRTool)
  server.addTool(GitlabCreateMRCommentTool)
  server.addTool(GitlabGetUserTasksTool)
  server.addTool(GitlabRawApiTool)
  server.addTool(GitlabSearchUserProjectsTool)
  server.addTool(GitlabSearchProjectDetailsTool)
}

export const registerLogger = () => {
  if (process.env.ENABLE_LOGGER) {
    gitlabApiClient.setLogger(console)
  }
}