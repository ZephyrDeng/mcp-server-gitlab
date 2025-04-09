/**
* 检查 URL 是否是 GitLab URL
* @param url URL 字符串
* @returns 是否是 GitLab URL
*/
export function isGitlabUrl(url: string): boolean {
 try {
   // 检查是否是有效 URL
   if (!url.match(/^https?:\/\//)) {
     return false;
   }

   const urlObj = new URL(url);
   
   // 从环境变量获取 GitLab 域名
   const gitlabDomain = process.env.GITLAB_API_URL || "git.xxx.com";
   
   // 提取域名部分，移除协议前缀
   const gitlabHost = gitlabDomain.replace(/^https?:\/\//, '').split('/')[0];
   
   // 检查 URL 主机名是否匹配 GitLab 域名
   return urlObj.hostname === gitlabHost;
 } catch (error) {
   // URL 解析失败，不是有效 URL
   return false;
 }
}