import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.businessId) {
      return NextResponse.json({ error: 'No autorizado o sin negocio asociado' }, { status: 401 });
    }

    const tables = await prisma.tableSession.findMany({
      where: { businessId: user.businessId },
      orderBy: { tableId: 'asc' },
      include: {
        products: { include: { product: true } },
        orders: {
          where: { status: { notIn: ['PAID', 'CANCELLED'] } },
          include: { items: true },
        },
      },
    });

    return NextResponse.json(tables);
  } catch (err) {
    console.error('Error al obtener mesas:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.businessId) {
      return NextResponse.json({ error: 'No autorizado o sin negocio asociado' }, { status: 401 });
    }

    const body = await request.json();
    const { tableId, nickname, capacity, status, waiter, comment, guestCount } = body;

    if (!tableId) {
      return NextResponse.json({ error: 'tableId es requerido' }, { status: 400 });
    }

    const tableSession = await prisma.tableSession.upsert({
      where: {
        businessId_tableId: {
          businessId: user.businessId,
          tableId: String(tableId),
        },
      },
      update: {
        nickname: nickname !== undefined ? nickname : undefined,
        capacity: capacity !== undefined ? Number(capacity) : undefined,
        status: status !== undefined ? status : undefined,
        waiter: waiter !== undefined ? waiter : undefined,
        comment: comment !== undefined ? comment : undefined,
        guestCount: guestCount !== undefined ? Number(guestCount) : undefined,
      },
      create: {
        businessId: user.businessId,
        tableId: String(tableId),
        nickname: nickname || `Mesa ${tableId}`,
        capacity: capacity ? Number(capacity) : 4,
        status: status || 'free',
        waiter: waiter || null,
        comment: comment || null,
        guestCount: guestCount ? Number(guestCount) : 1,
      },
    });

    return NextResponse.json(tableSession);
  } catch (err) {
    console.error('Error al actualizar mesa:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
