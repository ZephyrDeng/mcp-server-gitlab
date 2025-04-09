export const mock1 = {
  id: 1,
  title: "Test MR",
  state: "opened"
};

export const mock2 = {
  id: 2,
  title: "Another MR",
  state: "merged",
  author: "alice",
  created_at: "2025-04-09T12:00:00Z",
  updated_at: "2025-04-09T13:00:00Z",
  web_url: "https://gitlab.com/example/mr/2"
};

export const complexMRs = [
  {
    id: 846276,
    iid: 315,
    project_id: 39231,
    title: "Draft: Chore/remove api package",
    description: "## 改动点\n\n- 移除 `chckout-ui-components/example`\n- 移动类型子包 `checkout-ui-extensions` 到 `checkout-ui-components` 内",
    state: "opened",
    created_at: "2025-04-09T10:29:37.302+08:00",
    updated_at: "2025-04-09T14:13:05.148+08:00",
    author: {
      id: 4002,
      username: "kongweian1",
      name: "kongweian1"
    },
    assignees: [
      {
        id: 2838,
        username: "dengzefeng",
        name: "dengzefeng"
      }
    ],
    reviewers: [
      {
        id: 3933,
        username: "xuxinguo",
        name: "xuxinguo"
      }
    ],
    pipeline: {
      id: 101,
      status: "success",
      stages: [
        { name: "build", status: "success" },
        { name: "test", status: "failed" }
      ]
    }
  }
];