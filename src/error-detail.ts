/**
 * Best-effort extraction of a human-readable detail from an error response
 * body, for embedding directly in thrown error `.message` strings. Callers
 * that only surface `error.message` (rather than a typed error's `.response`)
 * still see Datto's real reported reason instead of a generic per-status
 * label — same class of gap as connectwise-automate-mcp#54, where a
 * swallowed body hid the actual cause from the caller. Shared by the
 * resource-call error path (http.ts) and the OAuth token-acquisition error
 * path (auth.ts), which independently hit the identical gap.
 */
export function summarizeErrorBody(body: unknown): string {
  if (typeof body === 'string') {
    const trimmed = body.trim();
    return trimmed ? trimmed.slice(0, 500) : '(empty body)';
  }
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    // OAuth2 error responses (RFC 6749 §5.2 — e.g. a password-grant
    // rejected as invalid_grant) carry a short `error` code plus a longer
    // `error_description`. Combine both when present rather than picking
    // just the terser code.
    const code = typeof obj.error === 'string' ? obj.error : undefined;
    const description =
      typeof obj.error_description === 'string' ? obj.error_description : undefined;
    if (code && description) {
      return `${code}: ${description}`.slice(0, 500);
    }
    const message = obj.message ?? code ?? description ?? obj.detail;
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
