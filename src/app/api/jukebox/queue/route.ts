// Trigger type check
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // 1. Importamos nuestra instancia única de Prisma
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const businessCode = url.searchParams.get('businessCode');
        
        let businessId = '';

        if (businessCode) {
            const business = await prisma.business.findUnique({ where: { code: businessCode } });
            if (!business) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
            businessId = business.id;
        } else {
            const user = await getUserFromRequest(request);
            if (!user || !user.businessId) return NextResponse.json({ error: 'Unauthorized or no businessId' }, { status: 401 });
            businessId = user.businessId;
        }

        // 1. Consultamos a la base de datos usando Prisma
        const queue = await prisma.songRequest.findMany({
            where: {
                // Solo traemos las canciones que no han sonado
                status: {
                    in: ['PENDING', 'PLAYING'],
                },
                businessId: businessId,
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
