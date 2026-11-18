import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
}

function StatCard({ title, value, change, positive = true }: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</span>
      <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
      <span className={`text-xs font-medium ${positive ? "text-emerald-500" : "text-rose-500"}`}>
        {change}
      </span>
    </div>
  );
}

export default async function AdminDashboard() {
  const [
    businessesCount,
    usersCount,
    songRequestsCount,
    productsCount,
    recentBusinesses,
    salesAggregate,
    recentSales,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.user.count(),
    prisma.songRequest.count(),
    prisma.product.count(),
    prisma.business.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        users: { select: { email: true, name: true } },
        _count: { select: { tables: true, products: true, sales: true } },
      },
    }),
    prisma.sale.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: { status: "Completado" },
    }),
    prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { business: { select: { name: true } } },
    }),
  ]);

  const totalRevenue = salesAggregate._sum.total || 0;
  const totalSalesCount = salesAggregate._count.id || 0;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Resumen General de la Plataforma</h2>
          <p className="text-sm text-zinc-400">Panel administrativo con métricas e indicadores reales conectados a PostgreSQL.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/negocios"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/15"
          >
            Gestionar Negocios
          </Link>
          <Link
            href="/admin/usuarios"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            Gestionar Usuarios
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard
          title="Facturación Global"
          value={`$${totalRevenue.toFixed(2)}`}
          change={`${totalSalesCount} transacciones en BD`}
        />
        <StatCard
          title="Comercios Registrados"
          value={`${businessesCount} locales`}
          change="En base de datos"
        />
        <StatCard
          title="Usuarios Totales"
          value={`${usersCount} cuentas`}
          change="Usuarios del sistema"
        />
        <StatCard
          title="Catálogo Total"
          value={`${productsCount} productos`}
          change="En la plataforma"
        />
        <StatCard
          title="Peticiones Jukebox"
          value={`${songRequestsCount} canciones`}
          change="Histórico de canciones"
        />
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Nuevos Registros de Locales</h3>
            <Link href="/admin/negocios" className="text-xs text-orange-500 hover:text-orange-400 font-semibold transition-all">
              Ver todos los negocios →
            </Link>
          </div>

          {recentBusinesses.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No hay comercios registrados aún.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentBusinesses.map((biz) => {
                const owner = biz.users[0]?.name || biz.users[0]?.email || "Sin asignar";
                return (
                  <div
                    key={biz.id}
                    className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{biz.name}</h4>
                      <p className="text-xs text-zinc-500">
                        Código: <span className="text-orange-400 font-mono">{biz.code || biz.id.slice(0, 8)}</span> • Titular: {owner}
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {biz._count.tables} mesas • {biz._count.products} productos • {biz._count.sales} ventas
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Activo
                      </span>
                      <Link
                        href={`/admin/negocios/${biz.id}`}
                        className="text-xs text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-800 transition"
                      >
                        Ver Detalle
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Server & Service Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white">Estado de la Plataforma</h3>
          <div className="flex flex-col gap-3">
            {[
              { name: "PostgreSQL Database", status: "Conectado", note: "Prisma v7 ORM" },
              { name: "API Routes & Auth", status: "Activo", note: "JWT + Middleware Edge" },
              { name: "Jukebox Service", status: "Activo", note: "Cola FIFO YouTube" },
              { name: "Aislamiento Multi-Tenant", status: "Protegido", note: "Filtrado por businessId" },
            ].map((srv, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                <div>
                  <h4 className="text-xs font-semibold text-white">{srv.name}</h4>
                  <p className="text-[10px] text-zinc-500">{srv.note}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {srv.status}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-800 pt-4 flex flex-col gap-2">
            <h4 className="text-xs font-semibold uppercase text-zinc-500">Últimas Ventas Registradas</h4>
            {recentSales.length === 0 ? (
              <p className="text-xs text-zinc-600">Sin ventas aún.</p>
            ) : (
              recentSales.map((s) => (
                <div key={s.id} className="flex justify-between items-center text-xs py-1 border-b border-zinc-900/50">
                  <div>
                    <span className="text-zinc-200 font-medium">{s.invoiceNumber}</span>
                    <span className="text-zinc-500 ml-1.5 font-normal">({s.business?.name || "Local"})</span>
                  </div>
                  <span className="font-bold text-emerald-400">${s.total.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
