/**
 * Activity logs fixtures
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
      activityType: 'device.alert.resolved',
      category: 'alert',
      description: 'Alert resolved: Disk usage high',
      user: 'admin@testmsp.com',
      userEmail: 'admin@testmsp.com',
      deviceUid: 'device-uid-001',
      deviceHostname: 'DESKTOP-001',
      siteUid: 'site-uid-001',
      siteName: 'Headquarters',
      sourceIp: '192.168.1.100',
      timestamp: 1706745600000,
    },
    {
      id: 'activity-002',
      activityType: 'job.completed',
      category: 'job',
      description: 'Quick job completed: Restart Service',
      user: 'admin@testmsp.com',
      userEmail: 'admin@testmsp.com',
      deviceUid: 'device-uid-001',
      deviceHostname: 'DESKTOP-001',
      timestamp: 1706745120000,
      details: {
        jobUid: 'job-uid-001',
        exitCode: 0,
      },
    },
  ],
};
