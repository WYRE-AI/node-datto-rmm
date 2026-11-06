/**
 * Activity logs resource integration tests
 */

import { describe, it, expect } from 'vitest';
import { DattoRmmClient } from '../../src/client.js';

describe('Activity Logs Resource', () => {
  const client = new DattoRmmClient({
    apiKey: 'test-api-key',
    apiSecretKey: 'test-api-secret',
    platform: 'merlot',
  });

  describe('list', () => {
    it('should list activity logs', async () => {
      const response = await client.activityLogs.list();

      expect(response.pageDetails).toBeDefined();
      expect(response.activities).toHaveLength(2);
      expect(response.activities[0]?.category).toBe('account');
      expect(response.activities[0]?.action).toBe('login');
    });

    it('should include user, site and device information', async () => {
      const response = await client.activityLogs.list({ order: 'asc' });

      expect(response.activities[0]?.hostname).toBe('DESKTOP-001');
      expect(response.activities[0]?.deviceId).toBe(555);
      expect(response.activities[1]?.user?.userName).toBe('admin@testmsp.com');
      expect(response.activities[1]?.site?.id).toBe(1001);
    });

    it('should send the categories filter and return only matching entries', async () => {
      const response = await client.activityLogs.list({ categories: 'job' });

      expect(response.activities).toHaveLength(1);
      expect(response.activities.every((activity) => activity.category === 'job')).toBe(true);
    });

    it('should send from/until as query parameters', async () => {
      const response = await client.activityLogs.list({
        from: '2024-01-31T23:50:00Z',
        until: '2024-01-31T23:55:00Z',
      });
      expect(response.activities.map((a) => a.id)).toEqual(['activity-002']);
    });

    it('should join array siteIds into a comma-separated list', async () => {
      const response = await client.activityLogs.list({ siteIds: [1001, 2002] });
      expect(response.activities).toHaveLength(2);

      const none = await client.activityLogs.list({ siteIds: [2002] });
      expect(none.activities).toHaveLength(0);
    });

    it('should send order', async () => {
      const asc = await client.activityLogs.list({ order: 'asc' });
      const desc = await client.activityLogs.list({ order: 'desc' });

      expect(asc.activities.map((a) => a.id)).toEqual(['activity-002', 'activity-001']);
      expect(desc.activities.map((a) => a.id)).toEqual(['activity-001', 'activity-002']);
    });
  });

  describe('listAll', () => {
    it('should yield every activity across pages', async () => {
      const activities = await client.activityLogs.listAll().toArray();

      expect(activities).toHaveLength(2);
    });

    it('should carry filters onto the first request, not just list()', async () => {
      // Regression guard: listAll() previously forwarded only page/max, so a
      // caller passing categories got unfiltered results while believing they
      // had filtered.
      const activities = await client.activityLogs.listAll({ categories: 'job' }).toArray();

      expect(activities).toHaveLength(1);
      expect(activities.every((activity) => activity.category === 'job')).toBe(true);
    });

    it('should carry the time range, siteIds and order onto the first request', async () => {
      const activities = await client.activityLogs
        .listAll({ siteIds: [2002], from: '2024-01-01T00:00:00Z' })
        .toArray();
      expect(activities).toHaveLength(0);

      const ordered = await client.activityLogs.listAll({ order: 'asc' }).toArray();
      expect(ordered.map((a) => a.id)).toEqual(['activity-002', 'activity-001']);
    });
  });
});
