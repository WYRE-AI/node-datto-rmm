/**
 * Activity log types
 */

import type { Uid, PageDetails } from './common.js';

/**
 * Activity log entry
 */
export interface ActivityLog {
  /** Activity log unique identifier */
  id: Uid;
  /** Activity type */
  activityType: string;
  /** Activity category */
  category?: string;
  /** Activity description */
  description?: string;
  /** User who performed the activity */
  user?: string;
  /** User email */
  userEmail?: string;
  /** Device UID (if applicable) */
  deviceUid?: Uid;
  /** Device hostname (if applicable) */
  deviceHostname?: string;
  /** Site UID (if applicable) */
  siteUid?: Uid;
  /** Site name (if applicable) */
  siteName?: string;
  /** Source IP address */
  sourceIp?: string;
  /** Activity timestamp */
  timestamp: number;
  /** Additional details */
  details?: Record<string, unknown>;
}

/**
 * Activity log list parameters
 *
 * Note (verified against the live API on 2026-09-14): `startDate`, `endDate`,
 * `activityType`, `user`, `siteUid` and `deviceUid` are NOT supported by the
 * API — it silently ignores them and returns the same unfiltered result set
 * regardless of their value, so they have been removed. `categories`,
 * `actions` and `entities` are the only filters the API actually honours.
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
