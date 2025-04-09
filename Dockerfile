FROM oven/bun:latest

WORKDIR /app

# 复制 package.json 和 lock 文件
COPY package.json bun.lock ./

# 安装依赖
RUN bun install

# 复制源代码
COPY . .

# 构建应用
RUN bun run build

# 设置环境变量
ENV NODE_ENV=production

# 启动命令（将由 smithery.yaml 中的配置控制实际执行命令）
CMD ["bun", "dist/index.js"] 