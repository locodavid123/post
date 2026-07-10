import React from "react";
import Link from "next/link";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  positive?: boolean;
}

function MetricCard({ title, value, change, icon, positive = true }: MetricCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-zinc-400">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        <span className={`text-xs font-semibold ${positive ? "text-emerald-500" : "text-amber-500"}`}>
          {change}
        </span>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">¡Hola, Administrador!</h2>
          <p className="text-sm text-zinc-400">Resumen y estado actual de tu restaurante para hoy.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/client/mesas"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/15"
          >
            Ver Mesas Activas
          </Link>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ventas del Día"
          value="$1,245.50"
          change="+15.3% vs. ayer"
          icon="💰"
        />
        <MetricCard
          title="Mesas Ocupadas"
          value="8 / 12"
          change="66% ocupación"
          icon="🪑"
        />
        <MetricCard
          title="Pedidos Pendientes"
          value="3 en cola"
          change="Promedio: 12 min"
          icon="🍔"
          positive={false}
        />
        <MetricCard
          title="Jukebox Activo"
          value="4 temas"
          change="Canción sonando: Sweet Child O' Mine"
          icon="🎵"
        />
      </div>

      {/* Main sections layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recents Orders */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white">Pedidos Recientes</h3>
          <div className="flex flex-col gap-4">
            {[
              { id: "#1032", table: "Mesa 4", time: "Hace 3 min", status: "En Cocina", total: "$34.50" },
              { id: "#1031", table: "Mesa 8", time: "Hace 8 min", status: "Listo para entregar", total: "$52.00" },
              { id: "#1030", table: "Mesa 2", time: "Hace 15 min", status: "Entregado", total: "$18.50" },
            ].map((order, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-semibold text-orange-400 text-sm">
                    {order.table}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{order.id}</h4>
                    <p className="text-xs text-zinc-500">{order.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      order.status === "En Cocina"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : order.status === "Listo para entregar"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-white">{order.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Music request queue */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white">Temas en Jukebox</h3>
          <div className="flex flex-col gap-4">
            {[
              { title: "Sweet Child O' Mine", artist: "Guns N' Roses", requestedBy: "Mesa 4", status: "Sonando" },
              { title: "Bohemian Rhapsody", artist: "Queen", requestedBy: "Mesa 2", status: "Siguiente" },
              { title: "Hotel California", artist: "Eagles", requestedBy: "Mesa 7", status: "En Cola" },
            ].map((song, idx) => (
              <div key={idx} className="flex flex-col gap-2 p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-semibold text-white line-clamp-1">{song.title}</h4>
                    <p className="text-xs text-zinc-500">{song.artist}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      song.status === "Sonando"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                    }`}
                  >
                    {song.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-zinc-900 pt-2">
                  <span>Pedida por: <strong className="text-zinc-400">{song.requestedBy}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
