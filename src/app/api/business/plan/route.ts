import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveBusinessId } from '@/lib/business';

export async function GET(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        plan: true,
        planStatus: true,
        planExpiresAt: true,
        billingCycle: true,
        enableJukebox: true,
        enableQrOrders: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!business) {
      return NextResponse.json({ message: 'Comercio no encontrado' }, { status: 404 });
    }

    // Comprobar si el plan ha expirado automáticamente
    let currentStatus = business.planStatus;
    if (business.planExpiresAt && new Date(business.planExpiresAt) < new Date() && currentStatus === 'ACTIVE') {
      currentStatus = 'EXPIRED';
      await prisma.business.update({
        where: { id: businessId },
        data: { planStatus: 'EXPIRED' },
      });
    }

    return NextResponse.json({
      ...business,
      planStatus: currentStatus,
    });
  } catch (err) {
    console.error('Error al obtener plan del negocio:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);
    const body = await request.json();
    const { plan, billingCycle = 'monthly', paymentMethod = 'Tarjeta' } = body;

    const validPlans = ['FREE', 'STANDARD', 'PRO', 'ENTERPRISE'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ message: 'Plan no válido' }, { status: 400 });
    }

    // Precios por defecto o según configuración
    let amount = 0;
    if (plan === 'STANDARD') amount = billingCycle === 'annual' ? 299.99 : 29.99;
    if (plan === 'PRO') amount = billingCycle === 'annual' ? 499.99 : 49.99;
    if (plan === 'ENTERPRISE') amount = billingCycle === 'annual' ? 999.99 : 99.99;

    const now = new Date();
    const periodEnd = new Date(now);
    if (billingCycle === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setDate(periodEnd.getDate() + 30);
    }

    // Actualizar comercio
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        plan,
        planStatus: 'ACTIVE',
        billingCycle,
        planExpiresAt: plan === 'FREE' ? null : periodEnd,
        // Al adquirir PRO o ENTERPRISE, se habilita Jukebox automáticamente
        enableJukebox: plan === 'PRO' || plan === 'ENTERPRISE' ? true : undefined,
      },
    });

    // Registrar comprobante de suscripción si no es FREE
    if (plan !== 'FREE') {
      const invoiceNumber = `SUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await prisma.subscriptionInvoice.create({
        data: {
          businessId,
          invoiceNumber,
          plan,
          amount,
          billingCycle,
          paymentMethod,
          status: 'PAID',
          periodStart: now,
          periodEnd,
        },
      });
    }

    return NextResponse.json({
      message: `¡Plan ${plan} activado con éxito!`,
      business: updatedBusiness,
    });
  } catch (err) {
    console.error('Error al adquirir plan:', err);
    return NextResponse.json({ message: 'Error al procesar la adquisición del plan' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);

    // Cancelar suscripción: marca como cancelado pero mantiene hasta vencimiento o revierte a FREE
    const updated = await prisma.business.update({
      where: { id: businessId },
      data: {
        planStatus: 'CANCELLED',
      },
    });

    return NextResponse.json({
      message: 'Suscripción cancelada correctamente.',
      business: updated,
    });
  } catch (err) {
    console.error('Error al cancelar suscripción:', err);
    return NextResponse.json({ message: 'Error al cancelar plan' }, { status: 500 });
  }
}
