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
          errorMessage = `GitLab API returned 404: ${endpoint} not found, parameter error or insufficient permissions`;
        } else if (statusCode === 429) {
          errorMessage = 'GitLab API 请求过于频繁：已达到速率限制，请稍后重试';
        } else if (statusCode >= 500) {
          errorMessage = 'GitLab API server error: server temporarily unavailable or internal error';
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

  /**
   * 尝试将用户名或用户 ID 解析为用户 ID。
   * 优先使用配置中的 userMapping，然后尝试调用 GitLab API。
   * @param usernameOrId 用户名（字符串）或用户 ID（数字）。
   * @returns 解析后的用户 ID，如果无法解析则返回 null。
   */
  async resolveUserId(usernameOrId: string | number): Promise<number | null> {
    if (typeof usernameOrId === 'number') {
      return usernameOrId;
    }

    if (typeof usernameOrId === 'string') {
      const mappedId = this.config.userMapping?.[usernameOrId];
      if (mappedId) {
        this.logger.debug(`通过映射找到用户 ID: ${usernameOrId} -> ${mappedId}`);
        return mappedId;
      }

      // 如果映射中没有，尝试通过 API 查询
      this.logger.debug(`映射中未找到用户 ${usernameOrId}，尝试通过 API 查询...`);
      const response = await this.apiRequest('/users', 'GET', { username: usernameOrId });

      if (this.isValidResponse(response) && Array.isArray(response) && response.length === 1) {
        this.logger.debug(`通过 API 找到用户 ID: ${usernameOrId} -> ${response[0].id}`);
        return response[0].id;
      } else if (this.isValidResponse(response) && Array.isArray(response) && response.length > 1) {
        this.logger.warn(`通过 API 找到多个用户匹配 ${usernameOrId}，无法确定唯一用户。`);
      } else if (this.isValidResponse(response) && Array.isArray(response) && response.length === 0) {
        this.logger.warn(`通过 API 未找到用户 ${usernameOrId}。`);
      } else if (!this.isValidResponse(response)) {
        // Only log error message if the response indicates an error
        this.logger.error(`API error when querying user ${usernameOrId}: ${(response as GitlabApiResponse)?.message || 'Unknown error'}`);
      }
    }

    this.logger.warn(`无法解析用户：${usernameOrId}`);
    return null;
  }

  /**
   * 尝试将项目名或项目 ID 解析为项目 ID。
   * 优先使用配置中的 projectMapping，然后尝试调用 GitLab API。
   * @param projectNameOrId 项目名（字符串）或项目 ID（数字或字符串形式的数字）。
   * @returns 解析后的项目 ID，如果无法解析则返回 null。
   */
  async resolveProjectId(projectNameOrId: string | number): Promise<string | number | null> {
    if (typeof projectNameOrId === 'number') {
      return projectNameOrId;
    }

    if (typeof projectNameOrId === 'string') {
      const mappedId = this.config.projectMapping?.[projectNameOrId];
      if (mappedId) {
        this.logger.debug(`通过映射找到项目 ID: ${projectNameOrId} -> ${mappedId}`);
        return mappedId;
      }

      // 如果映射中没有，尝试通过 API 查询
      this.logger.debug(`映射中未找到项目 ${projectNameOrId}，尝试通过 API 查询...`);
      // 使用 simple=true 减少返回数据量，search 会匹配 name 和 path
      const response = await this.apiRequest('/projects', 'GET', { search: projectNameOrId, simple: true, order_by: 'similarity', sort: 'desc' });

      if (this.isValidResponse(response) && Array.isArray(response) && response.length > 0) {
        // 尝试寻找精确匹配 name 或 path_with_namespace 的项目
        const exactMatch = response.find(p => p.name === projectNameOrId || p.path_with_namespace === projectNameOrId);
        if (exactMatch) {
           this.logger.debug(`通过 API 精确匹配找到项目 ID: ${projectNameOrId} -> ${exactMatch.id}`);
           return exactMatch.id;
        }
        // 如果没有精确匹配，但只有一个结果，则使用该结果
        if (response.length === 1) {
          this.logger.debug(`通过 API 找到唯一模糊匹配项目 ID: ${projectNameOrId} -> ${response[0].id}`);
          return response[0].id;
        } else {
          this.logger.warn(`通过 API 找到多个项目匹配 ${projectNameOrId}，且无精确匹配，无法确定唯一项目。`);
          // 可以考虑返回最相似的那个，但可能有风险
          // return response[0].id;
        }

      } else if (this.isValidResponse(response) && Array.isArray(response) && response.length === 0) {
        this.logger.warn(`通过 API 未找到项目 ${projectNameOrId}。`);
      } else if (!this.isValidResponse(response)) {
         // Only log error message if the response indicates an error
        this.logger.error(`API error when querying project ${projectNameOrId}: ${(response as GitlabApiResponse)?.message || 'Unknown error'}`);
      }
    }

    this.logger.warn(`无法解析项目：${projectNameOrId}`);
    return null;
  }
}

