import { getUserFromRequest } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

  // Include business info if available
  let business = null;
  if (user.businessId) {
    business = await prisma.business.findUnique({
      where: { id: user.businessId },
      select: { id: true, name: true, code: true },
    });
  }

  return new Response(JSON.stringify({ user: { ...user, business } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
