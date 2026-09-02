/**
 * Authentication tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server.js';
import { AuthManager } from '../../src/auth.js';
import { DattoRmmAuthenticationError } from '../../src/errors.js';
import type { ResolvedConfig } from '../../src/config.js';

describe('AuthManager', () => {
  let config: ResolvedConfig;
  let authManager: AuthManager;

  beforeEach(() => {
    config = {
      apiKey: 'test-api-key',
      apiSecretKey: 'test-api-secret',
      apiUrl: 'https://merlot-api.centrastage.net',
      timestamps: 'date',
      rateLimit: {
        enabled: true,
        maxRequests: 600,
        windowMs: 60000,
        throttleThreshold: 0.8,
        retryAfterMs: 5000,
        maxRetries: 3,
        ipBlockCooldownMs: 300000,
      },
    };
    authManager = new AuthManager(config);
  });

  describe('getToken', () => {
    it('should acquire a new token successfully', async () => {
      const token = await authManager.getToken();

      expect(token).toBe('mock-jwt-token-for-testing');
    });

    it('should return cached token on subsequent calls', async () => {
      const token1 = await authManager.getToken();
      const token2 = await authManager.getToken();

      expect(token1).toBe('mock-jwt-token-for-testing');
      expect(token2).toBe('mock-jwt-token-for-testing');
    });

    it('should throw error on bad credentials', async () => {
      // Override the handler for this test
      server.use(
        http.post('https://merlot-api.centrastage.net/auth/oauth/token', () => {
          return HttpResponse.json(
            { error: 'invalid_grant', error_description: 'Bad credentials' },
            { status: 400 }
          );
        })
      );

      await expect(authManager.getToken()).rejects.toThrow(DattoRmmAuthenticationError);
    });

    it('embeds the real OAuth error (RFC 6749 invalid_grant) in the message, not just the status', async () => {
      // Regression: a bare "Failed to acquire token: 400 Bad Request" hid
      // whether Datto rejected the key/secret pair (invalid_grant) or the
      // request shape itself — the same diagnosability gap fixed in http.ts.
      server.use(
        http.post('https://merlot-api.centrastage.net/auth/oauth/token', () => {
          return HttpResponse.json(
            { error: 'invalid_grant', error_description: 'Bad credentials' },
            { status: 400 }
          );
        })
      );

      const err = await authManager.getToken().catch((e: unknown) => e);
      expect(err).toBeInstanceOf(DattoRmmAuthenticationError);
      expect((err as DattoRmmAuthenticationError).message).toContain('invalid_grant');
      expect((err as DattoRmmAuthenticationError).message).toContain('Bad credentials');
      expect((err as DattoRmmAuthenticationError).message).toContain('400');
    });
  });

  describe('refreshToken', () => {
    it('should get a new token', async () => {
      const token1 = await authManager.getToken();
      authManager.invalidateToken();
      const token2 = await authManager.refreshToken();

      expect(token1).toBe('mock-jwt-token-for-testing');
      expect(token2).toBe('mock-jwt-token-for-testing');
    });
  });

  describe('invalidateToken', () => {
    it('should clear the cached token', async () => {
      await authManager.getToken();
      expect(authManager.hasValidToken()).toBe(true);

      authManager.invalidateToken();
      expect(authManager.hasValidToken()).toBe(false);
    });
  });

  describe('hasValidToken', () => {
    it('should return false when no token', () => {
      expect(authManager.hasValidToken()).toBe(false);
    });

    it('should return true after token acquisition', async () => {
      await authManager.getToken();
      expect(authManager.hasValidToken()).toBe(true);
    });

    it('should return false after invalidation', async () => {
      await authManager.getToken();
      authManager.invalidateToken();
      expect(authManager.hasValidToken()).toBe(false);
    });
  });

  describe('concurrent token requests', () => {
    it('should handle concurrent getToken calls', async () => {
      // Make concurrent calls - they should all get the same token
      const [token1, token2, token3] = await Promise.all([
        authManager.getToken(),
        authManager.getToken(),
        authManager.getToken(),
      ]);

      expect(token1).toBe('mock-jwt-token-for-testing');
      expect(token2).toBe('mock-jwt-token-for-testing');
      expect(token3).toBe('mock-jwt-token-for-testing');
    });
  });
});
