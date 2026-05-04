import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { renderTemplate } from "../shared/templates/index.js";
import { renderJson } from "./json-presenter.js";

type ResponseFormat = "markdown" | "json";

export function presentList(
  title: string,
  items: Array<Record<string, unknown>>,
  pagination: {
    total: number;
    count: number;
    offset: number;
    has_more: boolean;
    next_offset?: number;
  },
  responseFormat: ResponseFormat,
  key: string,
): CallToolResult {
  const structured = {
    total: pagination.total,
    count: pagination.count,
    offset: pagination.offset,
    has_more: pagination.has_more,
    ...(pagination.next_offset !== undefined ? { next_offset: pagination.next_offset } : {}),
    [key]: items,
  };

  const text =
    responseFormat === "json"
      ? renderJson(structured)
      : renderTemplate("resource-list.md.njk", {
          title,
          total: pagination.total,
          count: pagination.count,
          offset: pagination.offset,
          items,
        });

  return {
    content: [{ type: "text", text }],
    structuredContent: structured,
  };
}

export function presentDetail(
  title: string,
  resource: Record<string, unknown>,
  responseFormat: ResponseFormat,
): CallToolResult {
  const text =
    responseFormat === "json"
      ? renderJson(resource)
      : renderTemplate("resource-detail.md.njk", { title, resource });

  return {
    content: [{ type: "text", text }],
    structuredContent: resource,
  };
}
