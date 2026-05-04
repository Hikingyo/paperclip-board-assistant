import { logger } from "../logging/logger.js";
import { API_ERROR_CODES, failure, type Result, statusToErrorCode, success } from "./errors.js";
import { ApiPaths, type SearchParams } from "./paths.js";

/**
 * HTTP request options for PaperclipApiClient
 */
interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

/**
 * Centralized HTTP client for Paperclip API interactions
 * Handles error responses, logging, and type safety
 */
export class PaperclipApiClient {
  constructor(readonly baseUrl: string) {
    logger.debug("Initializing PaperclipApiClient", { baseUrl });
  }

  /**
   * Execute a GET request
   */
  async get<T>(path: string, options?: Omit<FetchOptions, "method" | "body">): Promise<Result<T>> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  /**
   * Execute a POST request
   */
  async post<T>(
    path: string,
    body?: unknown,
    options?: Omit<FetchOptions, "method">,
  ): Promise<Result<T>> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  /**
   * Execute a PUT request
   */
  async put<T>(
    path: string,
    body?: unknown,
    options?: Omit<FetchOptions, "method">,
  ): Promise<Result<T>> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  /**
   * Execute a DELETE request
   */
  async delete<T>(
    path: string,
    options?: Omit<FetchOptions, "method" | "body">,
  ): Promise<Result<T>> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  /**
   * Execute a generic request with full error handling
   */
  private async request<T>(path: string, options: FetchOptions): Promise<Result<T>> {
    const method = options.method || "GET";
    const url = `${this.baseUrl}${path}`;

    logger.debug("API request", { method, url });

    try {
      const controller = new AbortController();
      const timeoutId =
        options.timeout && options.timeout > 0
          ? setTimeout(() => controller.abort(), options.timeout)
          : undefined;

      const fetchOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        signal: controller.signal,
      };

      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, fetchOptions);

      if (timeoutId) clearTimeout(timeoutId);

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        logger.warn("Non-JSON response from API", {
          status: response.status,
          contentType,
          url,
        });
        return failure(
          `API returned non-JSON response (${response.status})`,
          statusToErrorCode(response.status),
          response.status,
          { responseBody: text },
        );
      }

      const data = (await response.json()) as unknown;

      if (!response.ok) {
        logger.warn("API error response", {
          status: response.status,
          url,
          data,
        });
        return failure(
          `API request failed: ${response.status}`,
          statusToErrorCode(response.status),
          response.status,
          { responseData: data },
        );
      }

      logger.debug("API response success", { status: response.status, url });
      return success(data as T);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        logger.error("API request timeout", { url, method });
        return failure(`API request timeout: ${url}`, API_ERROR_CODES.NETWORK, undefined, {
          originalError: error.message,
        });
      }

      if (error instanceof Error) {
        logger.error("API request failed", {
          url,
          method,
          error: error.message,
        });
        return failure(`Network error: ${error.message}`, API_ERROR_CODES.NETWORK, undefined, {
          originalError: error.message,
        });
      }

      logger.error("Unexpected API error", { url, method, error });
      return failure(`Unexpected error during API request`, API_ERROR_CODES.UNKNOWN, undefined, {
        originalError: String(error),
      });
    }
  }

  /**
   * Build a URL with query parameters
   */
  buildUrl(path: string, params?: SearchParams): string {
    if (!params || Object.keys(params).length === 0) {
      return path;
    }

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        query.append(key, String(value));
      }
    }

    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}${query.toString()}`;
  }

  /**
   * Get a typed API path
   */
  static paths = ApiPaths;
}

export default PaperclipApiClient;
