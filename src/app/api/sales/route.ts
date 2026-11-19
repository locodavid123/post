import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveBusinessId, getBusinessStatus } from '@/lib/business';

export async function GET(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);

    const sales = await prisma.sale.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sales);
  } catch (err) {
    console.error('Error al obtener ventas:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);

    const { isSuspended, isExpired } = await getBusinessStatus(businessId);
    if (isSuspended || isExpired) {
      return NextResponse.json(
        {
          error: isSuspended
            ? 'El comercio se encuentra suspendido por el administrador. Regularice su cuenta para procesar ventas.'
            : 'El período de servicio o prueba ha finalizado. Adquiera un plan para facturar ventas.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      invoiceNumber,
      table,
      subtotal,
      tip,
      total,
      paymentMethod,
      cashReceived,
      change,
      waiter,
      guestCount,
      saleType,
      itemsCount,
    } = body;

    const count = await prisma.sale.count({ where: { businessId } });
    const generatedInvoice = invoiceNumber || `FAC-${1001 + count}`;

    const sale = await prisma.sale.create({
      data: {
        invoiceNumber: generatedInvoice,
        table: table || 'Mesa',
        subtotal: Number(subtotal) || 0,
        tip: Number(tip) || 0,
        total: Number(total) || 0,
        paymentMethod: paymentMethod || 'Efectivo',
        cashReceived: cashReceived ? Number(cashReceived) : null,
        change: change ? Number(change) : null,
        status: 'Completado',
        waiter: waiter || null,
        guestCount: guestCount ? Number(guestCount) : 1,
        saleType: saleType || 'Mesas',
        itemsCount: itemsCount ? Number(itemsCount) : 0,
        businessId,
      },
    });

    // Si la venta está asociada a una mesa, marcar sus órdenes activas como PAID
    if (table) {
      const match = table.match(/\d+/);
      if (match) {
        const tableId = match[0];
        const session = await prisma.tableSession.findUnique({
          where: {
            businessId_tableId: {
              businessId,
              tableId,
            },
          },
        });
        if (session) {
          await prisma.order.updateMany({
            where: {
              businessId,
              tableSessionId: session.id,
              status: { notIn: ['PAID', 'CANCELLED'] },
            },
            data: { status: 'PAID' },
          });
        }
      }
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (err) {
    console.error('Error al registrar venta:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'id o invoiceNumber es requerido' }, { status: 400 });
    }

    const updated = await prisma.sale.updateMany({
      where: {
        businessId,
        OR: [{ id }, { invoiceNumber: id }],
      },
      data: {
        status: status || 'Cancelado',
      },
    });

    return NextResponse.json({ success: true, count: updated.count });
  } catch (err) {
    console.error('Error al actualizar estado de venta:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
