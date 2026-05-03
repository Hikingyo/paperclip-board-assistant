import { z } from "zod";

export const responseFormatSchema = z.enum(["markdown", "json"]).default("markdown");

export const readOnlyListSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Maximum number of items to return."),
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Number of items to skip before returning results."),
  response_format: responseFormatSchema.describe(
    "Output format: markdown for human-readable summaries or json for structured output.",
  ),
});

export const readOnlyGetSchema = z.object({
  response_format: responseFormatSchema.describe(
    "Output format: markdown for human-readable summaries or json for structured output.",
  ),
});

export const companyReadOnlyGetSchema = readOnlyGetSchema.extend({
  company_id: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Target company ID. If omitted and exactly one company is visible, that company is selected automatically.",
    ),
});

export const companyReadOnlyListSchema = readOnlyListSchema.extend({
  company_id: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Target company ID. If omitted and exactly one company is visible, that company is selected automatically.",
    ),
});

export const agentReadOnlyGetSchema = companyReadOnlyGetSchema.extend({
  agent_id: z.string().min(1).describe("Agent ID to retrieve."),
});

export const projectReadOnlyGetSchema = companyReadOnlyGetSchema.extend({
  project_id: z.string().min(1).describe("Project ID to retrieve."),
});

export type ReadOnlyListInput = z.infer<typeof readOnlyListSchema>;
export type ReadOnlyGetInput = z.infer<typeof readOnlyGetSchema>;
export type CompanyReadOnlyGetInput = z.infer<typeof companyReadOnlyGetSchema>;
export type CompanyReadOnlyListInput = z.infer<typeof companyReadOnlyListSchema>;
export type AgentReadOnlyGetInput = z.infer<typeof agentReadOnlyGetSchema>;
export type ProjectReadOnlyGetInput = z.infer<typeof projectReadOnlyGetSchema>;
