/**
 * Activity logs fixtures
 *
 * Entry shape follows the Datto RMM `/activity-logs` response as modelled by
 * the DattoRMM.Core client (not live-verified per field).
 */

export const list = {
  pageDetails: {
    count: 2,
    page: 1,
    prevPageUrl: null,
    nextPageUrl: null,
  },
  activities: [
    {
      id: 'activity-001',
      entity: 'USER',
      category: 'account',
      action: 'login',
      date: 1706745600,
      site: { id: 1001, name: 'Headquarters' },
      user: { id: 42, userName: 'admin@testmsp.com', firstName: 'Ada', lastName: 'Admin' },
      details: '{"ip":"192.168.1.100"}',
      hasStdOut: false,
      hasStdErr: false,
    },
    {
      id: 'activity-002',
      entity: 'DEVICE',
      category: 'job',
      action: 'deployment',
      date: 1706745120,
      site: { id: 1001, name: 'Headquarters' },
      deviceId: 555,
      hostname: 'DESKTOP-001',
      user: { id: 42, userName: 'admin@testmsp.com' },
      details: { jobUid: 'job-uid-001', exitCode: 0 },
      hasStdOut: true,
      hasStdErr: false,
    },
  ],
};
