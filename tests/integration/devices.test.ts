/**
 * Devices resource integration tests
 */

import { describe, it, expect } from 'vitest';
import { DattoRmmClient } from '../../src/client.js';
import type { QuickJobRequest } from '../../src/types/devices.js';

describe('Devices Resource', () => {
  const client = new DattoRmmClient({
    apiKey: 'test-api-key',
    apiSecretKey: 'test-api-secret',
    platform: 'merlot',
  });

  describe('get', () => {
    it('should get a device by UID', async () => {
      const device = await client.devices.get('device-uid-001');

      expect(device).toBeDefined();
      expect(device.uid).toBe('device-uid-001');
      expect(device.hostname).toBe('DESKTOP-001');
      expect(device.deviceType).toBe('desktop');
      expect(device.isOnline).toBe(true);
    });
  });

  describe('getById', () => {
    it('should get a device by numeric ID', async () => {
      const device = await client.devices.getById(1001);

      expect(device.uid).toBe('device-uid-001');
      expect(device.id).toBe(1001);
    });
  });

  describe('getByMac', () => {
    it('should get a device by MAC address', async () => {
      const device = await client.devices.getByMac('AA:BB:CC:DD:EE:01');

      expect(device.uid).toBe('device-uid-001');
      expect(device.macAddresses).toContain('AA:BB:CC:DD:EE:01');
    });
  });

  describe('alertsOpen', () => {
    it('should list open alerts for a device', async () => {
      const response = await client.devices.alertsOpen('device-uid-001');

      expect(response.alerts).toHaveLength(1);
      expect(response.alerts[0]?.priority).toBe('High');
    });
  });

  describe('move', () => {
    it('should move a device to another site', async () => {
      const result = await client.devices.move('device-uid-001', 'site-uid-002');

      expect(result.success).toBe(true);
      expect(result.siteUid).toBe('site-uid-002');
    });
  });

  describe('createQuickJob', () => {
    it('should create a quick job for a device', async () => {
      const job = await client.devices.createQuickJob('device-uid-001', {
        jobName: 'Restart Service',
        jobComponent: {
          componentUid: 'component-uid-001',
          variables: [{ name: 'serviceName', value: 'Spooler' }],
        },
      });

      expect(job.uid).toBe('job-uid-001');
      expect(job.status).toBe('active');
    });

    it('should reject a flat/legacy request body', async () => {
      // The API 400s a body that doesn't nest componentUid/variables under
      // jobComponent. Cast through unknown since the point is to prove the
      // runtime wire contract, not something the compiler would allow.
      const legacyBody = {
        jobName: 'Restart Service',
        componentUid: 'component-uid-001',
        variables: { serviceName: 'Spooler' },
      } as unknown as QuickJobRequest;

      await expect(client.devices.createQuickJob('device-uid-001', legacyBody)).rejects.toThrow(
        /Failed to read request/
      );
    });
  });

  describe('updateWarranty', () => {
    it('should update device warranty', async () => {
      const result = await client.devices.updateWarranty('device-uid-001', {
        warrantyExpiry: 1738368000000,
        warrantyNotes: 'Extended warranty',
      });

      expect(result.warrantyExpiry).toBe(1738368000000);
      expect(result.warrantyNotes).toBe('Extended warranty');
    });
  });

  describe('setUdf', () => {
    it('should set user-defined fields', async () => {
      const result = await client.devices.setUdf('device-uid-001', {
        udf1: 'Building A',
        udf2: 'Floor 3',
      });

      expect(result.udf.udf1).toBe('Building A');
      expect(result.udf.udf2).toBe('Floor 3');
    });
  });
});
