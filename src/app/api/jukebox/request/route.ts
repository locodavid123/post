import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { song, tableId = 'admin' } = body;

        if (!song || !song.id || !song.title) {
            return NextResponse.json({ error: 'Faltan datos obligatorios de la canción.' }, { status: 400 });
        }

        const effectiveTableId = tableId || 'admin';

        // 1. Buscamos o creamos la sesión para esta mesa o para el Administrador
        let tableSession = await prisma.tableSession.findUnique({
            where: { tableId: effectiveTableId },
        });

        if (!tableSession) {
            // Si es solicitud del panel de administración o barra, auto-creamos la sesión
            if (
                effectiveTableId === 'admin' ||
                effectiveTableId === 'barra' ||
                effectiveTableId.toLowerCase().includes('admin')
            ) {
                tableSession = await prisma.tableSession.create({
                    data: {
                        tableId: effectiveTableId,
                        nickname: 'Administrador',
                    },
                });
            } else {
                return NextResponse.json(
                    { error: 'No se encontró una sesión para esta mesa. Regístrate primero.' },
                    { status: 404 }
                );
            }
        }

        // 2. Para mesas regulares (no admin), aplicamos restricción de 1 canción en espera
        const isAdmin =
            effectiveTableId.toLowerCase().includes('admin') ||
            tableSession.nickname.toLowerCase().includes('admin');

        if (!isAdmin) {
            const existingRequest = await prisma.songRequest.findFirst({
                where: {
                    requestedById: tableSession.id,
                    status: 'PENDING',
                },
            });

            if (existingRequest) {
                return NextResponse.json(
                    { error: 'Ya tienes una canción en la cola de espera.' },
                    { status: 409 }
                );
            }
        }

        // 3. Crear la solicitud en la base de datos
        const newSongRequest = await prisma.songRequest.create({
            data: {
                youtubeId: song.id,
                title: song.title,
                artist: song.artist || 'YouTube',
                thumbnailUrl:
                    song.thumbnail ||
                    `https://img.youtube.com/vi/${song.id}/hqdefault.jpg`,
                status: 'PENDING',
                requestedById: tableSession.id,
            },
            include: {
                requestedBy: true,
            },
        });

        return NextResponse.json(newSongRequest, { status: 201 });
    } catch (error) {
        console.error('Error al solicitar la canción:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al procesar la solicitud.' },
            { status: 500 }
        );
    }
}
