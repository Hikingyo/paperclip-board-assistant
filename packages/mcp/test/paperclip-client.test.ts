import { afterEach, describe, expect, it, vi } from "vitest";

import { type PaperclipApiError, PaperclipClient } from "../src/services/paperclip-client.js";

describe("PaperclipClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed JSON for successful requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const client = new PaperclipClient("http://127.0.0.1:3100/");
    await expect(client.getHealth()).resolves.toMatchObject({ status: "ok" });
    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:3100/api/health", {
      headers: { Accept: "application/json" },
    });
  });

  it("raises a PaperclipApiError for HTTP failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "boom" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    const client = new PaperclipClient();

    await expect(client.getProfile()).rejects.toMatchObject<PaperclipApiError>({
      name: "PaperclipApiError",
      path: "/api/auth/profile",
      status: 500,
    });
  });

  it("raises a PaperclipApiError when the endpoint does not return JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html>wrong</html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        }),
      ),
    );

    const client = new PaperclipClient();

    await expect(client.listPlugins()).rejects.toThrow("did not return JSON");
  });
});
