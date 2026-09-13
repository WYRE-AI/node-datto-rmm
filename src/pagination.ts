/**
 * Pagination utilities for the Datto RMM API
 */

import type { HttpClient } from './http.js';
import type { PaginatedResponse } from './types/common.js';

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page?: number;
  /** Maximum results per page (max 250) */
  max?: number;
}

/**
 * Async iterable wrapper for paginated results
 */
export class PaginatedIterable<T> implements AsyncIterable<T> {
  private readonly httpClient: HttpClient;
  private readonly initialUrl: string;
  private readonly itemsKey: string;

  constructor(httpClient: HttpClient, initialUrl: string, itemsKey: string) {
    this.httpClient = httpClient;
    this.initialUrl = initialUrl;
    this.itemsKey = itemsKey;
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    let nextUrl: string | null = this.initialUrl;

    while (nextUrl) {
      const response: PaginatedResponse<T> = await this.httpClient.requestUrl<PaginatedResponse<T>>(nextUrl);
      const items = (response as Record<string, unknown>)[this.itemsKey] as T[] | undefined;

      if (items) {
        for (const item of items) {
          yield item;
        }
      }

      // Get the next page URL
      nextUrl = response.pageDetails?.nextPageUrl ?? null;
    }
  }

  /**
   * Collect all items into an array
   */
  async toArray(): Promise<T[]> {
    const items: T[] = [];
    for await (const item of this) {
      items.push(item);
    }
    return items;
  }
}

/**
 * Build pagination query parameters
 */
export function buildPaginationParams(params?: PaginationParams): Record<string, string | number | undefined> {
  if (!params) {
    return {};
  }
  return {
    page: params.page,
    max: params.max,
  };
}

/**
 * Create a paginated iterable for a resource
 */
export function createPaginatedIterable<T>(
  httpClient: HttpClient,
  baseUrl: string,
  path: string,
  itemsKey: string,
  params?: PaginationParams,
  filters?: Record<string, string | number | undefined>
): PaginatedIterable<T> {
  // Build the initial URL with parameters
  let url = `${baseUrl}/api/v2${path}`;
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.append('page', String(params.page));
  }
  if (params?.max) {
    searchParams.append('max', String(params.max));
  }

  // Resource-specific filters (e.g. activity-log categories) must reach the
  // first request. Subsequent pages carry them automatically, since the API
  // echoes them back in nextPageUrl. Without this, listAll() would silently
  // return unfiltered results while appearing to filter.
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
  }

  const queryString = searchParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  return new PaginatedIterable<T>(httpClient, url, itemsKey);
}
