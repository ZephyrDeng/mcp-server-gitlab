import { MCPServer, MCPTool, MCPResource } from "mcp-framework";

export class GitlabMCPServer extends MCPServer {
  constructor({
    tools,
    resources,
  }: {
    tools?: MCPTool[];
    resources?: MCPResource[];
  }) {
    // 首先调用父类构造函数
    super();

    // 由于我们无法直接访问 MCPServer 的私有属性，
    // 我们需要在 start 方法执行前注册所有工具和资源
    this.registerManually({
      tools: tools || [],
      resources: resources || [],
    });
  }

  /**
   * 手动注册所有工具和资源
   */
  private registerManually({
    tools,
    resources,
  }: {
    tools: MCPTool[];
    resources: MCPResource[];
  }) {
    // 使用自定义方法模拟原始 MCPServer 的 start 方法中的自动加载
    // 注意：我们将在 start 方法之前先重写这些值，这样 MCPServer 的 start 方法不会再尝试自动加载
    this.injectToolsAndResources(tools, resources);
  }

  /**
   * 注入工具和资源的方法
   * 这个方法模拟了 MCPServer 中自动加载工具和资源的功能
   */
  private injectToolsAndResources(tools: any[], resources: any[]) {
    // 我们使用一个 hack 方式，利用 JavaScript 的运行时特性
    // 将私有属性直接添加到实例上
    const self = this as any;

    // 替换掉工具加载器和资源加载器的 loadTools 和 loadResources 方法
    // 这样在 start 方法调用时，不会再尝试从文件系统加载

    self.toolLoader = {
      loadTools: async () => tools,
      hasTools: async () => !!tools.length,
    };

    self.resourceLoader = {
      loadResources: async () => resources,
      hasResources: async () => !!resources.length,
    };
  }
}

export default GitlabMCPServer;