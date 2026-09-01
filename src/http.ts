/**
 * HTTP layer for the Datto RMM API
 */

import type { ResolvedConfig } from './config.js';
import type { AuthManager } from './auth.js';
import type { RateLimiter } from './rate-limiter.js';
import {
  DattoRmmError,
  DattoRmmAuthenticationError,
  DattoRmmNotFoundError,
  DattoRmmRateLimitError,
  DattoRmmIpBlockedError,
  DattoRmmForbiddenError,
  DattoRmmServerError,
} from './errors.js';

/**
 * HTTP request options
 */
export interface RequestOptions {
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Request body (will be JSON stringified) */
  body?: unknown;
  /** URL query parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Skip authentication (for token endpoint) */
  skipAuth?: boolean;
}

/**
 * HTTP client for making authenticated requests to the Datto RMM API
 */
export class HttpClient {
  private readonly config: ResolvedConfig;
  private readonly authManager: AuthManager;
  private readonly rateLimiter: RateLimiter;

  constructor(config: ResolvedConfig, authManager: AuthManager, rateLimiter: RateLimiter) {
    this.config = config;
    this.authManager = authManager;
    this.rateLimiter = rateLimiter;
  }

  /**
   * Make an authenticated request to the API
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, params, skipAuth = false } = options;

    // Build the URL
    let url = `${this.config.apiUrl}/api/v2${path}`;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.executeRequest<T>(url, method, body, skipAuth);
  }

  /**
   * Make a request to a full URL (for pagination)
   */
  async requestUrl<T>(url: string): Promise<T> {
    return this.executeRequest<T>(url, 'GET', undefined, false);
  }

  /**
   * Execute the request with retry logic
   */
  private async executeRequest<T>(
    url: string,
    method: string,
    body: unknown,
    skipAuth: boolean,
    retryCount: number = 0,
    isRetryAfter401: boolean = false
  ): Promise<T> {
    // Wait for a rate limit slot
    await this.rateLimiter.waitForSlot();

    // Get the auth token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (!skipAuth) {
      const token = await this.authManager.getToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Record the request
    this.rateLimiter.recordRequest();

    // Make the request
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle the response
    return this.handleResponse<T>(response, url, method, body, skipAuth, retryCount, isRetryAfter401);
  }

