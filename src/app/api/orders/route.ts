import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveBusinessId, getBusinessStatus } from '@/lib/business';

// GET: Obtiene las órdenes activas (no pagadas ni canceladas) del negocio o de una mesa específica en orden cronológico
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
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error('Error al obtener órdenes:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST: Registra una nueva ronda / comanda para la mesa con su propia marca de tiempo (createdAt)
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
    const { tableId, items, productId, name, price, quantity, notes } = body;

    if (!tableId) {
      return NextResponse.json({ error: 'tableId es requerido' }, { status: 400 });
    }

    // Normalizar lista de ítems a agregar en esta nueva ronda
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
      return NextResponse.json({ error: 'Debe proporcionar al menos un producto para la comanda' }, { status: 400 });
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

    // 2. Preparar ítems para la nueva ronda / comanda con verificación de FK de Product
    const itemsToCreate = await Promise.all(
      itemsToAdd.map(async (it) => {
        let validProductId: string | null = null;
        if (it.productId) {
          const prodExists = await prisma.product.findUnique({
            where: { id: String(it.productId) },
          });
          if (prodExists) {
            validProductId = prodExists.id;
          }
        }
        return {
          productId: validProductId,
          productName: it.name,
          unitPrice: it.price,
          quantity: it.quantity,
        };
      })
    );

    const roundTotal = itemsToAdd.reduce((acc, it) => acc + it.price * it.quantity, 0);

    // 3. Crear una NUEVA Order en PostgreSQL con su propia marca de tiempo (createdAt)
    const newOrder = await prisma.order.create({
      data: {
        businessId,
        tableSessionId: session.id,
        status: 'PENDING',
        total: roundTotal,
        notes: notes || null,
        items: {
          create: itemsToCreate,
        },
      },
      include: { items: true },
    });

    // 4. Obtener todas las órdenes activas de la mesa en orden cronológico
    const allActiveOrders = await prisma.order.findMany({
      where: {
        businessId,
        tableSessionId: session.id,
        status: { notIn: ['PAID', 'CANCELLED'] },
      },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      createdOrder: newOrder,
      activeOrders: allActiveOrders,
    });
  } catch (err) {
    console.error('Error al registrar comanda en la mesa:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH: Modifica la cantidad (+ / -) de un ítem en una comanda o lo elimina si quantity <= 0
export async function PATCH(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);

    const { isSuspended, isExpired } = await getBusinessStatus(businessId);
    if (isSuspended || isExpired) {
      return NextResponse.json({ error: 'Comercio suspendido o expirado' }, { status: 403 });
    }

    const body = await request.json();
    const { tableId, productId, orderItemId, quantity } = body;

    if (!tableId || (productId === undefined && orderItemId === undefined) || quantity === undefined) {
      return NextResponse.json(
        { error: 'tableId, (productId o orderItemId) y quantity son requeridos' },
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

    const newQty = Number(quantity);
    let affectedOrderId: string | null = null;

    if (orderItemId) {
      const item = await prisma.orderItem.findUnique({
        where: { id: String(orderItemId) },
        include: { order: true },
      });
      if (item && item.order.tableSessionId === session.id) {
        affectedOrderId = item.orderId;
        if (newQty <= 0) {
          await prisma.orderItem.delete({ where: { id: item.id } });
        } else {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: { quantity: newQty },
          });
        }
      }
    } else {
      // Buscar el ítem en las órdenes activas de la mesa (de más reciente a más antigua)
      const activeOrders = await prisma.order.findMany({
        where: {
          businessId,
          tableSessionId: session.id,
          status: { notIn: ['PAID', 'CANCELLED'] },
        },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });

      for (const ord of activeOrders) {
        const item = ord.items.find(
          (it) =>
            it.productId === String(productId) ||
            it.id === String(productId) ||
            it.productName.toLowerCase().trim() === String(productId).toLowerCase().trim()
        );
        if (item) {
          affectedOrderId = ord.id;
          if (newQty <= 0) {
            await prisma.orderItem.delete({ where: { id: item.id } });
          } else {
            await prisma.orderItem.update({
              where: { id: item.id },
              data: { quantity: newQty },
            });
          }
          break;
        }
      }
    }

    if (affectedOrderId) {
      // Recalcular total de la orden afectada
      const remainingItems = await prisma.orderItem.findMany({
        where: { orderId: affectedOrderId },
      });
      if (remainingItems.length === 0) {
        // Si no quedan ítems en esa orden, se elimina
        await prisma.order.delete({ where: { id: affectedOrderId } });
      } else {
        const orderTotal = remainingItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
        await prisma.order.update({
          where: { id: affectedOrderId },
          data: { total: orderTotal },
        });
      }
    }

    // Retornar todas las órdenes activas actualizadas en orden cronológico
    const allActiveOrders = await prisma.order.findMany({
      where: {
        businessId,
        tableSessionId: session.id,
        status: { notIn: ['PAID', 'CANCELLED'] },
      },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      activeOrders: allActiveOrders,
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
    let orderItemId: string | null = null;
    let action: string | null = null;

    // Intentar leer desde query o body
    try {
      const url = new URL(request.url);
      tableId = url.searchParams.get('tableId');
      productId = url.searchParams.get('productId');
      orderItemId = url.searchParams.get('orderItemId');
      action = url.searchParams.get('action');
    } catch {}

    if (!tableId) {
      try {
        const body = await request.json();
        tableId = body.tableId;
        productId = body.productId;
        orderItemId = body.orderItemId;
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
    if (action === 'cancel' || action === 'free' || (!productId && !orderItemId && !action)) {
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

    // Si se especifica un orderItemId o productId puntual a eliminar
    let targetOrderId: string | null = null;
    if (orderItemId) {
      const item = await prisma.orderItem.findUnique({
        where: { id: String(orderItemId) },
        include: { order: true },
      });
      if (item && item.order.tableSessionId === session.id) {
        targetOrderId = item.orderId;
        await prisma.orderItem.delete({ where: { id: item.id } });
      }
    } else if (productId) {
      const activeOrders = await prisma.order.findMany({
        where: {
          businessId,
          tableSessionId: session.id,
          status: { notIn: ['PAID', 'CANCELLED'] },
        },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });

      for (const ord of activeOrders) {
        const item = ord.items.find(
          (it) =>
            it.productId === String(productId) ||
            it.id === String(productId) ||
            it.productName.toLowerCase().trim() === String(productId).toLowerCase().trim()
        );
        if (item) {
          targetOrderId = ord.id;
          await prisma.orderItem.delete({ where: { id: item.id } });
          break;
        }
      }
    }

    if (targetOrderId) {
      const remainingItems = await prisma.orderItem.findMany({
        where: { orderId: targetOrderId },
      });
      if (remainingItems.length === 0) {
        await prisma.order.delete({ where: { id: targetOrderId } });
      } else {
        const total = remainingItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
        await prisma.order.update({
          where: { id: targetOrderId },
          data: { total },
        });
      }
    }

    const allActiveOrders = await prisma.order.findMany({
      where: {
        businessId,
        tableSessionId: session.id,
        status: { notIn: ['PAID', 'CANCELLED'] },
      },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      activeOrders: allActiveOrders,
    });
  } catch (err) {
    console.error('Error al procesar eliminación en orden:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
