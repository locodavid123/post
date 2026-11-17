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
  const [businessesCount, usersCount, songRequestsCount, productsCount, recentBusinesses] = await Promise.all([
    prisma.business.count(),
    prisma.user.count(),
    prisma.songRequest.count(),
    prisma.product.count(),
    prisma.business.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { users: { select: { email: true, name: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Resumen General de la Plataforma</h2>
        <p className="text-sm text-zinc-400">Panel administrativo con métricas e indicadores reales conectados a PostgreSQL.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Comercios Registrados" value={`${businessesCount} locales`} change="En base de datos" />
        <StatCard title="Usuarios Totales" value={`${usersCount} cuentas`} change="Usuarios del sistema" />
        <StatCard title="Catálogo Total" value={`${productsCount} productos`} change="En la plataforma" />
        <StatCard title="Peticiones Jukebox" value={`${songRequestsCount} canciones`} change="Histórico de canciones" />
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Registrations */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Nuevos Registros de Locales</h3>
            <Link href="/admin/negocios" className="text-xs text-orange-500 hover:text-orange-400 font-semibold transition-all">
              Ver todos los negocios
            </Link>
          </div>

          {recentBusinesses.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No hay comercios registrados aún.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recentBusinesses.map((biz) => {
                const owner = biz.users[0]?.name || biz.users[0]?.email || "Sin asignar";
                return (
                  <div key={biz.id} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all">
                    <div>
                      <h4 className="text-sm font-bold text-white">{biz.name}</h4>
                      <p className="text-xs text-zinc-500">
                        Código: <span className="text-orange-400 font-mono">{biz.code || biz.id.slice(0, 8)}</span> • Titular: {owner}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      Activo
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Server & Service Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white">Estado de la Plataforma</h3>
          <div className="flex flex-col gap-4">
            
            {[
              { name: "PostgreSQL Database", status: "Conectado", note: "Prisma v7 ORM" },
              { name: "API Routes & Auth", status: "Activo", note: "JWT + Middleware Edge" },
              { name: "Jukebox Service", status: "Activo", note: "Cola FIFO YouTube" },
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
        </div>

      </div>
    </div>
  );
}
