import React from "react";
import Link from "next/link";

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

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Resumen General de la Plataforma</h2>
        <p className="text-sm text-zinc-400">Panel administrativo con métricas e indicadores de todos los comercios adheridos.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Comercios Activos" value="124 locales" change="+8 este mes" />
        <StatCard title="MRR (Ingreso Mensual)" value="$15,240.00" change="+14.5% vs mes anterior" />
        <StatCard title="Suscripciones Premium" value="98 / 124" change="79% del total" />
        <StatCard title="Uso del Jukebox" value="3,240 temas" change="Promedio de 26/local por día" />
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Registrations */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Nuevos Registros</h3>
            <Link href="/admin/negocios" className="text-xs text-orange-500 hover:text-orange-400 font-semibold transition-all">
              Ver todos los negocios
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { name: "Pizzería Nápoles", plan: "Premium Pro", date: "Hoy, 09:12 AM", status: "Activo" },
              { name: "Sándwiches del Bosque", plan: "Gratuito", date: "Ayer, 06:45 PM", status: "Pendiente" },
              { name: "La Birrería Club", plan: "Premium Standard", date: "Ayer, 03:20 PM", status: "Activo" },
            ].map((reg, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all">
                <div>
                  <h4 className="text-sm font-bold text-white">{reg.name}</h4>
                  <p className="text-xs text-zinc-500">Plan: <span className="text-zinc-300 font-medium">{reg.plan}</span> • {reg.date}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  reg.status === "Activo"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Server & Service Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white">Estado de la Red</h3>
          <div className="flex flex-col gap-4">
            
            {/* System Statuses */}
            {[
              { name: "API Gateways", status: "Operativo", latency: "42ms" },
              { name: "Bases de Datos", status: "Operativo", latency: "12ms" },
              { name: "Servidor Jukebox WebSockets", status: "Carga Alta", latency: "140ms", warning: true },
            ].map((srv, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                <div>
                  <h4 className="text-xs font-semibold text-white">{srv.name}</h4>
                  <p className="text-[10px] text-zinc-500">Latencia: {srv.latency}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  srv.warning
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}>
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
