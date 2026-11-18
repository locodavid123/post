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

    if (products.length === 0) {
      // Auto-inicializar catálogo inicial si el negocio aún no tiene productos registrados
      const starterProducts = [
        { name: "Hamburguesa EcoClassic", category: "Hamburguesas", price: 12.50, stock: "disponible", description: "Carne de res premium 150g, queso cheddar derretido, lechuga orgánica, tomate fresco y salsa especial." },
        { name: "Papas Fritas Crujientes", category: "Entradas", price: 4.50, stock: "disponible", description: "Papas cortadas a mano con sal marina y pimentón ahumado." },
        { name: "Cerveza Artesanal IPA", category: "Bebidas", price: 5.00, stock: "disponible", description: "Cerveza artesanal de la casa, notas intensas de lúpulo y cítricos." },
        { name: "Refresco de Cola de la Casa", category: "Bebidas", price: 2.50, stock: "disponible", description: "Bebida refrescante carbonatada con toques naturales de cola." },
        { name: "Volcán de Chocolate", category: "Postres", price: 6.00, stock: "disponible", description: "Bizcocho tibio de chocolate relleno de fudge derretido con helado de vainilla." },
      ];

      for (const prod of starterProducts) {
        await prisma.product.create({
          data: {
            businessId,
            name: prod.name,
            category: prod.category,
            price: prod.price,
            stock: prod.stock,
            description: prod.description,
          },
        });
      }

      const created = await prisma.product.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        include: { categoryRef: true },
      });
      return NextResponse.json(created);
    }

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
