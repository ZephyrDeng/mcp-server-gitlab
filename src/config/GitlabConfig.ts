export interface GitlabConfigOptions {
  baseUrl?: string;
  privateToken?: string;
  timeout?: number;
  userMapping?: { [username: string]: number };
  projectMapping?: { [projectName: string]: string | number };
}

export class GitlabConfig {
  baseUrl: string;
  privateToken: string;
  timeout: number;
  userMapping: { [username: string]: number };
  projectMapping: { [projectName: string]: string | number };

  constructor(options: GitlabConfigOptions = {}) {
    this.baseUrl = options.baseUrl || process.env.GITLAB_API_URL || "";
    this.privateToken = options.privateToken || process.env.GITLAB_TOKEN || "";
    this.timeout = options.timeout ?? 10000;
    this.userMapping = this.loadMapping(options.userMapping, process.env.GITLAB_USER_MAPPING);
    this.projectMapping = this.loadMapping(options.projectMapping, process.env.GITLAB_PROJECT_MAPPING);


    this.validate();
  }

  private loadMapping<T>(optionValue?: T, envValue?: string): T {
    if (optionValue) {
      return optionValue;
    }
    if (envValue) {
      try {
        return JSON.parse(envValue);
      } catch (error) {
        console.warn(`无法解析环境变量中的映射配置: ${envValue}`, error);
      }
    }
    return {} as T; // Return empty object if neither option nor env var is provided/valid
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
