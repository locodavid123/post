import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, _resetRateLimitStore } from './rateLimit';
import { validateAdminSecret } from './auth';

describe('Rate Limiter in memory', () => {
  beforeEach(() => {
    _resetRateLimitStore();
  });

  it('allows up to 10 requests within window and blocks the 11th', () => {
    const testIp = '192.168.1.100';

    for (let i = 1; i <= 10; i++) {
      const result = checkRateLimit(testIp, 10, 15 * 60 * 1000);
      expect(result.allowed).toBe(true);
      expect(result.count).toBe(i);
      expect(result.remaining).toBe(10 - i);
    }

    // 11th request must be blocked
    const blocked = checkRateLimit(testIp, 10, 15 * 60 * 1000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('keeps track of different IPs independently', () => {
    const ip1 = '10.0.0.1';
    const ip2 = '10.0.0.2';

    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip1, 10, 15 * 60 * 1000);
    }

    expect(checkRateLimit(ip1, 10, 15 * 60 * 1000).allowed).toBe(false);
    expect(checkRateLimit(ip2, 10, 15 * 60 * 1000).allowed).toBe(true);
  });
});

describe('ADMIN_SECRET validation in backend', () => {
  it('returns true when provided secret matches server secret', () => {
    process.env.ADMIN_SECRET = 'mi-clave-super-secreta';
    expect(validateAdminSecret('mi-clave-super-secreta')).toBe(true);
  });

  it('returns false when provided secret does not match or is empty/undefined', () => {
    process.env.ADMIN_SECRET = 'mi-clave-super-secreta';
    expect(validateAdminSecret('clave-errada')).toBe(false);
    expect(validateAdminSecret('')).toBe(false);
    expect(validateAdminSecret(undefined)).toBe(false);
    expect(validateAdminSecret(null)).toBe(false);
  });

  it('returns false if server ADMIN_SECRET is not configured', () => {
    delete process.env.ADMIN_SECRET;
    expect(validateAdminSecret('cualquier-clave')).toBe(false);
  });
});
