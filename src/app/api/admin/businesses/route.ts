import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!isAdmin(user) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { tables: true, products: true, sales: true, songRequests: true } },
      },
    });
    return NextResponse.json(businesses);
  } catch (err) {
    console.error('Error listing businesses:', err);
    return NextResponse.json({ message: 'Error al listar negocios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!isAdmin(user) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { name, phone, address, enableJukebox, enableQrOrders } = body;
    if (!name?.trim()) {
      return NextResponse.json({ message: 'El nombre comercial es obligatorio' }, { status: 400 });
    }

    const code = `biz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    const business = await prisma.business.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        enableJukebox: enableJukebox !== undefined ? Boolean(enableJukebox) : true,
        enableQrOrders: enableQrOrders !== undefined ? Boolean(enableQrOrders) : true,
        code,
      },
    });

    // Crear 6 mesas iniciales limpias
    const initialTables = [
      { tableId: '1', capacity: 4 },
      { tableId: '2', capacity: 2 },
      { tableId: '3', capacity: 4 },
      { tableId: '4', capacity: 6 },
      { tableId: '5', capacity: 2 },
      { tableId: '6', capacity: 4 },
    ];
    for (const t of initialTables) {
      await prisma.tableSession.create({
        data: {
          businessId: business.id,
          tableId: t.tableId,
          nickname: `Mesa ${t.tableId}`,
          capacity: t.capacity,
          status: 'free',
        },
      });
    }

    // Crear categorías iniciales
    const defaultCategories = [
      { name: 'Hamburguesas', icon: '🍔' },
      { name: 'Entradas', icon: '🍟' },
      { name: 'Bebidas', icon: '🍺' },
      { name: 'Postres', icon: '🍰' },
    ];
    for (const cat of defaultCategories) {
      await prisma.category.create({
        data: {
          businessId: business.id,
          name: cat.name,
          icon: cat.icon,
        },
      });
    }

    return NextResponse.json(business, { status: 201 });
  } catch (err) {
    console.error('Error al crear negocio:', err);
    return NextResponse.json({ message: 'Error interno al crear negocio' }, { status: 500 });
  }
}
