import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, songId } = body;

        if (!action) {
            return NextResponse.json({ error: 'La acción es requerida' }, { status: 400 });
        }

        if (action === 'NEXT') {
            // 1. Marcar la canción en reproducción como PLAYED
            await prisma.songRequest.updateMany({
                where: { status: 'PLAYING' },
                data: { status: 'PLAYED' },
            });

            // 2. Obtener la siguiente canción PENDING
            const nextSong = await prisma.songRequest.findFirst({
                where: { status: 'PENDING' },
                orderBy: { createdAt: 'asc' },
                include: { requestedBy: true },
            });

            if (nextSong) {
                // Marcar como PLAYING
                const updated = await prisma.songRequest.update({
                    where: { id: nextSong.id },
                    data: { status: 'PLAYING' },
                    include: { requestedBy: true },
                });
                return NextResponse.json({ message: 'Siguiente canción en reproducción', currentSong: updated });
            }

            return NextResponse.json({ message: 'No hay más canciones en la cola', currentSong: null });
        }

        if (action === 'PLAY' && songId) {
            // 1. Pasar la canción actual PLAYING a PLAYED
            await prisma.songRequest.updateMany({
                where: { status: 'PLAYING' },
                data: { status: 'PLAYED' },
            });

            // 2. Pasar la canción elegida a PLAYING
            const nowPlaying = await prisma.songRequest.update({
                where: { id: songId },
                data: { status: 'PLAYING' },
                include: { requestedBy: true },
            });

            return NextResponse.json({ message: 'Canción iniciada', currentSong: nowPlaying });
        }

        if (action === 'DELETE' && songId) {
            await prisma.songRequest.delete({
                where: { id: songId },
            });
            return NextResponse.json({ message: 'Canción eliminada de la cola' });
        }

        if (action === 'FINISH' && songId) {
            await prisma.songRequest.update({
                where: { id: songId },
                data: { status: 'PLAYED' },
            });
            return NextResponse.json({ message: 'Canción marcada como reproducida' });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    } catch (error) {
        console.error('Error en control de jukebox:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
