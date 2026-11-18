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
            if (business) {
                businessId = business.id;
            }
        }

        if (!businessId) {
            const user = await getUserFromRequest(request);
            if (user?.businessId) {
                businessId = user.businessId;
            }
        }

        // Fallback: Si no hay negocio autenticado aún, auto-asociar al negocio demo
        if (!businessId) {
            let defaultBusiness = await prisma.business.findFirst({
                where: { OR: [{ code: 'demo' }, { name: 'Demo' }] },
            });
            if (!defaultBusiness) {
                defaultBusiness = await prisma.business.findFirst();
            }
            if (!defaultBusiness) {
                defaultBusiness = await prisma.business.create({
                    data: {
                        name: 'EcoPOS Demo',
                        code: 'demo',
                    },
                });
            }
            businessId = defaultBusiness.id;
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
