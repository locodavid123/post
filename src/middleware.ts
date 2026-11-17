import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

// Base64URL decoder compatible with Edge Runtime
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

function base64UrlToUint8Array(str: string): Uint8Array {
  const binary = base64UrlDecode(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

interface JWTPayload {
  id?: string;
  role?: string;
  businessId?: string | null;
  exp?: number;
  [key: string]: any;
}

// Edge Runtime-compatible JWT verification using Web Crypto API
async function verifyTokenEdge(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlToUint8Array(signatureB64);

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature as unknown as BufferSource,
      data as unknown as BufferSource
    );
    if (!isValid) return null;

    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadB64));

    // Expiration check
    if (payload.exp && typeof payload.exp === 'number') {
      if (Date.now() >= payload.exp * 1000) {
        return null;
      }
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const payload = token ? await verifyTokenEdge(token, JWT_SECRET) : null;
  const isAuthenticated = Boolean(payload && payload.id);
  const isAdmin = payload?.role === 'ADMIN' || payload?.role === 'SUPERADMIN';

  // 1. Redirecciones si ya está autenticado e intenta ir a login o registro
  if (pathname === '/login' || pathname === '/register') {
    if (isAuthenticated) {
      const redirectUrl = isAdmin
        ? new URL('/admin', request.url)
        : new URL('/client/mesas', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // 2. Protección de rutas de SuperAdmin (/admin/:path*)
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Usuario autenticado pero sin rol de administrador
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/client/mesas', request.url));
    }

    return NextResponse.next();
  }

  // 3. Protección de rutas de Comercio / Restaurante (/client/:path*)
  if (pathname.startsWith('/client')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/client/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
