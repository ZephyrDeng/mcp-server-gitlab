import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { GitlabApiResponse } from "./GitlabApiTypes";
import { GitlabConfig } from "../../config/GitlabConfig";

export interface LoggerLike {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

export class GitlabApiClient {
  private client: AxiosInstance;
  private config: GitlabConfig;
  private logger = {
    info(...args: any[]) {},
    warn(...args: any[]) {},
    error(...args: any[]) {},
    debug(...args: any[]) {},
  };

  constructor(config: GitlabConfig) {
    this.config = config;
    this.client = this.createApiClient();
  }

  public setLogger(logger: LoggerLike) {
    this.logger = logger
  }

  private createApiClient(): AxiosInstance {
    const normalizedBaseUrl = this.normalizeBaseUrl(this.config.baseUrl);

    const axiosConfig: AxiosRequestConfig = {
      baseURL: normalizedBaseUrl,
      timeout: this.config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'PRIVATE-TOKEN': this.config.privateToken
      },
    };

    this.logger.info(`创建 GitLab API 客户端，基础 URL: ${normalizedBaseUrl}`);
    return axios.create(axiosConfig);
  }

  private normalizeBaseUrl(url: string): string {
    let normalizedUrl = String(url).trim();
    if (!normalizedUrl) {
      this.logger.warn('空的 GitLab URL，使用默认值');
      return 'https://gitlab.com/api/v4';
    }
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    normalizedUrl = normalizedUrl.replace(/\/+$/, '');
    if (!/\/api\/v4(?:\/|$)/.test(normalizedUrl)) {
      return `${normalizedUrl}/api/v4`;
    } else {
      const apiPathIndex = normalizedUrl.indexOf('/api/v4');
      return normalizedUrl.substring(0, apiPathIndex + '/api/v4'.length);
    }
  }

  async apiRequest(endpoint: string, method: string = 'GET', params?: Record<string, any>, data?: Record<string, any>): Promise<GitlabApiResponse> {
    try {
      if (endpoint && !endpoint.startsWith('/')) {
        endpoint = `/${endpoint}`;
      }
      this.logger.info(`执行 GitLab API 请求：${method} ${endpoint}`);
      const response = await this.client.request({
        url: endpoint,
        method,
        params,
        data,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const statusCode = axiosError.response?.status || 0;
        let errorMessage = `GitLab API 请求失败：${axiosError.message}`;

        if (statusCode === 401) {
          errorMessage = 'GitLab API 认证失败：请检查您的访问令牌是否有效';
        } else if (statusCode === 403) {
          errorMessage = 'GitLab API 权限不足：您没有足够的权限执行此操作';
        } else if (statusCode === 404) {
          errorMessage = `GitLab API 返回 404：${endpoint} 不存在、参数错误或权限不足`;
        } else if (statusCode === 429) {
          errorMessage = 'GitLab API 请求过于频繁：已达到速率限制，请稍后重试';
        } else if (statusCode >= 500) {
          errorMessage = 'GitLab API 服务器错误：服务器暂时不可用或存在内部错误';
        }

        return {
          error: true,
          status: statusCode,
          message: errorMessage,
          details: axiosError.response?.data || {},
        };
      }

      return {
        error: true,
        message: `GitLab API 请求失败：${(error as Error).message}`,
      };
    }
  }

  isValidResponse(response: any): boolean {
    return !(response && response.error === true);
  }
}