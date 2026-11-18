import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function PUT(
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
    const body = await request.json();
    const { name, role, businessId, password } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name ? String(name).trim() : null;
    if (role !== undefined) {
      const validRoles = ['USER', 'ADMIN', 'SUPERADMIN'];
      if (validRoles.includes(role)) {
        dataToUpdate.role = role;
      }
    }
    if (businessId !== undefined) {
      dataToUpdate.businessId = businessId === '' ? null : businessId;
    }
    if (password && String(password).trim().length >= 6) {
      dataToUpdate.password = await bcrypt.hash(String(password).trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
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

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    return NextResponse.json({ message: 'Error al actualizar usuario' }, { status: 500 });
  }
}

export async function DELETE(
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
    // Evitar que el administrador se elimine a sí mismo
    if (currentUser && currentUser.id === id) {
      return NextResponse.json({ message: 'No puedes eliminar tu propia cuenta en sesión' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Usuario eliminado con éxito' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    return NextResponse.json({ message: 'Error al eliminar usuario' }, { status: 500 });
  }
}
