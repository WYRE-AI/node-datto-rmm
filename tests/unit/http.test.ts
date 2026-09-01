/**
 * HttpClient response-handling tests.
 *
 * Regression: connectwise-automate-mcp#54 — every API-backed tool returned an
 * empty object (200 with a non-JSON body was swallowed as `{}`), and repeat
 * calls threw "Body is unusable: Body has already been read" (the error path
 * consumed the body with response.json() and then re-read it with
 * response.text() in the catch). The body must be read exactly once.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient } from '../../src/http.js';
import { AuthManager } from '../../src/auth.js';
import { RateLimiter } from '../../src/rate-limiter.js';
import {
  DattoRmmError,
  DattoRmmForbiddenError,
  DattoRmmNotFoundError,
  DattoRmmServerError,
} from '../../src/errors.js';
import { DEFAULT_RATE_LIMIT_CONFIG, type ResolvedConfig } from '../../src/config.js';

const config: ResolvedConfig = {
  apiUrl: 'https://merlot-api.centrastage.net',
  apiKey: 'test-api-key',
  apiSecretKey: 'test-api-secret',
  timestamps: 'date',
  rateLimit: { ...DEFAULT_RATE_LIMIT_CONFIG },
};

function makeClient(): HttpClient {
  const auth = {
    getToken: vi.fn().mockResolvedValue('test-token'),
    refreshToken: vi.fn().mockResolvedValue('test-token'),
  } as unknown as AuthManager;
  const limiter = new RateLimiter(config.rateLimit);
  return new HttpClient(config, auth, limiter);
}

/** A real Response so body semantics (one-shot stream) are exercised. */
function realResponse(body: string, init: ResponseInit = {}): Response {
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

describe('HttpClient response handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses a JSON 200 response', async () => {
    vi.mocked(fetch).mockResolvedValue(realResponse('[{"uid":"abc"}]'));
    const result = await makeClient().request('/account/sites');
    expect(result).toEqual([{ uid: 'abc' }]);
  });

  it('parses JSON even when the content-type header is wrong', async () => {
    vi.mocked(fetch).mockResolvedValue(
      realResponse('{"uid":"abc"}', { headers: { 'content-type': 'text/plain' } })
    );
    const result = await makeClient().request('/site/abc');
    expect(result).toEqual({ uid: 'abc' });
  });

  it('returns {} for a genuinely empty 200/204 body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      realResponse('', { status: 200, headers: { 'content-type': 'text/plain' } })
    );
    const result = await makeClient().request('/device/abc/quickjob', { method: 'PUT' });
    expect(result).toEqual({});
  });

  it('throws a descriptive error (not {}) for a 200 with a non-JSON body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      realResponse('<html>WAF challenge page</html>', {
        headers: { 'content-type': 'text/html' },
      })
    );
    await expect(makeClient().request('/account/sites')).rejects.toThrow(
      /Expected JSON .* text\/html.*WAF challenge page/
    );
  });

  it('reads a non-JSON error body exactly once — no "Body is unusable"', async () => {
    vi.mocked(fetch).mockResolvedValue(
      realResponse('<html>gateway error</html>', {
        status: 404,
        headers: { 'content-type': 'text/html' },
      })
    );
    // Before the fix this threw TypeError "Body is unusable: Body has already
    // been read" instead of the typed not-found error carrying the real body.
    const err = await makeClient()
      .request('/site/missing')
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DattoRmmNotFoundError);
    expect((err as DattoRmmNotFoundError).response).toContain('gateway error');
  });

  it('passes a parsed JSON error body to the typed error', async () => {
    // 5xx retries once, then throws — both responses must be fresh.
    vi.mocked(fetch).mockResolvedValueOnce(realResponse('{"message":"boom"}', { status: 503 }));
    vi.mocked(fetch).mockResolvedValueOnce(realResponse('{"message":"boom"}', { status: 503 }));
    const err = await makeClient()
      .request('/account/sites')
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DattoRmmServerError);
    expect((err as DattoRmmServerError).response).toEqual({ message: 'boom' });
  }, 15000);

  it('generic non-2xx statuses raise DattoRmmError with the raw body', async () => {
    vi.mocked(fetch).mockResolvedValue(
      realResponse('teapot', { status: 418, headers: { 'content-type': 'text/plain' } })
    );
    const err = await makeClient()
      .request('/account/sites')
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DattoRmmError);
    expect((err as DattoRmmError).response).toBe('teapot');
  });

  describe('403 detail surfacing (regression: Zinfandel-platform investigation)', () => {
    // A bare "Access forbidden" — the pre-fix message — hid whether Datto
    // returned a permission-denied, wrong-platform, or account-suspended
    // reason. Callers that only read `.message` (not the typed error's
    // `.response`) need Datto's real reason inline.

    it('embeds the JSON body\'s `message` field in the thrown error message', async () => {
      vi.mocked(fetch).mockResolvedValue(
        realResponse(JSON.stringify({ message: 'Account is suspended' }), { status: 403 })
      );
      const err = await makeClient()
        .request('/account/sites')
        .catch((e: unknown) => e);
      expect(err).toBeInstanceOf(DattoRmmForbiddenError);
      expect((err as DattoRmmForbiddenError).message).toContain('Account is suspended');
      expect((err as DattoRmmForbiddenError).message).toContain('403');
    });

    it('falls back to a JSON dump when the body has no message/error/detail field', async () => {
      vi.mocked(fetch).mockResolvedValue(
        realResponse(JSON.stringify({ code: 'PLATFORM_MISMATCH' }), { status: 403 })
      );
      const err = await makeClient()
        .request('/account/sites')
        .catch((e: unknown) => e);
      expect(err).toBeInstanceOf(DattoRmmForbiddenError);
      expect((err as DattoRmmForbiddenError).message).toContain('PLATFORM_MISMATCH');
    });

    it('embeds a non-JSON error body verbatim (truncated)', async () => {
      vi.mocked(fetch).mockResolvedValue(
        realResponse('Forbidden by upstream WAF', {
          status: 403,
          headers: { 'content-type': 'text/plain' },
        })
      );
      const err = await makeClient()
        .request('/account/sites')
        .catch((e: unknown) => e);
      expect(err).toBeInstanceOf(DattoRmmForbiddenError);
      expect((err as DattoRmmForbiddenError).message).toContain('Forbidden by upstream WAF');
    });

    it('still classifies an IP-block 403 as DattoRmmIpBlockedError, not ForbiddenError', async () => {
      vi.mocked(fetch).mockResolvedValue(
        realResponse(JSON.stringify({ message: 'Your IP has been blocked due to rate limits' }), {
          status: 403,
        })
      );
      const err = await makeClient()
        .request('/account/sites')
        .catch((e: unknown) => e);
      expect(err).not.toBeInstanceOf(DattoRmmForbiddenError);
      expect((err as { name: string }).name).toBe('DattoRmmIpBlockedError');
    });
  });
});
