import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const currentUser = await getUserFromRequest(request);
  if (!isAdmin(currentUser) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const invoice = await prisma.subscriptionInvoice.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!invoice) {
      return NextResponse.json({ message: 'Comprobante no encontrado' }, { status: 404 });
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ message: 'Este comprobante ya fue aprobado y liquidado.' }, { status: 400 });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    if (invoice.billingCycle === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setDate(periodEnd.getDate() + 30);
    }

    // 1. Actualizar la factura de suscripción a PAID
    const updatedInvoice = await prisma.subscriptionInvoice.update({
      where: { id },
      data: {
        status: 'PAID',
        periodStart: now,
        periodEnd,
      },
    });

    // 2. Activar el comercio y renovar su período
    await prisma.business.update({
      where: { id: invoice.businessId },
      data: {
        plan: invoice.plan,
        planStatus: 'ACTIVE',
        billingCycle: invoice.billingCycle,
        planExpiresAt: periodEnd,
        enableJukebox: invoice.plan === 'PRO' || invoice.plan === 'ENTERPRISE' ? true : undefined,
      },
    });

    return NextResponse.json({
      message: `Comprobante ${invoice.invoiceNumber} aprobado con éxito. Plan ${invoice.plan} activado para "${invoice.business.name}".`,
      invoice: updatedInvoice,
    });
  } catch (err) {
    console.error('Error al aprobar suscripción:', err);
    return NextResponse.json({ message: 'Error interno al aprobar suscripción' }, { status: 500 });
  }
}
