import React from "react";

interface Table {
  number: number;
  capacity: number;
  status: "free" | "occupied";
  totalSpent?: number;
  waiter?: string;
  orderCount?: number;
}

const initialTables: Table[] = [
  { number: 1, capacity: 4, status: "occupied", totalSpent: 45.00, waiter: "Juan M.", orderCount: 3 },
  { number: 2, capacity: 2, status: "free" },
  { number: 3, capacity: 6, status: "occupied", totalSpent: 112.50, waiter: "Sofia G.", orderCount: 5 },
  { number: 4, capacity: 4, status: "occupied", totalSpent: 34.50, waiter: "Juan M.", orderCount: 2 },
  { number: 5, capacity: 4, status: "free" },
  { number: 6, capacity: 8, status: "free" },
  { number: 7, capacity: 4, status: "occupied", totalSpent: 28.00, waiter: "Pedro P.", orderCount: 1 },
  { number: 8, capacity: 2, status: "occupied", totalSpent: 52.00, waiter: "Sofia G.", orderCount: 4 },
  { number: 9, capacity: 4, status: "free" },
  { number: 10, capacity: 6, status: "free" },
  { number: 11, capacity: 4, status: "free" },
  { number: 12, capacity: 4, status: "free" },
];

export default function MesasPage() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Monitoreo de Mesas</h2>
          <p className="text-sm text-zinc-400">Distribución física y estado en tiempo real de la sala.</p>
        </div>
        <div className="flex gap-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl text-xs font-semibold text-zinc-400">
          <button className="bg-zinc-800 text-white px-3 py-1.5 rounded-lg">Todas (12)</button>
          <button className="px-3 py-1.5 hover:text-white transition-all">Activas (5)</button>
          <button className="px-3 py-1.5 hover:text-white transition-all">Libres (7)</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-zinc-900/50 border border-zinc-900 rounded-2xl p-4">
        <div className="text-center p-3">
          <p className="text-xs text-zinc-500 font-medium">Mesas Totales</p>
          <p className="text-xl font-bold text-white mt-1">12</p>
        </div>
        <div className="text-center p-3 border-l border-zinc-800/80">
          <p className="text-xs text-zinc-500 font-medium">Mesas Ocupadas</p>
          <p className="text-xl font-bold text-orange-500 mt-1">5</p>
        </div>
        <div className="text-center p-3 border-l border-zinc-800/80">
          <p className="text-xs text-zinc-500 font-medium">Capacidad Total</p>
          <p className="text-xl font-bold text-white mt-1">52 pax</p>
        </div>
        <div className="text-center p-3 border-l border-zinc-800/80">
          <p className="text-xs text-zinc-500 font-medium">Total Estimado en Sala</p>
          <p className="text-xl font-bold text-emerald-500 mt-1">$272.00</p>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {initialTables.map((table) => (
          <div
            key={table.number}
            className={`border rounded-2xl p-5 flex flex-col justify-between h-48 transition-all ${
              table.status === "occupied"
                ? "bg-zinc-900 border-orange-500/30 hover:border-orange-500/60 shadow-lg shadow-orange-950/10"
                : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60"
            }`}
          >
            {/* Table Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-lg font-bold text-white">Mesa {table.number}</span>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Capacidad: {table.capacity} pax</p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                  table.status === "occupied"
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
              >
                {table.status === "occupied" ? "Ocupada" : "Libre"}
              </span>
            </div>

            {/* Table Details */}
            {table.status === "occupied" ? (
              <div className="flex flex-col gap-1.5 my-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Mesero:</span>
                  <span className="font-semibold text-zinc-200">{table.waiter}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Items:</span>
                  <span className="font-semibold text-zinc-200">{table.orderCount} ordenes</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-600 my-auto italic">Disponible para nuevos comensales</p>
            )}

            {/* Table Footer */}
            <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 mt-1">
              <span className="text-xs text-zinc-500">Mesa total:</span>
              <span className={`text-sm font-bold ${table.status === "occupied" ? "text-white" : "text-zinc-600"}`}>
                {table.status === "occupied" ? `$${table.totalSpent?.toFixed(2)}` : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
