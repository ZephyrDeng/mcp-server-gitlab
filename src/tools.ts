import type { FastMCP } from 'fastmcp';

import { gitlabApiClient } from './utils/gitlabApiClientInstance';

import { GitlabAcceptMRTool } from './tools/GitlabAcceptMRTool';
import { GitlabCreateMRCommentTool } from './tools/GitlabCreateMRCommentTool';
import { GitlabCreateMRTool } from './tools/GitlabCreateMRTool';
import { GitlabGetUserTasksTool } from './tools/GitlabGetUserTasksTool';
import { GitlabRawApiTool } from './tools/GitlabRawApiTool';
import { GitlabSearchProjectDetailsTool } from './tools/GitlabSearchProjectDetailsTool';
import { GitlabSearchUserProjectsTool } from './tools/GitlabSearchUserProjectsTool';
import { GitlabUpdateMRTool } from './tools/GitlabUpdateMRTool';

export const registerTools = (server: FastMCP) => {
  server.addTool(GitlabAcceptMRTool);
  server.addTool(GitlabCreateMRCommentTool);
  server.addTool(GitlabCreateMRTool);
  server.addTool(GitlabGetUserTasksTool);
  server.addTool(GitlabRawApiTool);
  server.addTool(GitlabSearchProjectDetailsTool);
  server.addTool(GitlabSearchUserProjectsTool);
  server.addTool(GitlabUpdateMRTool);
};

export const registerLogger = () => {
  if (process.env.ENABLE_LOGGER) {
    gitlabApiClient.setLogger(console);
  }
};