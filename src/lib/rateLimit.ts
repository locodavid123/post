/**
 * Rate Limiter básico en memoria por IP.
 * Configuración: Máximo 10 intentos cada 15 minutos (900.000 ms).
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Limpieza periódica cada 5 minutos de registros expirados para no consumir memoria innecesaria
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();
}

/**
 * Extrae la IP del cliente a partir de los encabezados de la solicitud.
 */
export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  return '127.0.0.1';
}

export interface RateLimitCheckResult {
  allowed: boolean;
  count: number;
  remaining: number;
  retryAfterSeconds: number;
  resetTime: number;
}

/**
 * Evalúa si una clave (ej. IP o endpoint:IP) excede el límite de intentos en memoria.
 * @param key Identificador único del cliente (ej: `login:192.168.1.10`)
 * @param maxAttempts Máximo número de intentos (por defecto 10)
 * @param windowMs Ventana de tiempo en milisegundos (por defecto 15 minutos = 900.000 ms)
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 15 * 60 * 1000
): RateLimitCheckResult {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    memoryStore.set(key, newRecord);
    return {
      allowed: true,
      count: 1,
      remaining: maxAttempts - 1,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
      resetTime: newRecord.resetTime,
    };
  }

  record.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));

  if (record.count > maxAttempts) {
    return {
      allowed: false,
      count: record.count,
      remaining: 0,
      retryAfterSeconds,
      resetTime: record.resetTime,
    };
  }

  return {
    allowed: true,
    count: record.count,
    remaining: Math.max(0, maxAttempts - record.count),
    retryAfterSeconds,
    resetTime: record.resetTime,
  };
}

/**
 * Genera una respuesta estándar HTTP 429 Too Many Requests.
 */
export function createRateLimitResponse(result: RateLimitCheckResult): Response {
  return new Response(
    JSON.stringify({
      message: 'Demasiados intentos de autenticación. Por seguridad, por favor intenta nuevamente en 15 minutos.',
      error: 'too_many_requests',
      retryAfterSeconds: result.retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfterSeconds),
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
      },
    }
  );
}

// Para uso en pruebas unitarias si se requiere reiniciar la memoria
export function _resetRateLimitStore() {
  memoryStore.clear();
}