  /**
   * Handle the response and errors
   */
  private async handleResponse<T>(
    response: Response,
    url: string,
    method: string,
    body: unknown,
    skipAuth: boolean,
    retryCount: number,
    isRetryAfter401: boolean
  ): Promise<T> {
    // Read the body EXACTLY once, as text, for every path. A fetch Response
    // body is a one-shot stream: response.json() followed by response.text()
    // in a catch throws "Body is unusable: Body has already been read",
    // which masked the real (often non-JSON, e.g. WAF/proxy HTML) response
    // (connectwise-automate-mcp#54).
    const rawBody = await response.text();
    let parsedBody: unknown;
    let bodyIsJson = false;
    try {
      parsedBody = JSON.parse(rawBody);
      bodyIsJson = true;
    } catch {
      parsedBody = rawBody;
    }

    if (response.ok) {
      if (bodyIsJson) {
        return parsedBody as T;
      }
      if (rawBody.trim() === '') {
        // Genuinely empty 200/204 — preserve the historical empty-object shape.
        return {} as T;
      }
      // A 200 whose body isn't JSON is not a success we can use (login pages,
      // WAF challenges, proxy errors). Surfacing it beats returning {} and
      // letting the caller believe the API answered.
      throw new DattoRmmError(
        `Expected JSON from ${method} ${url} but got ${
          response.headers.get('content-type') ?? 'no content-type'
        }: ${rawBody.slice(0, 200)}`,
        response.status,
        rawBody.slice(0, 2000)
      );
    }

    const responseBody: unknown = parsedBody;
    const detail = this.summarizeBody(responseBody);

    switch (response.status) {
      case 400:
        throw new DattoRmmAuthenticationError(
          `Bad request (400) - invalid credentials or parameters: ${detail}`,
          400,
          responseBody
        );

      case 401:
        // If this is already a retry after 401, don't retry again
        if (isRetryAfter401) {
          throw new DattoRmmAuthenticationError(
            `Authentication failed after token refresh (401): ${detail}`,
            401,
            responseBody
          );
        }
        // Try to refresh the token and retry once
        await this.authManager.refreshToken();
        return this.executeRequest<T>(url, method, body, skipAuth, retryCount, true);

      case 403:
        // Distinguish between IP block (rate limit) and permission denied
        // IP blocks typically happen after persistent 429s
        if (this.isIpBlockResponse(responseBody)) {
          this.rateLimiter.handleIpBlock();
          throw new DattoRmmIpBlockedError(
            `IP has been blocked due to rate limit violations: ${detail}`,
            this.config.rateLimit.ipBlockCooldownMs,
            responseBody
          );
        }
        // Datto's own reason (wrong platform/region, missing scope, suspended
        // account, ...) lives in `detail` — a bare "Access forbidden" hides
        // exactly the information needed to tell those causes apart (the gap
        // that stalled the Zinfandel-platform investigation, msg-1788213394271).
        throw new DattoRmmForbiddenError(`Access forbidden (403): ${detail}`, responseBody);

      case 404:
        throw new DattoRmmNotFoundError(`Resource not found (404): ${detail}`, responseBody);

      case 429:
        // Rate limited - retry with backoff
        if (this.rateLimiter.shouldRetry(retryCount)) {
          const delay = this.rateLimiter.calculateRetryDelay(retryCount);
          this.rateLimiter.handleRateLimitError(retryCount);
          await this.sleep(delay);
          return this.executeRequest<T>(url, method, body, skipAuth, retryCount + 1, isRetryAfter401);
        }
        throw new DattoRmmRateLimitError(
          `Rate limit exceeded and max retries reached (429): ${detail}`,
          this.config.rateLimit.retryAfterMs,
          responseBody
        );

      default:
        if (response.status >= 500) {
          // Server error - retry once
          if (retryCount === 0) {
            await this.sleep(1000);
            return this.executeRequest<T>(url, method, body, skipAuth, 1, isRetryAfter401);
          }
          throw new DattoRmmServerError(
            `Server error: ${response.status} ${response.statusText}: ${detail}`,
            response.status,
            responseBody
          );
        }
        throw new DattoRmmError(
          `Request failed: ${response.status} ${response.statusText}: ${detail}`,
          response.status,
          responseBody
        );
    }
  }

  /**
   * Best-effort extraction of a human-readable detail from an error response
   * body, for embedding directly in thrown error `.message` strings. Callers
   * that only surface `error.message` (rather than the typed error's
   * `.response`) still see Datto's real reported reason instead of a generic
   * per-status label — same class of gap as connectwise-automate-mcp#54,
   * where a swallowed body hid the actual cause from the caller.
   */
  private summarizeBody(body: unknown): string {
    if (typeof body === 'string') {
      const trimmed = body.trim();
      return trimmed ? trimmed.slice(0, 500) : '(empty body)';
    }
    if (body && typeof body === 'object') {
      const obj = body as Record<string, unknown>;
      const message = obj.message ?? obj.error ?? obj.error_description ?? obj.detail;
      if (typeof message === 'string' && message.trim()) {
        return message.trim().slice(0, 500);
      }
      try {
        return JSON.stringify(body).slice(0, 500);
      } catch {
        return '(unserializable body)';
      }
    }
    return '(empty body)';
  }

  /**
   * Check if a 403 response indicates an IP block
   */
  private isIpBlockResponse(responseBody: unknown): boolean {
    // Datto RMM typically returns specific error messages for IP blocks
    // This is a heuristic check
    if (typeof responseBody === 'object' && responseBody !== null) {
      const body = responseBody as Record<string, unknown>;
      const message = body['message'] ?? body['error'] ?? '';
      if (typeof message === 'string') {
        return message.toLowerCase().includes('rate') || message.toLowerCase().includes('blocked');
      }
    }
    return false;
  }

  /**
   * Sleep for a given duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
