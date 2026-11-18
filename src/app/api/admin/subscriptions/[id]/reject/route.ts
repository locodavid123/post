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
    const body = await request.json().catch(() => ({}));
    const { reason = 'Comprobante no verificado o fondos no recibidos' } = body;

    const invoice = await prisma.subscriptionInvoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json({ message: 'Comprobante no encontrado' }, { status: 404 });
    }

    const updated = await prisma.subscriptionInvoice.update({
      where: { id },
      data: {
        status: 'REJECTED',
        notes: `Rechazado por Admin: ${reason}`,
      },
    });

    return NextResponse.json({
      message: `Comprobante ${invoice.invoiceNumber} marcado como rechazado.`,
      invoice: updated,
    });
  } catch (err) {
    console.error('Error al rechazar suscripción:', err);
    return NextResponse.json({ message: 'Error interno al rechazar suscripción' }, { status: 500 });
  }
}
