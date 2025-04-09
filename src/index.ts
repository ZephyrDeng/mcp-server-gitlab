import { GitlabMCPServer } from "./server/GitlabMCPServer";
import { GitlabRawApiTool } from "./tools/GitlabRawApiTool";
import { GitlabAcceptMRTool } from "./tools/GitlabAcceptMRTool";
import { GitlabCreateMRCommentTool } from "./tools/GitlabCreateMRCommentTool";
import { GitlabGetUserTasksTool } from "./tools/GitlabGetUserTasksTool";
import { GitlabSearchProjectDetailsTool } from "./tools/GitlabSearchProjectDetailsTool";
import { GitlabSearchUserProjectsTool } from "./tools/GitlabSearchUserProjectsTool";
// 使用自定义服务器
const server = new GitlabMCPServer({
    tools: [
        new GitlabRawApiTool(),
        new GitlabAcceptMRTool(),
        new GitlabCreateMRCommentTool(),
        new GitlabGetUserTasksTool(),
        new GitlabSearchProjectDetailsTool(),
        new GitlabSearchUserProjectsTool(),
    ]
});

// 启动服务器
server.start();

// 处理关闭信号
process.on("SIGINT", async () => {
  await server.stop();
});