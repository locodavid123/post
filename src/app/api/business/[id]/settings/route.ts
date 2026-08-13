import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const business = await prisma.business.findUnique({ where: { id } });
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const { enableJukebox, enableQrOrders, alertSound, address, phone, name } = body;

  try {
    const business = await prisma.business.update({
      where: { id },
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
