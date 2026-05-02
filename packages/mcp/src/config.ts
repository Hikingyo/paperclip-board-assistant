import { z } from "zod";

import { DEFAULT_BASE_URL } from "./constants.js";

const runtimeConfigSchema = z.object({
  PAPERCLIP_BASE_URL: z
    .string()
    .url("PAPERCLIP_BASE_URL must be a valid absolute URL.")
    .default(DEFAULT_BASE_URL),
});

export interface RuntimeConfig {
  paperclipBaseUrl: string;
}

export function getRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  const parsed = runtimeConfigSchema.parse({
    PAPERCLIP_BASE_URL: env.PAPERCLIP_BASE_URL ?? DEFAULT_BASE_URL,
  });

  return {
    paperclipBaseUrl: parsed.PAPERCLIP_BASE_URL.replace(/\/+$/, ""),
  };
}
