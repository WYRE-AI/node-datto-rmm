/**
 * Activity log types
 */

import type { Uid, PageDetails } from './common.js';

/**
 * Site reference embedded in an activity log entry
 */
export interface ActivityLogSite {
  /** Numeric site id (NOT the site UID) */
  id: number;
  /** Site name */
  name?: string;
}

/**
 * User reference embedded in an activity log entry
 */
export interface ActivityLogUser {
  /** Numeric user id */
  id: number;
  /** Username (login) */
  userName?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Activity log entry
 *
 * Field names follow the Datto RMM API v2 `/activity-logs` response as
 * modelled by the DattoRMM.Core client (id, entity, category, action, date,
 * site, deviceId, hostname, user, details, hasStdOut, hasStdErr). Only
 * `activities` and `pageDetails` have been confirmed against a live tenant;
 * the per-entry fields below are NOT live-verified, so every one is optional.
 */
export interface ActivityLog {
  /** Activity log unique identifier */
  id?: string;
  /** Entity type, e.g. `DEVICE` or `USER` */
  entity?: string;
  /** Category, e.g. `job`, `patch`, `remote`, `account` */
  category?: string;
  /** Action within the category, e.g. `create`, `login` */
  action?: string;
  /** When the activity occurred: epoch seconds or milliseconds, or an ISO string */
  date?: number | string;
  /** Site the activity relates to */
  site?: ActivityLogSite;
  /** Numeric device id, when the activity relates to a device */
  deviceId?: number;
  /** Device hostname, when the activity relates to a device */
  hostname?: string;
  /** User who performed the activity */
  user?: ActivityLogUser;
  /** Free-form details; the API may return this as a JSON string or an object */
  details?: Record<string, unknown> | string;
  /** Whether stdout output is attached to the entry */
  hasStdOut?: boolean;
  /** Whether stderr output is attached to the entry */
  hasStdErr?: boolean;
  /** @deprecated Not returned by the API; use `category` and `action`. */
  activityType?: string;
  /** @deprecated Not returned by the API; use `date`. */
  timestamp?: number;
  /** @deprecated Not returned by the API; use `details`. */
  description?: string;
  /** @deprecated Not returned by the API; use `user`. */
  userEmail?: string;
  /** @deprecated Not returned by the API; use `deviceId`. */
  deviceUid?: Uid;
  /** @deprecated Not returned by the API; use `hostname`. */
  deviceHostname?: string;
  /** @deprecated Not returned by the API; use `site`. */
  siteUid?: Uid;
  /** @deprecated Not returned by the API; use `site.name`. */
  siteName?: string;
  /** @deprecated Not returned by the API. */
  sourceIp?: string;
}

/**
 * Activity log list parameters
 *
 * Verified against the live API on 2026-09-14: `categories`, `actions` and
 * `entities` filter results; `startDate`, `endDate`, `activityType`, `user`,
 * `siteUid` and `deviceUid` are silently ignored (and were removed).
 *
 * The remaining parameters (`from`, `until`, `siteIds`, `userIds`, `order`,
 * `size`, `searchAfter`, `searchQuery`) are the ones documented for
 * `GET /v2/activity-logs` and used by the DattoRMM.Core client. They have NOT
 * been verified against a live tenant here; confirm they take effect before
 * relying on them. Note that the API identifies sites and users by numeric
 * id in this endpoint, not by UID.
 */
export interface ActivityLogParams {
  /** Page number */
  page?: number;
  /** Maximum results per page */
  max?: number;
  /** Filter by category. Accepts a comma-separated list (e.g. `'job,patch'`). Verified 2026-09-14. */
  categories?: string;
  /** Filter by action. Accepts a comma-separated list (e.g. `'create,update'`). Verified 2026-09-14. */
  actions?: string;
  /** Filter by entity type. Accepts a comma-separated list (e.g. `'USER,DEVICE'`). Verified 2026-09-14. */
  entities?: string;
  /** Start of the time range, ISO 8601 UTC (e.g. `2026-10-11T00:00:00Z`). Not live-verified. */
  from?: string;
  /** End of the time range, ISO 8601 UTC. Not live-verified. */
  until?: string;
  /** Restrict to numeric site ids; comma-separated string or array. Not live-verified. */
  siteIds?: string | number | Array<string | number>;
  /** Restrict to numeric user ids; comma-separated string or array (up to 750). Not live-verified. */
  userIds?: string | number | Array<string | number>;
  /** Sort by creation date. Not live-verified. */
  order?: 'asc' | 'desc';
  /** Page size (documented max 250). Not live-verified. */
  size?: number;
  /** Cursor from a previous response's `nextPageUrl`. */
  searchAfter?: string;
  /** Lucene-style search expression, as in the Activity Log UI search bar. Not live-verified. */
  searchQuery?: string;
}

/**
 * Response for activity logs list
 */
export interface ActivityLogsResponse {
  /** Page details */
  pageDetails: PageDetails;
  /** List of activity logs */
  activities: ActivityLog[];
}
