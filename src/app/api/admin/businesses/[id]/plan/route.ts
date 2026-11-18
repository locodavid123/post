import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

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
    const { plan, planStatus, extendDays, billingCycle, notes } = body;

    const currentBusiness = await prisma.business.findUnique({ where: { id } });
    if (!currentBusiness) {
      return NextResponse.json({ message: 'Comercio no encontrado' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (plan !== undefined) {
      dataToUpdate.plan = plan;
      if (plan === 'PRO' || plan === 'ENTERPRISE') {
        dataToUpdate.enableJukebox = true;
      }
    }

    if (planStatus !== undefined) {
      dataToUpdate.planStatus = planStatus;
    }

    if (billingCycle !== undefined) {
      dataToUpdate.billingCycle = billingCycle;
    }

    if (extendDays && typeof extendDays === 'number') {
      const baseDate = currentBusiness.planExpiresAt && new Date(currentBusiness.planExpiresAt) > new Date()
        ? new Date(currentBusiness.planExpiresAt)
        : new Date();
      baseDate.setDate(baseDate.getDate() + extendDays);
      dataToUpdate.planExpiresAt = baseDate;
      dataToUpdate.planStatus = 'ACTIVE';
    }

    const updated = await prisma.business.update({
      where: { id },
      data: dataToUpdate,
    });

    // Registrar comprobante manual en auditoría si se activó o extendió
    if (extendDays || (plan && plan !== 'FREE' && plan !== currentBusiness.plan)) {
      const invoiceNumber = `ADM-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const end = dataToUpdate.planExpiresAt || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.subscriptionInvoice.create({
        data: {
          businessId: id,
          invoiceNumber,
          plan: updated.plan,
          amount: 0, // Bonificado / Gestión manual de Admin
          billingCycle: updated.billingCycle || 'monthly',
          paymentMethod: 'AdminManual',
          status: 'PAID',
          periodStart: now,
          periodEnd: end,
        },
      });
    }

    return NextResponse.json({
      message: `Plan del comercio ${updated.name} actualizado a ${updated.plan} (${updated.planStatus}).`,
      business: updated,
    });
  } catch (err) {
    console.error('Error al actualizar plan desde admin:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
