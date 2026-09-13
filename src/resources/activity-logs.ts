/**
 * Activity logs resource operations
 */

import type { HttpClient } from '../http.js';
import type { ResolvedConfig } from '../config.js';
import { createPaginatedIterable, type PaginatedIterable } from '../pagination.js';
import type { ActivityLog, ActivityLogParams, ActivityLogsResponse } from '../types/activity-logs.js';

/**
 * Activity logs resource operations
 *
 * Note: the API paginates activity logs via the `nextPageUrl`/`searchAfter`
 * cursor returned in `pageDetails`, not a simple page number — `listAll()`
 * follows that cursor automatically, but requesting a specific `page` number
 * directly (e.g. via `list({ page: 2 })`) may not behave as expected since
 * the API does not paginate this resource by page number.
 */
export class ActivityLogsResource {
  private readonly httpClient: HttpClient;
  private readonly config: ResolvedConfig;

  constructor(httpClient: HttpClient, config: ResolvedConfig) {
    this.httpClient = httpClient;
    this.config = config;
  }

  /**
   * List activity logs
   */
  async list(params?: ActivityLogParams): Promise<ActivityLogsResponse> {
    const queryParams: Record<string, string | number | undefined> = {};

    if (params) {
      if (params.page !== undefined) queryParams['page'] = params.page;
      if (params.max !== undefined) queryParams['max'] = params.max;
      if (params.categories !== undefined) queryParams['categories'] = params.categories;
      if (params.actions !== undefined) queryParams['actions'] = params.actions;
      if (params.entities !== undefined) queryParams['entities'] = params.entities;
    }

    return this.httpClient.request<ActivityLogsResponse>('/activity-logs', {
      params: queryParams,
    });
  }

  /**
   * List all activity logs with automatic pagination
   *
   * Follows the `nextPageUrl`/`searchAfter` cursor in `pageDetails` rather
   * than a page number, since that is how this resource actually paginates.
   */
  listAll(params?: ActivityLogParams): PaginatedIterable<ActivityLog> {
    return createPaginatedIterable<ActivityLog>(
      this.httpClient,
      this.config.apiUrl,
      '/activity-logs',
      'activities',
      { page: params?.page, max: params?.max },
      {
        categories: params?.categories,
        actions: params?.actions,
        entities: params?.entities,
      }
    );
  }
}
