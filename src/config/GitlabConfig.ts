export interface GitlabConfigOptions {
  baseUrl?: string;
  privateToken?: string;
  timeout?: number;
  userMapping?: { [username: string]: number };
  projectMapping?: { [projectName: string]: string | number };
  allowEmptyBaseUrl?: boolean; // Allow empty baseUrl for HTTP stream mode
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


    this.validate(options.allowEmptyBaseUrl);
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

  private validate(allowEmptyBaseUrl = false) {
    if (!this.baseUrl && !allowEmptyBaseUrl) {
      throw new Error("GitLab configuration error: missing API URL (baseUrl), please set environment variable GITLAB_API_URL or pass it as parameter");
    }
    // 移除 privateToken 的验证，因为可以通过 Header 动态传入
  }
}
