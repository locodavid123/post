import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // 1. Importamos nuestra instancia única de Prisma

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tableId, nickname } = body;

        if (!tableId || !nickname) {
            return NextResponse.json({ error: 'tableId y nickname son requeridos' }, { status: 400 });
        }

        // Usamos `upsert` para crear una nueva sesión si no existe,
        // o actualizar el nickname si ya existía una para esa mesa.
        const session = await prisma.tableSession.upsert({
            where: { tableId: tableId },
            update: { nickname: nickname },
            create: {
                tableId: tableId,
                nickname: nickname,
            },
        });

        // Devolvemos la sesión creada o actualizada.
        return NextResponse.json(session, { status: 200 });

    } catch (error: any) {
        // Manejo de error si el tableId ya está tomado (aunque upsert lo maneja)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Ya existe una sesión para esta mesa.' }, { status: 409 });
        }
        console.error('Error al registrar la sesión:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
