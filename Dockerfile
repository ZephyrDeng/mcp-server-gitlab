# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
FROM oven/bun:alpine

# Install npm so that npx is available
RUN apk add --no-cache npm

# Set working directory
WORKDIR /app

# Copy package files and lockfiles
COPY package.json bun.lock bunfig.toml ./

# Copy the rest of the code
COPY . .

# Install dependencies using bun
RUN bun install

# Build the project
RUN bun run build

# Expose a port if your MCP server uses one (optional)
# EXPOSE 8080

# Start the MCP server
CMD [ "node", "dist/index.js" ]
