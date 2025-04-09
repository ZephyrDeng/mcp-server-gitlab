export const simpleMock = {
  id: 100,
  title: "Sample Title",
  state: "active",
  author: "tester",
  created_at: "2025-01-01T00:00:00Z"
};

export const nestedMock = {
  id: 200,
  title: "Nested Data",
  author: { name: "userA", email: "userA@example.com" },
  reviewers: [
    { name: "reviewer1", role: "lead" },
    { name: "reviewer2", role: "dev" }
  ],
  pipeline: {
    id: 300,
    status: "running",
    stages: [
      { name: "build", status: "success" },
      { name: "test", status: "failed" }
    ]
  }
};

export const complexMRsMock = [
  {
    id: 400,
    title: "Complex MR",
    state: "pending",
    author: { username: "userX" },
    assignees: [{ username: "userY" }],
    reviewers: [{ name: "userZ" }],
    pipeline: {
      stages: [
        {},
        { status: "failed" }
      ]
    }
  }
];