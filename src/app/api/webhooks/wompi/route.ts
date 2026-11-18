import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, data, signature } = body;

    if (event !== 'transaction.updated' || !data?.transaction) {
      return NextResponse.json({ message: 'Evento no relevante' }, { status: 200 });
    }

    const tx = data.transaction;
    const { id: txId, status, reference, amount_in_cents, payment_method_type } = tx;

    // Validación opcional de firma si existe la llave de eventos de Wompi
    const wompiEventsSecret = process.env.WOMPI_EVENTS_SECRET;
    if (wompiEventsSecret && signature?.checksum && signature?.properties) {
      try {
        const concatenated = signature.properties
          .map((prop: string) => {
            const keys = prop.split('.');
            let val: any = data;
            for (const k of keys) val = val?.[k];
            return val;
          })
          .join('') + wompiEventsSecret;

        const calculatedChecksum = crypto.createHash('sha256').update(concatenated).digest('hex');
        if (calculatedChecksum !== signature.checksum) {
          console.warn('Firma de webhook de Wompi inválida');
          return NextResponse.json({ message: 'Firma inválida' }, { status: 400 });
        }
      } catch (err) {
        console.error('Error validando firma de Wompi:', err);
      }
    }

    // Si la transacción fue aprobada en Wompi
    if (status === 'APPROVED') {
      // Buscar si existe la factura por invoiceNumber o id
      let invoice = await prisma.subscriptionInvoice.findFirst({
        where: {
          OR: [
            { invoiceNumber: reference },
            { id: reference },
            { referenceNumber: txId },
          ],
        },
        include: { business: true },
      });

      if (invoice && invoice.status !== 'PAID') {
        const now = new Date();
        const periodEnd = new Date(now);
        if (invoice.billingCycle === 'annual') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setDate(periodEnd.getDate() + 30);
        }

        // 1. Actualizar factura
        await prisma.subscriptionInvoice.update({
          where: { id: invoice.id },
          data: {
            status: 'PAID',
            paymentMethod: `Wompi (${payment_method_type || 'Online'})`,
            referenceNumber: txId,
            periodStart: now,
            periodEnd,
          },
        });

        // 2. Activar comercio
        await prisma.business.update({
          where: { id: invoice.businessId },
          data: {
            plan: invoice.plan,
            planStatus: 'ACTIVE',
            planExpiresAt: periodEnd,
            enableJukebox: invoice.plan === 'PRO' || invoice.plan === 'ENTERPRISE' ? true : undefined,
          },
        });

        console.log(`[Wompi Webhook] Plan ${invoice.plan} activado para ${invoice.business.name} (Ref: ${reference})`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error procesando webhook de Wompi:', err);
    return NextResponse.json({ message: 'Error procesando webhook' }, { status: 500 });
  }
}
