import { describe, it, expect } from "@jest/globals";
import { filterResponseFields } from "../gitlab/FieldFilterUtils";
import {
  simpleMock,
  nestedMock,
  complexMRsMock,
} from "./mocks/field_filter_mocks";

describe("filterResponseFields", () => {
  it("should filter flat fields correctly", () => {
    const fields = ["id", "title", "state", "author", "created_at"];
    const filtered = filterResponseFields(simpleMock, fields);
    expect(filtered).toEqual({
      id: 100,
      title: "Sample Title",
      state: "active",
      author: "tester",
      created_at: "2025-01-01T00:00:00Z",
    });
  });

  it("should filter nested fields and array elements correctly", () => {
    const fields = [
      "id",
      "author.name",
      "reviewers[0].name",
      "reviewers[1].role",
      "pipeline.stages[1].status",
    ];

    const filtered = filterResponseFields(nestedMock, fields);
    expect(filtered).toEqual({
      id: 200,
      author: { name: "userA" },
      reviewers: [{ name: "reviewer1" }, { role: "dev" }],
      pipeline: {
        stages: [{}, { status: "failed" }],
      },
    });
  });
});

describe("filterResponseFields with complex MR list", () => {
  it("should filter nested fields in MR array correctly", () => {
    const fields = ["id", "title", "state"];
    const filtered = filterResponseFields(complexMRsMock, fields);
    expect(filtered).toEqual([
      {
        id: 400,
        title: "Complex MR",
        state: "pending",
      },
    ]);
  });
});