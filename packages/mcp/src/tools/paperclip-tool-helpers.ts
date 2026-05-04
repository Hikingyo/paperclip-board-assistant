import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

import { DEFAULT_BASE_URL } from "../constants.js";
import { renderJson } from "../presentation/json-presenter.js";
import { PaperclipApiError } from "../shared/api/errors.js";
import type { PaginatedResult, ResponseFormat } from "../types.js";

export function createTextResult(text: string, structuredContent?: unknown): CallToolResult {
  return {
    content: [{ type: "text", text }],
    ...(structuredContent && typeof structuredContent === "object"
      ? { structuredContent: structuredContent as Record<string, unknown> }
      : {}),
  };
}

export function createErrorResult(error: unknown): CallToolResult {
  if (error instanceof PaperclipApiError) {
    const detail =
      error.details && Object.keys(error.details).length > 0
        ? ` Details: ${JSON.stringify(error.details)}`
        : "";

    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `${error.message} Verify that PaperclipAI is running and reachable at ${DEFAULT_BASE_URL} or set PAPERCLIP_BASE_URL.${detail}`,
        },
      ],
    };
  }

  const message = error instanceof Error ? error.message : String(error);

  return {
    isError: true,
    content: [{ type: "text", text: `Unexpected Paperclip MCP error: ${message}` }],
  };
}

export function formatJson(value: unknown): string {
  return renderJson(value);
}

export function paginate<T>(items: T[], limit: number, offset: number): PaginatedResult<T> {
  const page = items.slice(offset, offset + limit);
  const nextOffset = offset + page.length;

  return {
    total: items.length,
    count: page.length,
    offset,
    has_more: nextOffset < items.length,
    ...(nextOffset < items.length ? { next_offset: nextOffset } : {}),
    items: page,
  };
}

export function resolveRequestedItem<T extends { id: string }>(
  items: T[],
  options: {
    itemId: string | undefined;
    resourceName: string;
    resourceNamePlural: string;
    idFieldName: string;
  },
): T {
  const { itemId, resourceName, resourceNamePlural, idFieldName } = options;

  if (itemId) {
    const match = items.find((item) => item.id === itemId);
    if (match) {
      return match;
    }

    throw new Error(`No ${resourceName} found for ${idFieldName} "${itemId}".`);
  }

  if (items.length === 1) {
    const [singleItem] = items;
    if (singleItem) {
      return singleItem;
    }
  }

  if (items.length === 0) {
    throw new Error(
      `No ${resourceNamePlural} are visible from the current Paperclip session at ${DEFAULT_BASE_URL}.`,
    );
  }

  throw new Error(
    `Multiple ${resourceNamePlural} are visible. Pass ${idFieldName} to choose one explicitly.`,
  );
}

export function selectText<T>(
  responseFormat: ResponseFormat,
  data: T,
  markdownRenderer: (value: T) => string,
): string {
  return responseFormat === "json" ? formatJson(data) : markdownRenderer(data);
}
