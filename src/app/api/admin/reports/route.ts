import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!isAdmin(user) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  try {
    const [sales, businesses, songRequests, productsCount] = await Promise.all([
      prisma.sale.findMany({
        orderBy: { createdAt: 'asc' },
        include: { business: { select: { id: true, name: true } } },
      }),
      prisma.business.findMany({
        orderBy: { createdAt: 'asc' },
        include: { _count: { select: { sales: true, tables: true, products: true } } },
      }),
      prisma.songRequest.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { business: { select: { name: true } } },
      }),
      prisma.product.count(),
    ]);

    // 1. Agrupación de ingresos por mes
    const monthlyRevenueMap: Record<string, { label: string; total: number; count: number }> = {};
    const monthlySignupsMap: Record<string, { label: string; count: number }> = {};

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Inicializar últimos 6 meses
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyRevenueMap[key] = { label, total: 0, count: 0 };
      monthlySignupsMap[key] = { label, count: 0 };
    }

    let totalRevenue = 0;
    let completedSalesCount = 0;
    let cancelledSalesCount = 0;

    const paymentMethods: Record<string, { count: number; total: number }> = {
      Efectivo: { count: 0, total: 0 },
      Tarjeta: { count: 0, total: 0 },
      Transferencia: { count: 0, total: 0 },
    };

    const businessRevenueMap: Record<string, { name: string; total: number; count: number }> = {};

    for (const s of sales) {
      if (s.status === 'Completado') {
        totalRevenue += s.total;
        completedSalesCount++;

        const d = new Date(s.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyRevenueMap[key]) {
          monthlyRevenueMap[key].total += s.total;
          monthlyRevenueMap[key].count += 1;
        }

        const method = s.paymentMethod || 'Efectivo';
        if (!paymentMethods[method]) paymentMethods[method] = { count: 0, total: 0 };
        paymentMethods[method].count += 1;
        paymentMethods[method].total += s.total;

        const bizName = s.business?.name || 'Local sin nombre';
        if (!businessRevenueMap[s.businessId]) {
          businessRevenueMap[s.businessId] = { name: bizName, total: 0, count: 0 };
        }
        businessRevenueMap[s.businessId].total += s.total;
        businessRevenueMap[s.businessId].count += 1;
      } else {
        cancelledSalesCount++;
      }
    }

    for (const b of businesses) {
      const d = new Date(b.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlySignupsMap[key]) {
        monthlySignupsMap[key].count += 1;
      }
    }

    const monthlyRevenue = Object.values(monthlyRevenueMap);
    const monthlySignups = Object.values(monthlySignupsMap);
    const topBusinesses = Object.values(businessRevenueMap).sort((a, b) => b.total - a.total).slice(0, 5);

    return NextResponse.json({
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        completedSalesCount,
        cancelledSalesCount,
        totalBusinesses: businesses.length,
        totalProducts: productsCount,
        totalSongs: songRequests.length,
      },
      monthlyRevenue,
      monthlySignups,
      paymentMethods,
      topBusinesses,
      recentSongs: songRequests,
    });
  } catch (err) {
    console.error('Error calculando reportes:', err);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
