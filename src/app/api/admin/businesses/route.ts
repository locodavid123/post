import prisma from '@/lib/prisma';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  if (!requireRole(user, 'ADMIN')) return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

  try {
    const businesses = await prisma.business.findMany({ orderBy: { createdAt: 'desc' } });
    return new Response(JSON.stringify({ businesses }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Error listing businesses' }), { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  if (!requireRole(user, 'ADMIN')) return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

  try {
    const body = await request.json().catch(() => ({}));
    const { name, phone } = body;
    if (!name) return new Response(JSON.stringify({ message: 'Name is required' }), { status: 400 });

    // generate a reasonably unique promo code
    const code = `biz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

    const business = await prisma.business.create({ data: { name, phone: phone || null, code } });
    return new Response(JSON.stringify({ business }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Error creating business' }), { status: 500 });
  }
}
