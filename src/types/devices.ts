/**
 * Device types
 */

import type { PageDetails, Uid, DeviceType, OperatingSystemFamily } from './common.js';
import type { Alert } from './alerts.js';

/**
 * Device information
 */
export interface Device {
  /** Device unique identifier */
  uid: Uid;
  /** Device numeric ID */
  id: number;
  /** Site UID the device belongs to */
  siteUid: Uid;
  /** Site name */
  siteName?: string;
  /** Device hostname */
  hostname: string;
  /** Device description */
  description?: string;
  /** Device type */
  deviceType: DeviceType;
  /** Operating system name */
  operatingSystem?: string;
  /** Operating system family */
  operatingSystemFamily?: OperatingSystemFamily;
  /** Operating system version */
  operatingSystemVersion?: string;
  /** Whether the device is online */
  isOnline: boolean;
  /** Last seen timestamp */
  lastSeenAt?: number;
  /** Last audit timestamp */
  lastAuditAt?: number;
  /** IP addresses */
  ipAddresses?: string[];
  /** MAC addresses */
  macAddresses?: string[];
  /** Serial number */
  serialNumber?: string;
  /** Manufacturer */
  manufacturer?: string;
  /** Model */
  model?: string;
  /** Number of open alerts */
  openAlerts?: number;
  /** User-defined fields (UDF1-UDF30) */
  udf?: Record<string, string>;
  /** Agent version */
  agentVersion?: string;
  /** Device creation timestamp */
  createdAt?: number;
  /** Last modification timestamp */
  modifiedAt?: number;
  /** Domain name */
  domain?: string;
  /** Current logged in user */
  loggedInUser?: string;
  /** Warranty expiration date */
  warrantyExpiry?: number;
  /** Reboot required */
  rebootRequired?: boolean;
}

/**
 * A single variable passed to a quick job component
 */
export interface QuickJobVariable {
  /** Variable name */
  name: string;
  /** Variable value */
  value: string;
}

/**
 * Component to run as part of a quick job
 */
export interface QuickJobComponent {
  /** Component UID to run */
  componentUid: Uid;
  /** Variables to pass to the component */
  variables?: QuickJobVariable[];
}

/**
 * Quick job creation request
 *
 * Note: the API requires `componentUid`/`variables` nested under
 * `jobComponent`, with `variables` as an array of `{ name, value }` pairs.
 * A flat body (componentUid/variables at the top level, variables as a
 * map) is rejected with HTTP 400 `{"errorMessage":"Failed to read request"}`.
 */
export interface QuickJobRequest {
  /** Job name */
  jobName: string;
  /** Component to run and its variables */
  jobComponent: QuickJobComponent;
}

/**
 * Quick job creation response
 */
export interface QuickJobResponse {
  /** Created job UID */
  uid: Uid;
  /** Job name */
  name: string;
  /** Job status */
  status: string;
}

/**
 * User-defined field update request
 */
export interface UdfUpdateRequest {
  /** UDF values (udf1-udf30) */
  [key: string]: string | undefined;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  udf6?: string;
  udf7?: string;
  udf8?: string;
  udf9?: string;
  udf10?: string;
  udf11?: string;
  udf12?: string;
  udf13?: string;
  udf14?: string;
  udf15?: string;
  udf16?: string;
  udf17?: string;
  udf18?: string;
  udf19?: string;
  udf20?: string;
  udf21?: string;
  udf22?: string;
  udf23?: string;
  udf24?: string;
  udf25?: string;
  udf26?: string;
  udf27?: string;
  udf28?: string;
  udf29?: string;
  udf30?: string;
}

/**
 * Warranty update request
 */
export interface WarrantyUpdateRequest {
  /** Warranty expiration date (Unix timestamp ms or ISO string) */
  warrantyExpiry: number | string;
  /** Warranty notes */
  warrantyNotes?: string;
}

/**
 * Response for device details
 */
export interface DeviceResponse {
  /** Device data */
  device: Device;
}

/**
 * Response for device alerts
 */
export interface DeviceAlertsResponse {
  /** Page details */
  pageDetails: PageDetails;
  /** List of alerts */
  alerts: Alert[];
}

/**
 * Response for device move operation
 */
export interface DeviceMoveResponse {
  /** Device UID */
  deviceUid: Uid;
  /** New site UID */
  siteUid: Uid;
  /** Success status */
  success: boolean;
}

/**
 * Response for UDF update
 */
export interface UdfUpdateResponse {
  /** Device UID */
  deviceUid: Uid;
  /** Updated UDF values */
  udf: Record<string, string>;
}

/**
 * Response for warranty update
 */
export interface WarrantyUpdateResponse {
  /** Device UID */
  deviceUid: Uid;
  /** Warranty expiration date */
  warrantyExpiry?: number;
  /** Warranty notes */
  warrantyNotes?: string;
}
