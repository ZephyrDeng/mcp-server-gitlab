import { GitlabApiClient } from "../tools/gitlab/GitlabApiClient";
import { GitlabConfig } from "../config/GitlabConfig";

const config = new GitlabConfig({
  baseUrl: process.env.GITLAB_API_URL,
  privateToken: process.env.GITLAB_TOKEN,
});

export const gitlabApiClient = new GitlabApiClient(config);