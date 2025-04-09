export interface GitlabConfigOptions {
  baseUrl?: string;
  privateToken?: string;
  timeout?: number;
}

export class GitlabConfig {
  baseUrl: string;
  privateToken: string;
  timeout: number;

  constructor(options: GitlabConfigOptions = {}) {
    this.baseUrl = options.baseUrl || process.env.GITLAB_API_URL || "";
    this.privateToken = options.privateToken || process.env.GITLAB_TOKEN || "";
    this.timeout = options.timeout ?? 10000;

    this.validate();
  }

  private validate() {
    if (!this.privateToken) {
      throw new Error("GitLab 配置错误：缺少访问令牌（privateToken），请设置环境变量 GITLAB_TOKEN 或通过参数传入");
    }
    if (!this.baseUrl) {
      throw new Error("GitLab 配置错误：缺少 API 地址（baseUrl），请设置环境变量 GITLAB_API_URL 或通过参数传入");
    }
  }
}