import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

/**
 * Resuelve el businessId de forma robusta para multi-tenant y modo local:
 * 1. Desde el usuario autenticado (JWT Cookie)
 * 2. Desde el header x-business-code o query param ?businessCode=...
 * 3. Fallback: Negocio 'demo' o primer negocio de PostgreSQL
 */
export async function resolveBusinessId(request: Request): Promise<string> {
  // 1. Usuario autenticado
  const user = await getUserFromRequest(request);
  if (user?.businessId) {
    return user.businessId;
  }

  // 2. Parámetros de consulta o encabezado
  try {
    const url = new URL(request.url);
    const code =
      url.searchParams.get('businessCode') ||
      request.headers.get('x-business-code') ||
      request.headers.get('x-business-id');

    if (code) {
      const b = await prisma.business.findFirst({
        where: { OR: [{ code }, { id: code }] },
      });
      if (b) return b.id;
    }
  } catch {}

  // 3. Fallback: Buscar negocio demo o primer negocio en la BD
  let business = await prisma.business.findFirst({
    where: { OR: [{ code: 'demo' }, { name: 'EcoPOS Demo' }] },
  });

  if (!business) {
    business = await prisma.business.findFirst();
  }

  if (!business) {
    business = await prisma.business.create({
      data: {
        name: 'EcoPOS Demo',
        code: 'demo',
        phone: '555-0199',
        address: 'Av. Gastronómica #100',
      },
    });
  }

  return business.id;
}
