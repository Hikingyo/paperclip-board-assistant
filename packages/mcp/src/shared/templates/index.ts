import path from "node:path";
import { fileURLToPath } from "node:url";

import nunjucks from "nunjucks";

/**
 * Template engine configuration using Nunjucks
 * Provides centralized template rendering for markdown, emails, etc.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = __dirname;

// Configure Nunjucks
const env = nunjucks.configure(templatesDir, {
  autoescape: false, // Don't escape since we're generating markdown/text
  trimBlocks: true,
  lstripBlocks: true,
});

/**
 * Render a template with given context
 */
export function renderTemplate<T extends Record<string, unknown>>(
  templateName: string,
  context: T,
): string {
  try {
    return env.render(templateName, context);
  } catch (error) {
    throw new Error(
      `Template rendering failed for ${templateName}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Get template environment for advanced usage
 */
export function getTemplateEnv(): nunjucks.Environment {
  return env;
}

export default { renderTemplate, getTemplateEnv };
