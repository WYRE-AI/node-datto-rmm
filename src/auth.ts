/**
 * OAuth 2.0 token management for Datto RMM API
 */

import type { ResolvedConfig } from './config.js';
import { DattoRmmAuthenticationError } from './errors.js';
import { summarizeErrorBody } from './error-detail.js';

/**
 * Token information
 */
export interface TokenInfo {
  /** Access token */
  accessToken: string;
  /** Token type (usually 'bearer') */
  tokenType: string;
  /** Unix timestamp (milliseconds) when the token expires */
  expiresAt: number;
}

/**
 * OAuth token response from the API
 */
interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Buffer time before expiry to trigger refresh (5 minutes in milliseconds)
 */
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

/**
 * Manages OAuth 2.0 token lifecycle for the Datto RMM API
 */
export class AuthManager {
  private readonly config: ResolvedConfig;
  private token: TokenInfo | null = null;
  private refreshPromise: Promise<TokenInfo> | null = null;

  constructor(config: ResolvedConfig) {
    this.config = config;
  }

  /**
   * Get a valid access token, acquiring or refreshing as needed
   */
  async getToken(): Promise<string> {
    // If we have a valid token that's not near expiry, return it
    if (this.token && !this.isTokenNearExpiry(this.token)) {
      return this.token.accessToken;
    }

    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      const token = await this.refreshPromise;
      return token.accessToken;
    }

    // Acquire a new token
    const token = await this.acquireToken();
    return token.accessToken;
  }

  /**
   * Force a token refresh (e.g., after a 401 response)
   */
  async refreshToken(): Promise<string> {
    // Clear the current token
    this.token = null;

    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      const token = await this.refreshPromise;
      return token.accessToken;
    }

    // Acquire a new token
    const token = await this.acquireToken();
    return token.accessToken;
  }

  /**
   * Invalidate the current token
   */
  invalidateToken(): void {
    this.token = null;
  }

  /**
   * Check if the token is valid and not near expiry
   */
  hasValidToken(): boolean {
    return this.token !== null && !this.isTokenNearExpiry(this.token);
  }

  /**
   * Acquire a new token from the API
   */
  private async acquireToken(): Promise<TokenInfo> {
    // Set up the promise to prevent concurrent requests
    this.refreshPromise = this.doAcquireToken();

    try {
      const token = await this.refreshPromise;
      this.token = token;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token acquisition
   */
  private async doAcquireToken(): Promise<TokenInfo> {
    const tokenUrl = `${this.config.apiUrl}/auth/oauth/token`;

    // Build the request body
    const body = new URLSearchParams({
      grant_type: 'password',
      username: this.config.apiKey,
      password: this.config.apiSecretKey,
    });

    // Basic auth header for the token endpoint
    const basicAuth = Buffer.from('public-client:public').toString('base64');

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const rawBody = await response.text();
        let errorBody: unknown = rawBody;
        try {
          errorBody = JSON.parse(rawBody);
        } catch {
          // Not JSON — summarizeErrorBody handles the raw string directly.
        }
        // Datto's OAuth token endpoint reports the real reason (e.g. RFC
        // 6749 §5.2's invalid_grant for a bad key/secret pair) in the body,
        // which a bare "400 Bad Request" hides from any caller that only
        // reads `.message` instead of the typed error's `.response`.
        throw new DattoRmmAuthenticationError(
          `Failed to acquire token (${response.status}): ${summarizeErrorBody(errorBody)}`,
          response.status,
          errorBody
        );
      }

      const data = (await response.json()) as OAuthTokenResponse;

      // Calculate expiry time (expires_in is in seconds)
      const expiresAt = Date.now() + data.expires_in * 1000;

      return {
        accessToken: data.access_token,
        tokenType: data.token_type,
        expiresAt,
      };
    } catch (error) {
      if (error instanceof DattoRmmAuthenticationError) {
        throw error;
      }
      throw new DattoRmmAuthenticationError(
        `Failed to acquire token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        error
      );
    }
  }

  /**
   * Check if a token is within the expiry buffer
   */
  private isTokenNearExpiry(token: TokenInfo): boolean {
    return Date.now() >= token.expiresAt - EXPIRY_BUFFER_MS;
  }
}
