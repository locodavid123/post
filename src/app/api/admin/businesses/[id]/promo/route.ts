import prisma from '@/lib/prisma';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const user = await getUserFromRequest(request);
  if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  if (!requireRole(user, 'ADMIN')) return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

  try {
    // regenerate a new promo code and save
    const newCode = `biz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
    const business = await prisma.business.update({ where: { id }, data: { code: newCode } });
    return new Response(JSON.stringify({ code: business.code }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Error generating promo code' }), { status: 500 });
  }
}
