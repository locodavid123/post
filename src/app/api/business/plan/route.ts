import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveBusinessId } from '@/lib/business';
import { readConfig } from '@/lib/systemConfig';

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
          take: 20,
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

    // Configuración de pagos para Colombia (Modo Híbrido Flexible)
    const sysConfig = readConfig();
    const paymentConfig = {
      bankName: sysConfig.bankName || 'Bancolombia',
      bankAccount: sysConfig.bankAccount || sysConfig.bancolombiaAccount || '123-456789-01',
      bankType: sysConfig.bankType || sysConfig.bancolombiaType || 'Ahorros',
      bankHolder: sysConfig.bankHolder || sysConfig.bancolombiaHolder || 'EcoPost SAS (NIT: 901.234.567-8)',
      nequiNumber: sysConfig.nequiNumber !== undefined ? sysConfig.nequiNumber : '300 123 4567',
      nequiHolder: sysConfig.nequiHolder || 'EcoPost Colombia',
      bancolombiaAccount: sysConfig.bankAccount || sysConfig.bancolombiaAccount || '123-456789-01',
      bancolombiaType: sysConfig.bankType || sysConfig.bancolombiaType || 'Ahorros',
      bancolombiaHolder: sysConfig.bankHolder || sysConfig.bancolombiaHolder || 'EcoPost SAS (NIT: 901.234.567-8)',
      daviplataNumber: sysConfig.daviplataNumber || '',
      daviplataHolder: sysConfig.daviplataHolder || '',
      paymentInstructions: sysConfig.paymentInstructions || 'Realiza la transferencia desde tu app bancaria o billetera y registra el número de comprobante para validación inmediata.',
      wompiPublicKey: sysConfig.wompiPublicKey || process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '',
      wompiSandbox: sysConfig.wompiSandbox !== false,
    };

    return NextResponse.json({
      ...business,
      planStatus: currentStatus,
      paymentConfig,
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
    const {
      plan,
      billingCycle = 'monthly',
      paymentMethod = 'Tarjeta',
      paymentMode = 'gateway',
      referenceNumber,
      notes,
    } = body;

    const validPlans = ['FREE', 'STANDARD', 'PRO', 'ENTERPRISE'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ message: 'Plan no válido' }, { status: 400 });
    }

    // Precios estándar en Pesos Colombianos (COP)
    let amount = 0;
    if (plan === 'STANDARD') amount = billingCycle === 'annual' ? 690000 : 69000;
    if (plan === 'PRO') amount = billingCycle === 'annual' ? 1190000 : 119000;
    if (plan === 'ENTERPRISE') amount = billingCycle === 'annual' ? 2490000 : 249000;

    const now = new Date();
    const periodEnd = new Date(now);

    if (plan === 'FREE') {
      // 1 semana (7 días) de prueba gratuita
      periodEnd.setDate(periodEnd.getDate() + 7);

      const updatedBusiness = await prisma.business.update({
        where: { id: businessId },
        data: {
          plan: 'FREE',
          planStatus: 'ACTIVE',
          billingCycle: 'monthly',
          planExpiresAt: periodEnd,
        },
      });

      return NextResponse.json({
        message: '¡Prueba gratuita de 7 días iniciada exitosamente!',
        business: updatedBusiness,
      });
    }

    // Período de renovación para planes de pago
    if (billingCycle === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setDate(periodEnd.getDate() + 30);
    }

    const invoiceNumber = `SUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // MODO HÍBRIDO - CASO 1: TRANSFERENCIA DIRECTA (NEQUI, BANCOLOMBIA, DAVIPLATA)
    if (paymentMode === 'manual_transfer') {
      if (!referenceNumber || String(referenceNumber).trim().length < 3) {
        return NextResponse.json(
          { message: 'Debes ingresar el número de referencia o comprobante de la transferencia.' },
          { status: 400 }
        );
      }

      const invoice = await prisma.subscriptionInvoice.create({
        data: {
          businessId,
          invoiceNumber,
          plan,
          amount,
          billingCycle,
          paymentMethod: paymentMethod || 'Transferencia',
          status: 'PENDING',
          referenceNumber: String(referenceNumber).trim(),
          notes: notes ? String(notes).trim() : null,
          periodStart: now,
          periodEnd,
        },
      });

      return NextResponse.json({
        message: `Comprobante registrado (${invoice.invoiceNumber}). El Administrador validará tu pago para activar el plan.`,
        invoice,
        pendingApproval: true,
      });
    }

    // MODO HÍBRIDO - CASO 2: PASARELA AUTOMATIZADA / SIMULADOR DE PAGO EN LÍNEA
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        plan,
        planStatus: 'ACTIVE',
        billingCycle,
        planExpiresAt: periodEnd,
        enableJukebox: plan === 'PRO' || plan === 'ENTERPRISE' ? true : undefined,
      },
    });

    const invoice = await prisma.subscriptionInvoice.create({
      data: {
        businessId,
        invoiceNumber,
        plan,
        amount,
        billingCycle,
        paymentMethod: paymentMethod || 'Wompi Online',
        status: 'PAID',
        referenceNumber: referenceNumber || `TX-${Date.now()}`,
        notes: notes || 'Pago procesado en línea',
        periodStart: now,
        periodEnd,
      },
    });

    return NextResponse.json({
      message: `¡Pago procesado con éxito! Plan ${plan} activado.`,
      business: updatedBusiness,
      invoice,
    });
  } catch (err) {
    console.error('Error al adquirir plan:', err);
    return NextResponse.json({ message: 'Error al procesar la adquisición del plan' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);

    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        billingCycle: 'monthly',
      },
    });

    return NextResponse.json({ message: 'Suscripción cancelada con éxito.', business });
  } catch (err) {
    console.error('Error al cancelar suscripción:', err);
    return NextResponse.json({ message: 'Error al cancelar la suscripción' }, { status: 500 });
  }
}
