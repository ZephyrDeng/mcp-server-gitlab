import { isGitlabUrl } from './is';

/**
 * 敏感内容处理工具类
 * 提供对敏感内容的检测和掩码处理功能
 */
export class SensitiveContentHandler {
  /**
   * 需要打码的敏感字段名称模式
   */
  private static readonly sensitiveFieldPatterns = [
    // 路径相关
    /path/i, /url/i, /link/i, /location/i, 
    // 描述相关
    /description/i, /content/i, /text/i, /body/i, /message/i, /comment/i,
    // 用户相关
    /user/i, /author/i, /owner/i, /assignee/i, /creator/i, /email/i, 
    // 地址相关
    /address/i, /location/i, 
    // 其他敏感信息
    /token/i, /secret/i, /key/i, /password/i, /credential/i,
  ];

  /**
   * 不打码的安全字段
   */
  private static readonly safeFields = [
    'id', 'name', 'visibility', 'state', 'status', 'createdAt', 'updatedAt', 
    'closedAt', 'mergedAt', 'type', 'count', 'total', 'public'
  ];

  /**
   * 对敏感内容进行打码处理
   * @param obj 需要处理的对象
   * @returns 处理后的对象，敏感内容已被打码
   */
  public static maskSensitiveContent(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    // 如果是数组，递归处理每个元素
    if (Array.isArray(obj)) {
      return obj.map(item => this.maskSensitiveContent(item));
    }
    
    // 处理对象
    const result = { ...obj };
    
    for (const key in result) {
      // 跳过内部字段
      if (key.startsWith('__')) continue;
      
      // 特殊处理 webUrl 字段 - 保留 GitLab URL
      if (key === 'webUrl' && typeof result[key] === 'string') {
        // 如果是 GitLab URL，保持原样
        if (isGitlabUrl(result[key])) {
          // 保留原值
          console.log(`保留 GitLab URL: ${result[key]}`);
        } else {
          // 非 GitLab URL，打码处理
          try {
            const url = new URL(result[key]);
            const origin = url.origin;
            result[key] = `${origin}/***`;
          } catch (error) {
            // URL 解析失败时，将整个值打码
            result[key] = '***';
          }
        }
        continue;
      }
      
      // 如果是安全字段，不处理
      if (this.safeFields.includes(key)) {
        continue;
      }
      
      const value = result[key];
      
      // 如果值是对象或数组，递归处理
      if (value && typeof value === 'object') {
        result[key] = this.maskSensitiveContent(value);
      }
      // 处理字符串值
      else if (typeof value === 'string') {
        // 检查是否是敏感字段或包含敏感内容
        const isSensitiveField = this.sensitiveFieldPatterns.some(pattern => pattern.test(key));
        const containsSensitiveContent = this.containsSensitiveContent(value);
        
        // 如果是敏感字段或包含敏感内容，则打码
        if (isSensitiveField || containsSensitiveContent) {
          // 保留前后两位，中间打码处理
          if (typeof value === 'string' && value.length > 4) {
            const prefix = value.substring(0, 2);
            const suffix = value.substring(value.length - 2);
            result[key] = `${prefix}***${suffix}`;
          } else {
            // 对于短字符串，仍然全部打码
            result[key] = '***';
          }
        }
      }
    }
    
    return result;
  }

  /**
   * 检查字符串是否包含敏感内容
   * @param str 要检查的字符串
   * @returns 是否包含敏感内容
   */
  public static containsSensitiveContent(str: string): boolean {
    // 检查是否是 GitLab URL
    if (isGitlabUrl(str)) {
      return false; // GitLab URL 不视为敏感内容
    }

    // 从环境变量获取 GitLab 域名
    const gitlabHost = process.env.GITLAB_API_URL?.replace(/^https?:\/\//, '').split('/')[0] || "git.xxx.com";

    // 检查是否包含 GitLab 域名
    try {
      // 如果字符串包含 GitLab 域名，也不视为敏感内容
      if (str.includes(gitlabHost)) {
        return false;
      }
    } catch (error) {
      // 忽略错误，继续检查其他敏感内容模式
    }

    // 敏感内容模式
    const sensitivePatterns = [
      // 邮箱
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      // URL (非 GitLab 域名的 URL)
      new RegExp(`https?:\\/\\/(?!${gitlabHost.replace(/\./g, '\\.')})[^\\s]+`),
      // 路径 (排除常见的 GitLab 路径格式)
      /\/(?!api\/v\d|projects\/\d+|merge_requests|issues|pipelines|commits)[\w\/-]+/,
      // IP 地址
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
      // 可能的用户名 (排除常见的 GitLab 用户引用)
      /@(?!gitlab|git)[\w-]+/,
      // 电话号码
      /(\+\d{1,3})?[\s-]?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/,
    ];
    
    return sensitivePatterns.some(pattern => pattern.test(str));
  }

  /**
   * 递归处理嵌套对象
   * @param obj 需要处理的对象
   * @param processFunc 处理对象的回调函数
   */
  public static processNestedObjects(obj: any, processFunc: (obj: any) => any): void {
    if (!obj || typeof obj !== 'object') return;
    
    // 处理数组
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        // 跳过 null 或 undefined 值
        if (obj[i] == null) continue;
        
        // 先检查当前对象是否需要处理
        const processed = processFunc(obj[i]);
        if (processed !== obj[i]) {
          // 如果对象被处理，则替换它
          obj[i] = processed;
        } else if (typeof obj[i] === 'object') {
          // 否则继续递归处理
          this.processNestedObjects(obj[i], processFunc);
        }
      }
      return;
    }
    
    // 处理对象属性
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // 跳过 null 或 undefined 值
        if (obj[key] == null) continue;
        
        if (typeof obj[key] === 'object') {
          // 先检查当前对象是否需要处理
          const processed = processFunc(obj[key]);
          if (processed !== obj[key]) {
            // 如果对象被处理，则替换它
            obj[key] = processed;
          } else {
            // 否则继续递归处理
            this.processNestedObjects(obj[key], processFunc);
          }
        }
      }
    }
  }
} 