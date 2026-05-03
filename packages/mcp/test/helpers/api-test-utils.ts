import { describe, expect, it } from "vitest";
import type { Result } from "../api/errors.js";

/**
 * Test utilities for Result type handling
 */

export function expectSuccess<T>(result: Result<T>): T {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error(`Expected success result but got error: ${result.error.message}`);
  }
  return result.value;
}

export function expectFailure<T>(result: Result<T>): Error {
  expect(result.ok).toBe(false);
  if (result.ok) {
    throw new Error(`Expected failure result but got success: ${String(result.value)}`);
  }
  return result.error;
}

/**
 * Mock fetch helper for testing API calls
 */
export function createMockFetch(
  responses: Map<string, { status: number; data?: unknown; contentType?: string }>,
) {
  return vi.fn(async (url: string) => {
    const key = new URL(url, "http://localhost").pathname + new URL(url, "http://localhost").search;
    const config = responses.get(key);

    if (!config) {
      return new Response("Not Found", { status: 404 });
    }

    const headers = new Headers();
    if (config.contentType) {
      headers.set("content-type", config.contentType);
    } else {
      headers.set("content-type", "application/json");
    }

    const body = config.data ? JSON.stringify(config.data) : null;
    return new Response(body, {
      status: config.status,
      headers,
    });
  });
}

/**
 * Test suite helper for API client testing
 */
export function describeApiClient(name: string, fn: () => void) {
  describe(`API Client: ${name}`, fn);
}

export function itMakesRequest(
  description: string,
  fn: (helpers: {
    expectSuccess: typeof expectSuccess;
    expectFailure: typeof expectFailure;
  }) => Promise<void> | void,
) {
  it(description, fn);
}

export const testHelpers = {
  expectSuccess,
  expectFailure,
  createMockFetch,
  describeApiClient,
  itMakesRequest,
};

export default testHelpers;
