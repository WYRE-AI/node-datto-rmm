/**
 * MSW request handlers for mocking the Datto RMM API
 */

import { http, HttpResponse } from 'msw';
import * as fixtures from '../fixtures/index.js';

const BASE_URL = 'https://merlot-api.centrastage.net';
const API_BASE = `${BASE_URL}/api/v2`;

export const handlers = [
  // OAuth token endpoint
  http.post(`${BASE_URL}/auth/oauth/token`, async ({ request }) => {
    const body = await request.text();

    // Check for bad credentials
    if (body.includes('bad-api-key') || body.includes('bad-api-secret')) {
      return HttpResponse.json(
        { error: 'invalid_grant', error_description: 'Bad credentials' },
        { status: 400 }
      );
    }

    return HttpResponse.json(fixtures.auth.tokenSuccess);
  }),

  // Account endpoints
  http.get(`${API_BASE}/account`, () => {
    return HttpResponse.json(fixtures.account.data);
  }),

  http.get(`${API_BASE}/account/users`, () => {
    return HttpResponse.json(fixtures.account.users);
  }),

  http.get(`${API_BASE}/account/sites`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    if (page === '2') {
      return HttpResponse.json(fixtures.account.sitesPage2);
    }
    return HttpResponse.json(fixtures.account.sitesPage1);
  }),

  http.get(`${API_BASE}/account/devices`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    if (page === '2') {
      return HttpResponse.json(fixtures.account.devicesPage2);
    }
    return HttpResponse.json(fixtures.account.devicesPage1);
  }),

  http.get(`${API_BASE}/account/components`, () => {
    return HttpResponse.json(fixtures.account.components);
  }),

  http.get(`${API_BASE}/account/alerts/open`, () => {
    return HttpResponse.json(fixtures.account.alertsOpen);
  }),

  http.get(`${API_BASE}/account/alerts/resolved`, () => {
    return HttpResponse.json(fixtures.account.alertsResolved);
  }),

  http.get(`${API_BASE}/account/variables`, () => {
    return HttpResponse.json(fixtures.account.variables);
  }),

  http.put(`${API_BASE}/account/variable`, () => {
    return HttpResponse.json(fixtures.account.variableCreated);
  }),

  http.post(`${API_BASE}/account/variable/:variableId`, () => {
    return HttpResponse.json(fixtures.account.variableUpdated);
  }),

  http.delete(`${API_BASE}/account/variable/:variableId`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Site endpoints
  http.put(`${API_BASE}/site`, () => {
    return HttpResponse.json(fixtures.sites.created);
  }),

  http.get(`${API_BASE}/site/:siteUid`, () => {
    return HttpResponse.json(fixtures.sites.get);
  }),

  http.post(`${API_BASE}/site/:siteUid`, () => {
    return HttpResponse.json(fixtures.sites.updated);
  }),

  http.get(`${API_BASE}/site/:siteUid/devices`, () => {
    return HttpResponse.json(fixtures.sites.devices);
  }),

  http.get(`${API_BASE}/site/:siteUid/settings`, () => {
    return HttpResponse.json(fixtures.sites.settings);
  }),

  http.get(`${API_BASE}/site/:siteUid/filters`, () => {
    return HttpResponse.json(fixtures.sites.filters);
  }),

  http.get(`${API_BASE}/site/:siteUid/alerts/open`, () => {
    return HttpResponse.json(fixtures.sites.alertsOpen);
  }),

  http.get(`${API_BASE}/site/:siteUid/alerts/resolved`, () => {
    return HttpResponse.json(fixtures.sites.alertsResolved);
  }),

  http.get(`${API_BASE}/site/:siteUid/variables`, () => {
    return HttpResponse.json(fixtures.sites.variables);
  }),

  // Device endpoints
  http.get(`${API_BASE}/device/:deviceUid`, () => {
    return HttpResponse.json(fixtures.devices.getByUid);
  }),

  http.get(`${API_BASE}/device/id/:deviceId`, () => {
    return HttpResponse.json(fixtures.devices.getById);
  }),

  http.get(`${API_BASE}/device/macAddress/:macAddress`, () => {
    return HttpResponse.json(fixtures.devices.getByMac);
  }),

  http.get(`${API_BASE}/device/:deviceUid/alerts/open`, () => {
    return HttpResponse.json(fixtures.devices.alertsOpen);
  }),

  http.put(`${API_BASE}/device/:deviceUid/site/:siteUid`, () => {
    return HttpResponse.json(fixtures.devices.moved);
  }),

  http.put(`${API_BASE}/device/:deviceUid/quickjob`, async ({ request }) => {
    const body = (await request.json()) as {
      jobComponent?: { componentUid?: unknown; variables?: unknown };
    };

    const jobComponent = body.jobComponent;
    const variablesAreValid = jobComponent?.variables === undefined || Array.isArray(jobComponent.variables);

    if (!jobComponent || !jobComponent.componentUid || !variablesAreValid) {
      return HttpResponse.json({ errorMessage: 'Failed to read request' }, { status: 400 });
    }

    return HttpResponse.json(fixtures.devices.quickJobCreated);
  }),

  http.post(`${API_BASE}/device/:deviceUid/warranty`, () => {
    return HttpResponse.json(fixtures.devices.warrantyUpdated);
  }),

  http.post(`${API_BASE}/device/:deviceUid/udf`, () => {
    return HttpResponse.json(fixtures.devices.udfUpdated);
  }),

  // Alert endpoints
  http.get(`${API_BASE}/alert/:alertUid`, () => {
    return HttpResponse.json(fixtures.alerts.get);
  }),

  http.post(`${API_BASE}/alert/:alertUid/resolve`, () => {
    return HttpResponse.json(fixtures.alerts.resolved);
  }),

  http.post(`${API_BASE}/alert/:alertUid/mute`, () => {
    return HttpResponse.json(fixtures.alerts.muted);
  }),

  http.post(`${API_BASE}/alert/:alertUid/unmute`, () => {
    return HttpResponse.json(fixtures.alerts.unmuted);
  }),

  // Audit endpoints
  http.get(`${API_BASE}/audit/device/:deviceUid`, () => {
    return HttpResponse.json(fixtures.audit.device);
  }),

  http.get(`${API_BASE}/audit/device/:deviceUid/software`, () => {
    return HttpResponse.json(fixtures.audit.deviceSoftware);
  }),

  http.get(`${API_BASE}/audit/device/macAddress/:macAddress`, () => {
    return HttpResponse.json(fixtures.audit.device);
  }),

  http.get(`${API_BASE}/audit/esxihost/:deviceUid`, () => {
    return HttpResponse.json(fixtures.audit.esxihost);
  }),

  http.get(`${API_BASE}/audit/printer/:deviceUid`, () => {
    return HttpResponse.json(fixtures.audit.printer);
  }),

  // Job endpoints
  http.get(`${API_BASE}/job/:jobUid`, () => {
    return HttpResponse.json(fixtures.jobs.get);
  }),

  http.get(`${API_BASE}/job/:jobUid/results/:deviceUid`, () => {
    return HttpResponse.json(fixtures.jobs.results);
  }),

  http.get(`${API_BASE}/job/:jobUid/results/:deviceUid/stdout`, () => {
    return HttpResponse.json(fixtures.jobs.stdout);
  }),

  http.get(`${API_BASE}/job/:jobUid/results/:deviceUid/stderr`, () => {
    return HttpResponse.json(fixtures.jobs.stderr);
  }),

  http.get(`${API_BASE}/job/:jobUid/components`, () => {
    return HttpResponse.json(fixtures.jobs.components);
  }),

  // Filter endpoints
  http.get(`${API_BASE}/filter/default-filters`, () => {
    return HttpResponse.json(fixtures.filters.defaults);
  }),

  http.get(`${API_BASE}/filter/custom-filters`, () => {
    return HttpResponse.json(fixtures.filters.custom);
  }),

  // System endpoints
  http.get(`${API_BASE}/system/status`, () => {
    return HttpResponse.json(fixtures.system.status);
  }),

  http.get(`${API_BASE}/system/request_rate`, () => {
    return HttpResponse.json(fixtures.system.requestRate);
  }),

  http.get(`${API_BASE}/system/pagination`, () => {
    return HttpResponse.json(fixtures.system.pagination);
  }),

  // User endpoints
  http.post(`${API_BASE}/user/resetApiKeys`, () => {
    return HttpResponse.json(fixtures.users.resetApiKeys);
  }),

  // Activity logs
  http.get(`${API_BASE}/activity-logs`, () => {
    return HttpResponse.json(fixtures.activityLogs.list);
  }),

  // Rate limit test endpoint
  http.get(`${API_BASE}/rate-limited`, () => {
    return HttpResponse.json(
      { error: 'rate_limit_exceeded' },
      { status: 429 }
    );
  }),

  // IP block test endpoint
  http.get(`${API_BASE}/ip-blocked`, () => {
    return HttpResponse.json(
      { error: 'rate_limit_blocked', message: 'IP has been blocked due to rate limit violations' },
      { status: 403 }
    );
  }),
];
