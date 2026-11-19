import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveBusinessId, getBusinessStatus } from '@/lib/business';

// GET: Obtiene las órdenes activas (no pagadas ni canceladas) del negocio o de una mesa específica
export async function GET(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');

    const whereClause: any = {
      businessId,
      status: { notIn: ['PAID', 'CANCELLED'] },
    };

    if (tableId) {
      const session = await prisma.tableSession.findUnique({
        where: {
          businessId_tableId: {
            businessId,
            tableId: String(tableId),
          },
        },
      });

      if (!session) {
        return NextResponse.json([]);
      }

      whereClause.tableSessionId = session.id;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
        tableSession: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error('Error al obtener órdenes:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Agrega productos a la orden activa de una mesa
export async function POST(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);

    const { isSuspended, isExpired } = await getBusinessStatus(businessId);
    if (isSuspended || isExpired) {
      return NextResponse.json(
        {
          error: isSuspended
            ? 'El comercio se encuentra suspendido. No se pueden registrar pedidos.'
            : 'El período de servicio ha finalizado. Adquiera un plan para registrar pedidos.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tableId, items, productId, name, price, quantity } = body;

    if (!tableId) {
      return NextResponse.json({ error: 'tableId es requerido' }, { status: 400 });
    }

    // Normalizar lista de ítems a agregar
    const itemsToAdd: Array<{
      productId?: string | number;
      name: string;
      price: number;
      quantity: number;
    }> = [];

    if (Array.isArray(items) && items.length > 0) {
      items.forEach((it) => {
        if (it && it.name && (Number(it.quantity) || 0) > 0) {
          itemsToAdd.push({
            productId: it.productId ? String(it.productId) : undefined,
            name: String(it.name),
            price: Number(it.price) || 0,
            quantity: Number(it.quantity) || 1,
          });
        }
      });
    } else if (name && (Number(quantity) || 0) > 0) {
      itemsToAdd.push({
        productId: productId ? String(productId) : undefined,
        name: String(name),
        price: Number(price) || 0,
        quantity: Number(quantity) || 1,
      });
    }

    if (itemsToAdd.length === 0) {
      return NextResponse.json({ error: 'Debe proporcionar al menos un producto' }, { status: 400 });
    }

    // 1. Obtener o crear TableSession (marcar como occupied)
    let session = await prisma.tableSession.findUnique({
      where: {
        businessId_tableId: {
          businessId,
          tableId: String(tableId),
        },
      },
    });

    if (!session) {
      session = await prisma.tableSession.create({
        data: {
          businessId,
          tableId: String(tableId),
          nickname: `Mesa ${tableId}`,
          status: 'occupied',
        },
      });
    } else if (session.status !== 'occupied') {
      session = await prisma.tableSession.update({
        where: { id: session.id },
        data: { status: 'occupied' },
      });
    }

    // 2. Obtener o crear Order activa para esta mesa
    let activeOrder = await prisma.order.findFirst({
      where: {
        businessId,
        tableSessionId: session.id,
        status: { notIn: ['PAID', 'CANCELLED'] },
      },
      include: { items: true },
    });

    if (!activeOrder) {
      activeOrder = await prisma.order.create({
        data: {
          businessId,
          tableSessionId: session.id,
          status: 'PENDING',
          total: 0,
        },
        include: { items: true },
      });
    }

    // 3. Insertar o actualizar OrderItem
    for (const item of itemsToAdd) {
      // Buscar si el producto ya existe en la orden activa
      const existing = activeOrder.items.find(
        (it) =>
          (item.productId && it.productId === String(item.productId)) ||
          it.productName.toLowerCase().trim() === item.name.toLowerCase().trim()
      );

      if (existing) {
        await prisma.orderItem.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + item.quantity,
            unitPrice: item.price,
          },
        });
      } else {
        // Verificar si el productId existe en la tabla Product
        let validProductId: string | null = null;
        if (item.productId) {
          const prodExists = await prisma.product.findUnique({
            where: { id: String(item.productId) },
          });
          if (prodExists) {
            validProductId = prodExists.id;
          }
        }

        await prisma.orderItem.create({
          data: {
            orderId: activeOrder.id,
            productId: validProductId,
            productName: item.name,
            unitPrice: item.price,
            quantity: item.quantity,
          },
        });
      }
    }

    // 4. Recalcular total de la orden
    const allItems = await prisma.orderItem.findMany({
      where: { orderId: activeOrder.id },
    });
    const total = allItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);

    const updatedOrder = await prisma.order.update({
      where: { id: activeOrder.id },
      data: { total },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      items: updatedOrder.items.map((i) => ({
        productId: i.productId || i.id,
        name: i.productName,
        price: i.unitPrice,
        quantity: i.quantity,
      })),
    });
  } catch (err) {
    console.error('Error al agregar productos a la orden:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH: Modifica la cantidad (+ / -) de un producto o lo elimina si quantity <= 0
export async function PATCH(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);

    const { isSuspended, isExpired } = await getBusinessStatus(businessId);
    if (isSuspended || isExpired) {
      return NextResponse.json({ error: 'Comercio suspendido o expirado' }, { status: 403 });
    }

    const body = await request.json();
    const { tableId, productId, quantity } = body;

    if (!tableId || productId === undefined || quantity === undefined) {
      return NextResponse.json(
        { error: 'tableId, productId y quantity son requeridos' },
        { status: 400 }
      );
    }

    const session = await prisma.tableSession.findUnique({
      where: {
        businessId_tableId: {
          businessId,
          tableId: String(tableId),
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Mesa no encontrada' }, { status: 404 });
    }

    const activeOrder = await prisma.order.findFirst({
      where: {
        businessId,
        tableSessionId: session.id,
        status: { notIn: ['PAID', 'CANCELLED'] },
      },
      include: { items: true },
    });

    if (!activeOrder) {
      return NextResponse.json({ error: 'No hay orden activa para esta mesa' }, { status: 404 });
    }

    // Buscar ítem por productId o id de OrderItem
    const item = activeOrder.items.find(
      (it) => it.productId === String(productId) || it.id === String(productId)
    );

    if (!item) {
      return NextResponse.json({ error: 'Producto no encontrado en la orden' }, { status: 404 });
    }

    const newQty = Number(quantity);

    if (newQty <= 0) {
      // Eliminar el ítem de la orden
      await prisma.orderItem.delete({
        where: { id: item.id },
      });
    } else {
      // Actualizar la cantidad
      await prisma.orderItem.update({
        where: { id: item.id },
        data: { quantity: newQty },
      });
    }

    // Recalcular total de la orden
    const remainingItems = await prisma.orderItem.findMany({
      where: { orderId: activeOrder.id },
    });
    const total = remainingItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);

    const updatedOrder = await prisma.order.update({
      where: { id: activeOrder.id },
      data: { total },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      items: updatedOrder.items.map((i) => ({
        productId: i.productId || i.id,
        name: i.productName,
        price: i.unitPrice,
        quantity: i.quantity,
      })),
    });
  } catch (err) {
    console.error('Error al actualizar cantidad del ítem:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE: Libera órdenes (paid / cancel) o elimina un ítem específico
export async function DELETE(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);
    let tableId: string | null = null;
    let productId: string | null = null;
    let action: string | null = null;

    // Intentar leer desde query o body
    try {
      const url = new URL(request.url);
      tableId = url.searchParams.get('tableId');
      productId = url.searchParams.get('productId');
      action = url.searchParams.get('action');
    } catch {}

    if (!tableId) {
      try {
        const body = await request.json();
        tableId = body.tableId;
        productId = body.productId;
        action = body.action;
      } catch {}
    }

    if (!tableId) {
      return NextResponse.json({ error: 'tableId es requerido' }, { status: 400 });
    }

    const session = await prisma.tableSession.findUnique({
      where: {
        businessId_tableId: {
          businessId,
          tableId: String(tableId),
        },
      },
    });

    if (!session) {
      return NextResponse.json({ success: true });
    }

    // Si la acción es pagar (al facturar)
    if (action === 'paid' || action === 'pay') {
      await prisma.order.updateMany({
        where: {
          businessId,
          tableSessionId: session.id,
          status: { notIn: ['PAID', 'CANCELLED'] },
        },
        data: { status: 'PAID' },
      });
      return NextResponse.json({ success: true, message: 'Órdenes marcadas como pagadas' });
    }

    // Si la acción es cancelar / liberar sin cobrar
    if (action === 'cancel' || action === 'free' || (!productId && !action)) {
      await prisma.order.updateMany({
        where: {
          businessId,
          tableSessionId: session.id,
          status: { notIn: ['PAID', 'CANCELLED'] },
        },
        data: { status: 'CANCELLED' },
      });
      return NextResponse.json({ success: true, message: 'Órdenes canceladas y mesa liberada' });
    }

    // Si se especifica un productId puntual a eliminar
    if (productId) {
      const activeOrder = await prisma.order.findFirst({
        where: {
          businessId,
          tableSessionId: session.id,
          status: { notIn: ['PAID', 'CANCELLED'] },
        },
        include: { items: true },
      });

      if (activeOrder) {
        const item = activeOrder.items.find(
          (it) => it.productId === String(productId) || it.id === String(productId)
        );
        if (item) {
          await prisma.orderItem.delete({ where: { id: item.id } });

          const remainingItems = await prisma.orderItem.findMany({
            where: { orderId: activeOrder.id },
          });
          const total = remainingItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);

          await prisma.order.update({
            where: { id: activeOrder.id },
            data: { total },
          });
        }
      }
      return NextResponse.json({ success: true, message: 'Ítem eliminado de la orden' });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error al procesar eliminación en orden:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
