import { afterEach, describe, expect, it, vi } from "vitest";

import { PaperclipApiClient } from "../src/shared/api/client.js";

describe("PaperclipApiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns success result for JSON 200 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const client = new PaperclipApiClient("http://127.0.0.1:3100");
    const result = await client.get<{ status: string }>("/api/health");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toMatchObject({ status: "ok" });
    }
  });

  it("returns failure result for 500 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "boom" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const client = new PaperclipApiClient("http://127.0.0.1:3100");
    const result = await client.get("/api/health");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("SERVER_ERROR");
    }
  });

  it("returns failure result for non-JSON response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html>not found</html>", {
          status: 404,
          headers: { "content-type": "text/html" },
        }),
      ),
    );

    const client = new PaperclipApiClient("http://127.0.0.1:3100");
    const result = await client.get("/api/missing");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });

  it("exposes baseUrl as readonly", () => {
    const client = new PaperclipApiClient("http://example.com");
    expect(client.baseUrl).toBe("http://example.com");
  });
});
