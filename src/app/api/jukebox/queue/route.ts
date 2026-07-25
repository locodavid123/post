import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // 1. Importamos nuestra instancia única de Prisma

export async function GET() {
    try {
        // 1. Consultamos a la base de datos usando Prisma
        const queue = await prisma.songRequest.findMany({
            where: {
                // Solo traemos las canciones que no han sonado
                status: {
                    in: ['PENDING', 'PLAYING'],
                },
            },
            // 2. Las ordenamos por fecha de creación para que sea una cola FIFO
            orderBy: {
                createdAt: 'asc',
            },
            // 3. Incluimos la información de la mesa que la pidió
            include: {
                requestedBy: true,
            },
        });

        return NextResponse.json(queue);
    } catch (error) {
        console.error('Error fetching queue:', error);
        return NextResponse.json({ error: 'Error al obtener la cola de reproducción' }, { status: 500 });
    }
}
