import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const currentUser = await getUserFromRequest(request);
  if (!isAdmin(currentUser) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const [subscriptions, businesses, subAggregate, activePaidSubsCount, freeTrialsCount] = await Promise.all([
      prisma.subscriptionInvoice.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          business: { select: { id: true, name: true, code: true, plan: true, planStatus: true } },
        },
      }),
      prisma.business.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          code: true,
          plan: true,
          planStatus: true,
          billingCycle: true,
          planExpiresAt: true,
          subscriptions: {
            select: { id: true, amount: true, status: true, plan: true, createdAt: true },
          },
        },
      }),
      prisma.subscriptionInvoice.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: 'PAID' },
      }),
      prisma.business.count({
        where: { planStatus: 'ACTIVE', plan: { not: 'FREE' } },
      }),
      prisma.business.count({
        where: { plan: 'FREE' },
      }),
    ]);

    const totalSubBilled = subAggregate._sum.amount || 0;
    const totalPaidInvoicesCount = subAggregate._count.id || 0;
    const pendingInvoices = subscriptions.filter((s) => s.status === 'PENDING');

    return NextResponse.json({
      subscriptions,
      businesses,
      totalSubBilled,
      totalPaidInvoicesCount,
      activePaidSubsCount,
      freeTrialsCount,
      pendingCount: pendingInvoices.length,
    });
  } catch (err) {
    console.error('Error al obtener suscripciones admin:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
