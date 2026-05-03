/**
 * Pagination strategy adapter for flexible API pagination handling
 * Supports different pagination styles (offset/limit, cursor, etc.)
 */

import type { PaginatedResult } from "../../types.js";

/**
 * Pagination request configuration
 */
export interface PaginationRequest {
  limit?: number;
  offset?: number;
}

/**
 * Strategy interface for different pagination approaches
 */
export interface PaginationStrategy {
  /**
   * Apply pagination parameters to a fetch request
   */
  applyPaginationParams(url: string, pagination: PaginationRequest): string;

  /**
   * Parse pagination metadata from response
   */
  parsePaginationMeta(
    items: unknown[],
    response: unknown,
    pagination: PaginationRequest,
  ): {
    offset: number;
    has_more: boolean;
    next_offset?: number | undefined;
  };
}

/**
 * Offset/Limit pagination strategy
 * Used when API supports ?offset=X&limit=Y query parameters
 */
export class OffsetLimitPaginationStrategy implements PaginationStrategy {
  applyPaginationParams(url: string, pagination: PaginationRequest): string {
    const params = new URLSearchParams();

    if (pagination.limit) {
      params.append("limit", pagination.limit.toString());
    }
    if (pagination.offset) {
      params.append("offset", pagination.offset.toString());
    }

    const separator = url.includes("?") ? "&" : "?";
    return params.toString() ? `${url}${separator}${params.toString()}` : url;
  }

  parsePaginationMeta(
    items: unknown[],
    _response: unknown,
    pagination: PaginationRequest,
  ): { offset: number; has_more: boolean; next_offset?: number | undefined } {
    const offset = pagination.offset ?? 0;
    const limit = pagination.limit ?? items.length;
    const has_more = items.length >= limit;
    const next_offset = has_more ? offset + limit : undefined;

    return {
      offset,
      has_more,
      ...(next_offset !== undefined && { next_offset }),
    };
  }
}

/**
 * Client-side pagination helper (for APIs that return full datasets)
 * This is the current Paperclip behavior
 */
export class ClientSidePaginationStrategy implements PaginationStrategy {
  applyPaginationParams(url: string, _pagination: PaginationRequest): string {
    // Client-side doesn't modify the request
    return url;
  }

  parsePaginationMeta(
    items: unknown[],
    _response: unknown,
    pagination: PaginationRequest,
  ): { offset: number; has_more: boolean; next_offset?: number | undefined } {
    const offset = pagination.offset ?? 0;
    const limit = pagination.limit ?? 20;
    const _paginatedItems = items.slice(offset, offset + limit);
    const has_more = offset + limit < items.length;
    const next_offset = has_more ? offset + limit : undefined;

    return {
      offset,
      has_more,
      ...(next_offset !== undefined && { next_offset }),
    };
  }
}

/**
 * Pagination helper to slice and prepare paginated results
 */
export function paginate<T>(
  items: T[],
  limit: number = 20,
  offset: number = 0,
): PaginatedResult<T> {
  const paginatedItems = items.slice(offset, offset + limit);
  const hasMore = offset + limit < items.length;

  return {
    items: paginatedItems,
    total: items.length,
    count: paginatedItems.length,
    offset,
    has_more: hasMore,
    ...(hasMore && { next_offset: offset + limit }),
  };
}
