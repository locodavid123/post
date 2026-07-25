import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // 1. Importamos nuestra instancia única de Prisma

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { song, tableId } = body;

        if (!song || !tableId) {
            return NextResponse.json({ error: 'Faltan datos de la canción o de la mesa' }, { status: 400 });
        }

        // 1. Buscamos la sesión activa para esa mesa
        const tableSession = await prisma.tableSession.findUnique({
            where: { tableId },
        });

        if (!tableSession) {
            return NextResponse.json({ error: 'No se encontró una sesión para esta mesa. Regístrate primero.' }, { status: 404 });
        }

        // 2. Verificamos tu restricción: "no me permita colocar más de una canción en lista de espera"
        const existingRequest = await prisma.songRequest.findFirst({
            where: {
                requestedById: tableSession.id,
                status: 'PENDING',
            },
        });

        if (existingRequest) {
            return NextResponse.json({ error: 'Ya tienes una canción en la cola de espera.' }, { status: 409 }); // 409 Conflict
        }

        // 3. Si pasa las validaciones, creamos la solicitud en la base de datos
        const newSongRequest = await prisma.songRequest.create({
            data: {
                youtubeId: song.id,
                title: song.title,
                artist: song.artist,
                thumbnailUrl: song.thumbnail,
                status: 'PENDING',
                requestedById: tableSession.id, // Vinculamos la canción con la sesión de la mesa
            },
        });

        return NextResponse.json(newSongRequest, { status: 201 }); // 201 Created

    } catch (error) {
        console.error('Error al solicitar la canción:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
