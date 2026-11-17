import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.businessId) {
      return NextResponse.json({ error: 'No autorizado o sin negocio asociado' }, { status: 401 });
    }

    const sales = await prisma.sale.findMany({
      where: { businessId: user.businessId },
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
    const user = await getUserFromRequest(request);
    if (!user || !user.businessId) {
      return NextResponse.json({ error: 'No autorizado o sin negocio asociado' }, { status: 401 });
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

    const count = await prisma.sale.count({ where: { businessId: user.businessId } });
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
        businessId: user.businessId,
      },
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (err) {
    console.error('Error al registrar venta:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
