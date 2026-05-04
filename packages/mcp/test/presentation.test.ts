import { describe, expect, it } from "vitest";

import { renderJson } from "../src/presentation/json-presenter.js";
import { presentDetail, presentList } from "../src/presentation/tool-presenter.js";

describe("presentation layer", () => {
  it("renders JSON deterministically", () => {
    expect(renderJson({ status: "ok" })).toContain('"status": "ok"');
  });

  it("presents list in json mode with structured content", () => {
    const result = presentList(
      "Items",
      [{ id: "1", name: "First" }],
      { total: 1, count: 1, offset: 0, has_more: false },
      "json",
      "items",
    );

    expect(result.structuredContent).toMatchObject({
      total: 1,
      count: 1,
      offset: 0,
      has_more: false,
      items: [{ id: "1", name: "First" }],
    });
  });

  it("presents detail in markdown mode", () => {
    const result = presentDetail("Entity", { id: "a1", status: "active" }, "markdown");
    const content = result.content?.[0];
    expect(content && "text" in content ? content.text : "").toContain("# Entity");
  });
});
