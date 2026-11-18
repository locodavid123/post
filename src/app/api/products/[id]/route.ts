import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveBusinessId } from '@/lib/business';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = await resolveBusinessId(request);

    const { id } = params;
    const body = await request.json();
    const { name, category, price, stock, description, imageUrl } = body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.businessId !== businessId) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        category: category !== undefined ? category : undefined,
        price: price !== undefined ? Number(price) : undefined,
        stock: stock !== undefined ? stock : undefined,
        description: description !== undefined ? description : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = await resolveBusinessId(request);

    const { id } = params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.businessId !== businessId) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
