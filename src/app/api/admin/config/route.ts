import { NextResponse } from 'next/server';
import { getUserFromRequest, isAdmin } from '@/lib/auth';
import { readConfig, writeConfig } from '@/lib/systemConfig';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!isAdmin(user) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const config = await readConfig();
  // Mask secret key if set
  const safeConfig = {
    ...config,
    stripeSecretKey: config.stripeSecretKey ? '••••••••••••••••' : '',
  };
  return NextResponse.json(safeConfig);
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!isAdmin(user) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const current = await readConfig();

    const updated = {
      ...current,
      platformName: body.platformName !== undefined ? String(body.platformName).trim() : current.platformName,
      supportEmail: body.supportEmail !== undefined ? String(body.supportEmail).trim() : current.supportEmail,
      currency: body.currency !== undefined ? String(body.currency).trim() : current.currency,
      standardPlanPrice: body.standardPlanPrice !== undefined ? Number(body.standardPlanPrice) : current.standardPlanPrice,
      proPlanPrice: body.proPlanPrice !== undefined ? Number(body.proPlanPrice) : current.proPlanPrice,
      enterprisePlanPrice: body.enterprisePlanPrice !== undefined ? Number(body.enterprisePlanPrice) : current.enterprisePlanPrice,
      allowSelfRegistration: body.allowSelfRegistration !== undefined ? Boolean(body.allowSelfRegistration) : current.allowSelfRegistration,
      // Datos Bancarios de Transferencia Directa (Cualquier Banco)
      bankName: body.bankName !== undefined ? String(body.bankName).trim() : (current.bankName || 'Bancolombia'),
      bankAccount: body.bankAccount !== undefined ? String(body.bankAccount).trim() : (body.bancolombiaAccount !== undefined ? String(body.bancolombiaAccount).trim() : (current.bankAccount || current.bancolombiaAccount || '')),
      bankType: body.bankType !== undefined ? String(body.bankType).trim() : (body.bancolombiaType !== undefined ? String(body.bancolombiaType).trim() : (current.bankType || current.bancolombiaType || 'Ahorros')),
      bankHolder: body.bankHolder !== undefined ? String(body.bankHolder).trim() : (body.bancolombiaHolder !== undefined ? String(body.bancolombiaHolder).trim() : (current.bankHolder || current.bancolombiaHolder || '')),
      bancolombiaAccount: body.bankAccount !== undefined ? String(body.bankAccount).trim() : (body.bancolombiaAccount !== undefined ? String(body.bancolombiaAccount).trim() : (current.bancolombiaAccount || '')),
      bancolombiaType: body.bankType !== undefined ? String(body.bankType).trim() : (body.bancolombiaType !== undefined ? String(body.bancolombiaType).trim() : (current.bancolombiaType || 'Ahorros')),
      bancolombiaHolder: body.bankHolder !== undefined ? String(body.bankHolder).trim() : (body.bancolombiaHolder !== undefined ? String(body.bancolombiaHolder).trim() : (current.bancolombiaHolder || '')),
      nequiNumber: body.nequiNumber !== undefined ? String(body.nequiNumber).trim() : (current.nequiNumber || ''),
      nequiHolder: body.nequiHolder !== undefined ? String(body.nequiHolder).trim() : (current.nequiHolder || ''),
      daviplataNumber: body.daviplataNumber !== undefined ? String(body.daviplataNumber).trim() : (current.daviplataNumber || ''),
      daviplataHolder: body.daviplataHolder !== undefined ? String(body.daviplataHolder).trim() : (current.daviplataHolder || ''),
      paymentInstructions: body.paymentInstructions !== undefined ? String(body.paymentInstructions).trim() : (current.paymentInstructions || ''),
      wompiPublicKey: body.wompiPublicKey !== undefined ? String(body.wompiPublicKey).trim() : current.wompiPublicKey,
      wompiSandbox: body.wompiSandbox !== undefined ? Boolean(body.wompiSandbox) : current.wompiSandbox,
      stripePublicKey: body.stripePublicKey !== undefined ? String(body.stripePublicKey).trim() : current.stripePublicKey,
      stripeSecretKey: body.stripeSecretKey && !body.stripeSecretKey.includes('••••') ? String(body.stripeSecretKey).trim() : current.stripeSecretKey,
    };

    await writeConfig(updated);
    return NextResponse.json({ message: 'Configuración guardada con éxito', config: updated });
  } catch (err) {
    console.error('Error saving config:', err);
    return NextResponse.json({ message: 'Error al guardar configuración' }, { status: 500 });
  }
}
