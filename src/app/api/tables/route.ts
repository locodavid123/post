import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveBusinessId } from '@/lib/business';

export async function GET(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);

    const tables = await prisma.tableSession.findMany({
      where: {
        businessId,
        tableId: { notIn: ['admin', 'barra', 'caja'] },
      },
      include: {
        products: { include: { product: true } },
        orders: {
          where: { status: { notIn: ['PAID', 'CANCELLED'] } },
          include: { items: true },
        },
      },
    });

    if (tables.length === 0) {
      // Auto-inicializar 6 mesas limpias y libres para este negocio en PostgreSQL
      const initialTables = [
        { tableId: "1", capacity: 4 },
        { tableId: "2", capacity: 2 },
        { tableId: "3", capacity: 4 },
        { tableId: "4", capacity: 6 },
        { tableId: "5", capacity: 2 },
        { tableId: "6", capacity: 4 },
      ];

      for (const t of initialTables) {
        await prisma.tableSession.create({
          data: {
            businessId,
            tableId: t.tableId,
            nickname: `Mesa ${t.tableId}`,
            capacity: t.capacity,
            status: "free",
          },
        });
      }

      const createdTables = await prisma.tableSession.findMany({
        where: {
          businessId,
          tableId: { notIn: ['admin', 'barra', 'caja'] },
        },
        include: {
          products: { include: { product: true } },
          orders: {
            where: { status: { notIn: ['PAID', 'CANCELLED'] } },
            include: { items: true },
          },
        },
      });

      createdTables.sort((a, b) => {
        const numA = parseInt(a.tableId, 10);
        const numB = parseInt(b.tableId, 10);
        if (isNaN(numA) || isNaN(numB)) return a.tableId.localeCompare(b.tableId);
        return numA - numB;
      });

      return NextResponse.json(createdTables);
    }

    // Ordenamiento numérico: 1, 2, 3, ..., 10, 11, 12
    tables.sort((a, b) => {
      const numA = parseInt(a.tableId, 10);
      const numB = parseInt(b.tableId, 10);
      if (isNaN(numA) || isNaN(numB)) return a.tableId.localeCompare(b.tableId);
      return numA - numB;
    });

    return NextResponse.json(tables);
  } catch (err) {
    console.error('Error al obtener mesas:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);

    const body = await request.json();
    const { tableId, nickname, capacity, status, waiter, comment, guestCount } = body;

    if (!tableId) {
      return NextResponse.json({ error: 'tableId es requerido' }, { status: 400 });
    }

    const tableSession = await prisma.tableSession.upsert({
      where: {
        businessId_tableId: {
          businessId,
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
        businessId,
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
