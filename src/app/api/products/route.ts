import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resolveBusinessId } from '@/lib/business';

export async function GET(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);

    const products = await prisma.product.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: { categoryRef: true },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const businessId = await resolveBusinessId(request);

    const body = await request.json();
    const { name, category, price, stock, description, imageUrl } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'El nombre y precio son requeridos' }, { status: 400 });
    }

    // Buscar categoría si existe para enlazarla
    let categoryId = null;
    if (category) {
      const cat = await prisma.category.findFirst({
        where: { businessId, name: category },
      });
      if (cat) categoryId = cat.id;
    }

    const product = await prisma.product.create({
      data: {
        name,
        category: category || 'General',
        price: Number(price),
        stock: stock || 'disponible',
        description: description || null,
        imageUrl: imageUrl || null,
        businessId,
        categoryId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error('Error al crear producto:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
