import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getUserFromRequest(request);
  if (!isAdmin(user) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const newCode = `biz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const business = await prisma.business.update({
      where: { id },
      data: { code: newCode },
    });
    return NextResponse.json({ code: business.code });
  } catch (err) {
    console.error('Error regenerando código de negocio:', err);
    return NextResponse.json({ message: 'Error regenerando código' }, { status: 500 });
  }
}
