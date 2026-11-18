import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(
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
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        },
        tables: {
          orderBy: { tableId: 'asc' },
          select: { id: true, tableId: true, nickname: true, capacity: true, status: true, waiter: true },
        },
        products: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, category: true, price: true, stock: true },
        },
        sales: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        songRequests: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            tables: true,
            products: true,
            sales: true,
            songRequests: true,
            users: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ message: 'Negocio no encontrado' }, { status: 404 });
    }

    // Calcular métricas adicionales
    const totalSalesVolume = business.sales.reduce((acc, s) => acc + (s.status === 'Completado' ? s.total : 0), 0);
    const occupiedTablesCount = business.tables.filter((t) => t.status === 'occupied').length;

    return NextResponse.json({
      ...business,
      totalSalesVolume,
      occupiedTablesCount,
    });
  } catch (err) {
    console.error('Error al obtener detalle del negocio:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(
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
    const body = await request.json();
    const { name, phone, address, enableJukebox, enableQrOrders, code, alertSound } = body;

    const updated = await prisma.business.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() : undefined,
        phone: phone !== undefined ? String(phone).trim() : undefined,
        address: address !== undefined ? String(address).trim() : undefined,
        enableJukebox: enableJukebox !== undefined ? Boolean(enableJukebox) : undefined,
        enableQrOrders: enableQrOrders !== undefined ? Boolean(enableQrOrders) : undefined,
        alertSound: alertSound !== undefined ? String(alertSound) : undefined,
        code: code !== undefined ? String(code).trim() : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error al actualizar negocio:', err);
    return NextResponse.json({ message: 'Error al actualizar negocio' }, { status: 500 });
  }
}

export async function DELETE(
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
    await prisma.business.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Negocio eliminado con éxito' });
  } catch (err) {
    console.error('Error al eliminar negocio:', err);
    return NextResponse.json({ message: 'Error al eliminar negocio' }, { status: 500 });
  }
}
