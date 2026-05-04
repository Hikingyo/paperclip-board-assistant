import { describe, expect, it } from "vitest";

import {
  ClientSidePaginationStrategy,
  OffsetLimitPaginationStrategy,
  paginate,
} from "../src/shared/api/pagination.js";
import { createErrorResult, formatResponse, renderDto } from "../src/tools/response-formatter.js";

describe("pagination and formatter", () => {
  it("applies offset/limit query params", () => {
    const strategy = new OffsetLimitPaginationStrategy();
    expect(strategy.applyPaginationParams("/api/items", { limit: 10, offset: 20 })).toBe(
      "/api/items?limit=10&offset=20",
    );
  });

  it("parses client-side pagination metadata", () => {
    const strategy = new ClientSidePaginationStrategy();
    expect(strategy.parsePaginationMeta([1, 2, 3], {}, { limit: 2, offset: 0 })).toEqual({
      offset: 0,
      has_more: true,
      next_offset: 2,
    });
  });

  it("paginates collections", () => {
    expect(paginate([1, 2, 3], 2, 0)).toMatchObject({
      count: 2,
      total: 3,
      has_more: true,
      next_offset: 2,
    });
  });

  it("formats json and markdown responses", () => {
    const json = formatResponse({ ok: true }, "json", "detail.njk");
    expect(json.text).toContain('"ok": true');

    const md = renderDto({ title: "Hello", description: "", items: [] }, "list.njk");
    expect(md.text).toContain("Hello");
  });

  it("creates formatter error payloads", () => {
    expect(createErrorResult("boom").text).toContain("Error: boom");
  });
});
