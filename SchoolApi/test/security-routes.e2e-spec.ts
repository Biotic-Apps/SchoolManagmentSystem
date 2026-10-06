import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { listRoutes } from './support/route-inventory';
import { createTestApp } from './support/test-app';

/**
 * Route inventory (security.md §2): no decorator = any authenticated user,
 * so each of these must check access in its service. Adding a route without
 * @RequirePermission (or a new @Public route) fails this test until it is
 * reviewed and listed here with the place that enforces access.
 */
const AUTHENTICATED_ONLY: Record<string, string> = {
  'DELETE /auth/sessions/:id': 'own sessions only (SessionsService, userId)',
  'GET /auth/2fa': 'caller own 2FA status',
  'GET /auth/sessions': 'caller own sessions',
  'GET /documents':
    'DocumentsService: owner resolver checks <module>.view + scope / guardian link (404)',
  'GET /files/:id/url': 'FilesService.canSharePurpose: purpose-based authz',
  'GET /jobs/:id': 'JobsController: requestedById = caller, else 404',
  'GET /leave': 'LeaveService: own requests, or approver scope',
  'GET /me': 'caller own profile',
  'GET /notifications': 'caller own inbox',
  'GET /notifications/preferences': 'caller own preferences',
  'GET /notifications/unread-count': 'caller own inbox',
  'GET /staff-attendance/me': 'caller own staff record',
  'PATCH /me': 'caller own profile (UpdateMeDto whitelist)',
  'POST /auth/2fa/disable': 'caller; password/TOTP re-check',
  'POST /auth/2fa/enable': 'caller; TOTP code check',
  'POST /auth/2fa/recovery-codes/regenerate': 'caller; TOTP code check',
  'POST /auth/2fa/setup': 'caller own secret',
  'POST /auth/logout': 'caller own session',
  'POST /auth/logout-all': 'caller own sessions',
  'POST /auth/password/change': 'caller; current password required',
  'POST /complaints': 'ComplaintsService: guardian link / own branch check',
  'POST /complaints/:id/close': 'ComplaintActions: complainant or principal',
  'POST /complaints/:id/escalate': 'ComplaintActions.assertParty',
  'POST /complaints/:id/reopen': 'ComplaintActions: complainant only',
  'POST /complaints/:id/updates': 'ComplaintActions.assertParty',
  'POST /devices': 'caller own device token',
  'POST /documents':
    'DocumentsService: <module>.edit on owner + scope, file owned by caller',
  'POST /documents/:id/reject':
    'DocumentsService: owner module .edit permission',
  'POST /documents/:id/verify':
    'DocumentsService: owner module .edit permission',
  'POST /files': 'FilesService: purpose allow-list, owner = caller',
  'POST /leave': 'LeaveService: own leave / guardian link for student leave',
  'POST /leave/:id/approve': 'LeaveService: approver role + not own request',
  'POST /leave/:id/cancel': 'LeaveService: requester only',
  'POST /leave/:id/reject': 'LeaveService: approver role + not own request',
  'POST /notifications/:id/read': 'caller own notification',
  'POST /notifications/read-all': 'caller own inbox',
  'PUT /notifications/preferences': 'caller own preferences',
};

const PUBLIC: Record<string, string> = {
  'GET /backups/:id/content': 'HMAC-signed short-lived URL (exp, sig)',
  'GET /branding': 'school name/logo/colours for the login screen',
  'GET /certificates/verify/:serial': 'public verification, @AuthThrottle',
  'GET /files/:id/content': 'HMAC-signed 5-minute URL (exp, sig)',
  'GET /health': 'liveness/readiness, no data',
  'POST /auth/2fa/verify': 'second factor of login, @AuthThrottle',
  'POST /auth/login': '@AuthThrottle + per-account lockout',
  'POST /auth/password/forgot': '@AuthThrottle, no user enumeration',
  'POST /auth/password/reset': '@AuthThrottle, single-use hashed token',
  'POST /auth/refresh': '@AuthThrottle, rotation + reuse detection',
  'POST /payments/online/callback/:gateway':
    'gateway adapter verifies the signature (MANUAL never accepts)',
};

describe('Security: route inventory (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists every authenticated-only route (no @RequirePermission)', () => {
    const found = listRoutes(app)
      .filter((r) => !r.isPublic && r.permissions.length === 0)
      .map((r) => r.key)
      .sort();
    expect(found).toEqual(Object.keys(AUTHENTICATED_ONLY).sort());
  });

  it('lists every @Public route', () => {
    const found = listRoutes(app)
      .filter((r) => r.isPublic)
      .map((r) => r.key)
      .sort();
    expect(found).toEqual(Object.keys(PUBLIC).sort());
  });
});
