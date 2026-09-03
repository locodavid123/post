import prisma from '@/lib/prisma';
import { verifyToken } from './jwt';

export async function getUserFromRequest(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const tokenPair = cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith('token='));
    if (!tokenPair) return null;
    const token = tokenPair.split('=')[1];
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || !payload.id) return null;

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return null;

    const { password: _p, ...safe } = user as any;
    return safe;
  } catch (err) {
    console.error('getUserFromRequest error', err);
    return null;
  }
}

export function isAdmin(user: any) {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'SUPERADMIN';
}

export async function requireAuth(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  return user;
}

export function requireRole(user: any, role: string) {
  if (!user) return false;
  if (role === 'ADMIN') return user.role === 'ADMIN' || user.role === 'SUPERADMIN';
  return user.role === role;
}
