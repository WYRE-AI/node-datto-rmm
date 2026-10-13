/**
 * Activity logs resource operations
 */

import type { HttpClient } from '../http.js';
import type { ResolvedConfig } from '../config.js';
import { createPaginatedIterable, type PaginatedIterable } from '../pagination.js';
import type { ActivityLog, ActivityLogParams, ActivityLogsResponse } from '../types/activity-logs.js';

/** Join an id list (or pass a scalar through) into the comma-separated form the API expects. */
function joinIds(value: string | number | Array<string | number> | undefined): string | number | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.length > 0 ? value.join(',') : undefined;
  return value;
}

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
      if (params.from !== undefined) queryParams['from'] = params.from;
      if (params.until !== undefined) queryParams['until'] = params.until;
      if (params.order !== undefined) queryParams['order'] = params.order;
      if (params.size !== undefined) queryParams['size'] = params.size;
      if (params.searchAfter !== undefined) queryParams['searchAfter'] = params.searchAfter;
      if (params.searchQuery !== undefined) queryParams['searchQuery'] = params.searchQuery;
      const siteIds = joinIds(params.siteIds);
      if (siteIds !== undefined) queryParams['siteIds'] = siteIds;
      const userIds = joinIds(params.userIds);
      if (userIds !== undefined) queryParams['userIds'] = userIds;
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
        from: params?.from,
        until: params?.until,
        order: params?.order,
        size: params?.size,
        searchAfter: params?.searchAfter,
        searchQuery: params?.searchQuery,
        siteIds: joinIds(params?.siteIds),
        userIds: joinIds(params?.userIds),
      }
    );
  }
}
