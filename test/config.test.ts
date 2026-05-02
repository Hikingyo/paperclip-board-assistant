import { describe, expect, it } from "vitest";

import { getRuntimeConfig } from "../src/config.js";

describe("getRuntimeConfig", () => {
  it("uses the default Paperclip base URL when no env is provided", () => {
    expect(getRuntimeConfig({}).paperclipBaseUrl).toBe("http://127.0.0.1:3100");
  });

  it("normalizes trailing slashes", () => {
    expect(
      getRuntimeConfig({
        PAPERCLIP_BASE_URL: "http://127.0.0.1:3100///",
      }).paperclipBaseUrl,
    ).toBe("http://127.0.0.1:3100");
  });

  it("rejects invalid absolute URLs", () => {
    expect(() =>
      getRuntimeConfig({
        PAPERCLIP_BASE_URL: "not-a-url",
      }),
    ).toThrow("PAPERCLIP_BASE_URL must be a valid absolute URL.");
  });
});
