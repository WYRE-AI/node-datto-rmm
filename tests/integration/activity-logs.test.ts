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
      expect(response.activities[0]?.activityType).toBe('device.alert.resolved');
    });

    it('should include user information', async () => {
      const response = await client.activityLogs.list();

      expect(response.activities[0]?.user).toBe('admin@testmsp.com');
      expect(response.activities[0]?.userEmail).toBe('admin@testmsp.com');
    });

    it('should include device information when applicable', async () => {
      const response = await client.activityLogs.list();

      expect(response.activities[0]?.deviceUid).toBe('device-uid-001');
      expect(response.activities[0]?.deviceHostname).toBe('DESKTOP-001');
    });

    it('should send the categories filter and return only matching entries', async () => {
      const response = await client.activityLogs.list({ categories: 'job' });

      expect(response.activities).toHaveLength(1);
      expect(response.activities.every((activity) => activity.category === 'job')).toBe(true);
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
  });
});
