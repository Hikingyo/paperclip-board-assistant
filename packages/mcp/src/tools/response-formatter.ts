import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import { renderJson } from "../presentation/json-presenter.js";
import { renderTemplate } from "../shared/templates/index.js";

export type ResponseFormat = "markdown" | "json";

/**
 * Render DTO to markdown using Nunjucks templates
 */
export function renderDto<T>(data: T, templateName: string): TextContent {
  try {
    const markdown = renderTemplate(templateName, data as Record<string, unknown>);
    return {
      type: "text",
      text: markdown,
    };
  } catch (error) {
    throw new Error(`Template rendering failed for ${templateName}: ${error}`);
  }
}

/**
 * Format DTO response based on response_format parameter
 */
export function formatResponse<T>(
  data: T,
  format: ResponseFormat,
  templateName: string,
): TextContent {
  if (format === "json") {
    return {
      type: "text",
      text: renderJson(data),
    };
  }

  return renderDto(data, templateName);
}

/**
 * Create error result for MCP
 */
export function createErrorResult(message: string): TextContent {
  return {
    type: "text",
    text: `Error: ${message}`,
  };
}
