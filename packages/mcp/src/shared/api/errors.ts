/**
 * API Error handling with discriminated unions
 * Provides type-safe error handling with exhaustive pattern matching
 */

/**
 * Error codes for API failures
 */
export const API_ERROR_CODES = {
  NETWORK: "NETWORK",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION: "VALIDATION",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN: "UNKNOWN",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

/**
 * Comprehensive error type for Paperclip API interactions
 */
export class PaperclipApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number | undefined;
  public readonly details: Record<string, unknown> | undefined;
  public readonly timestamp = new Date().toISOString();

  constructor(
    message: string,
    code: ApiErrorCode,
    statusCode?: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "PaperclipApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintain proper prototype chain for instanceof
    Object.setPrototypeOf(this, PaperclipApiError.prototype);
  }

  override toString(): string {
    return `[${this.code}] ${this.message}${this.statusCode ? ` (${this.statusCode})` : ""}`;
  }
}

/**
 * Result type for operations that can fail
 * Discriminated union for type-safe error handling
 */
export type Result<T> = SuccessResult<T> | ErrorResult;

export interface SuccessResult<T> {
  readonly ok: true;
  readonly value: T;
}

export interface ErrorResult {
  readonly ok: false;
  readonly error: PaperclipApiError;
}

/**
 * Helper to create success results
 */
export function success<T>(value: T): SuccessResult<T> {
  return { ok: true, value };
}

/**
 * Helper to create error results
 */
export function failure(
  message: string,
  code: ApiErrorCode,
  statusCode?: number,
  details?: Record<string, unknown>,
): ErrorResult {
  return {
    ok: false,
    error: new PaperclipApiError(message, code, statusCode, details),
  };
}

/**
 * Helper to map results
 */
export function mapResult<T, U>(result: Result<T>, fn: (value: T) => U): Result<U> {
  if (result.ok) {
    return success(fn(result.value));
  }
  return result;
}

/**
 * Helper to chain results
 */
export function flatMapResult<T, U>(result: Result<T>, fn: (value: T) => Result<U>): Result<U> {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
}

/**
 * Helper to convert HTTP status code to API error code
 */
export function statusToErrorCode(status: number): ApiErrorCode {
  switch (true) {
    case status === 401:
      return "UNAUTHORIZED";
    case status === 403:
      return "FORBIDDEN";
    case status === 404:
      return "NOT_FOUND";
    case status >= 400 && status < 500:
      return "VALIDATION";
    case status >= 500:
      return "SERVER_ERROR";
    default:
      return "UNKNOWN";
  }
}
