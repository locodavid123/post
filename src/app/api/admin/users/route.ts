import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!isAdmin(user) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        businessId: true,
        business: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const currentUser = await getUserFromRequest(request);
  if (!isAdmin(currentUser) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, password, name, role, businessId } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Correo y contraseña requeridos' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json({ message: 'El correo electrónico ya está registrado' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const validRoles = ['USER', 'ADMIN', 'SUPERADMIN'];
    const assignedRole = validRoles.includes(role) ? role : 'USER';

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name ? name.trim() : null,
        role: assignedRole,
        businessId: businessId || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        businessId: true,
        business: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    return NextResponse.json({ message: 'Error al crear usuario' }, { status: 500 });
  }
}
