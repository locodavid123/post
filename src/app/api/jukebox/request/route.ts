import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { song, businessCode, tableId = 'admin' } = body;

        if (!song || !song.id || !song.title) {
            return NextResponse.json({ error: 'Faltan datos obligatorios de la canción.' }, { status: 400 });
        }

        let businessId = '';
        
        if (businessCode) {
            const business = await prisma.business.findUnique({ where: { code: businessCode } });
            if (!business) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
            businessId = business.id;
        } else {
            // Si viene desde el admin panel, buscamos el usuario
            const user = await getUserFromRequest(request);
            if (!user || !user.businessId) return NextResponse.json({ error: 'Unauthorized or no businessId' }, { status: 401 });
            businessId = user.businessId;
        }

        const effectiveTableId = tableId || 'admin';

        // 1. Buscamos o creamos la sesión para esta mesa o para el Administrador
        let tableSession = await prisma.tableSession.findUnique({
            where: { businessId_tableId: { businessId, tableId: effectiveTableId } },
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
                        businessId
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
                businessId
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
