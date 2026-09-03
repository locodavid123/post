import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

  // allow admins to pass ?businessId to manage other businesses
  const url = new URL(request.url);
  const qBusinessId = url.searchParams.get('businessId');
  const targetBusinessId = isAdmin(user) && qBusinessId ? qBusinessId : user.businessId;
  if (!targetBusinessId) return new Response(JSON.stringify({ message: 'No business associated' }), { status: 400 });

  try {
    const business = await prisma.business.findUnique({ where: { id: targetBusinessId } });
    if (!business) return new Response(JSON.stringify({ message: 'Business not found' }), { status: 404 });

    const settings = {
      enableJukebox: business.enableJukebox,
      enableQrOrders: business.enableQrOrders,
      alertSound: business.alertSound,
      address: business.address,
      phone: business.phone,
      name: business.name,
      code: business.code,
    };

    return new Response(JSON.stringify({ settings }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Error fetching settings' }), { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

  const url = new URL(request.url);
  const qBusinessId = url.searchParams.get('businessId');
  const targetBusinessId = isAdmin(user) && qBusinessId ? qBusinessId : user.businessId;
  if (!targetBusinessId) return new Response(JSON.stringify({ message: 'No business associated' }), { status: 400 });

  const body = await request.json().catch(() => ({}));
  const { enableJukebox, enableQrOrders, alertSound, address, phone, name } = body;

  try {
    const business = await prisma.business.update({
      where: { id: targetBusinessId },
      data: {
        enableJukebox: typeof enableJukebox === 'boolean' ? enableJukebox : undefined,
        enableQrOrders: typeof enableQrOrders === 'boolean' ? enableQrOrders : undefined,
        alertSound: alertSound ?? undefined,
        address: address ?? undefined,
        phone: phone ?? undefined,
        name: name ?? undefined,
      },
    });

    return new Response(JSON.stringify({ settings: business }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Error updating settings' }), { status: 500 });
  }
}
