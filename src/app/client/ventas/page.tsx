import React from "react";

interface Sale {
  id: string;
  table: string;
  total: number;
  paymentMethod: "Efectivo" | "Tarjeta" | "Transferencia";
  time: string;
  status: "Completado" | "Cancelado";
}

const recentSales: Sale[] = [
  { id: "FAC-1002", table: "Mesa 10", total: 84.00, paymentMethod: "Tarjeta", time: "10:15 AM", status: "Completado" },
  { id: "FAC-1001", table: "Mesa 2", total: 18.50, paymentMethod: "Efectivo", time: "09:48 AM", status: "Completado" },
  { id: "FAC-1000", table: "Mesa 5", total: 42.00, paymentMethod: "Transferencia", time: "09:30 AM", status: "Completado" },
  { id: "FAC-0999", table: "Mesa 1", total: 65.00, paymentMethod: "Tarjeta", time: "Ayer 11:45 PM", status: "Completado" },
  { id: "FAC-0998", table: "Mesa 3", total: 124.20, paymentMethod: "Tarjeta", time: "Ayer 11:20 PM", status: "Completado" },
  { id: "FAC-0997", table: "Mesa 12", total: 38.00, paymentMethod: "Efectivo", time: "Ayer 10:10 PM", status: "Completado" },
];

export default function VentasPage() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Registro de Ventas</h2>
        <p className="text-sm text-zinc-400">Consulta de facturación, cierres de caja e ingresos del comercio.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Facturado Hoy</p>
          <p className="text-3xl font-bold text-white mt-2">$144.50</p>
          <div className="flex gap-2 items-center mt-3 text-xs text-emerald-500 font-semibold">
            <span>📈</span>
            <span>+12.4% vs promedio diario</span>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Transacciones Realizadas</p>
          <p className="text-3xl font-bold text-white mt-2">3 Ventas</p>
          <div className="flex gap-2 items-center mt-3 text-xs text-zinc-400 font-medium">
            <span>Ticket promedio:</span>
            <span className="text-white font-bold">$48.16</span>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Métodos de Pago Utilizados</p>
          <div className="flex flex-col gap-1.5 mt-3">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>💳 Tarjeta (2):</span>
              <span className="font-bold text-white">$126.00</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>💵 Efectivo (1):</span>
              <span className="font-bold text-white">$18.50</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Transacciones Recientes</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar factura..."
              className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs px-4 py-2 rounded-xl focus:border-orange-500 focus:outline-none w-48 transition-all"
            />
            <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs px-3 py-2 rounded-xl transition-all">
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950 text-zinc-300 font-semibold text-xs border-b border-zinc-800 uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">ID Factura</th>
                <th className="p-4">Origen</th>
                <th className="p-4">Hora</th>
                <th className="p-4">Método de Pago</th>
                <th className="p-4">Estado</th>
                <th className="p-4 pr-6 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-zinc-900/50 transition-all">
                  <td className="p-4 pl-6 font-semibold text-white">{sale.id}</td>
                  <td className="p-4 text-zinc-300">{sale.table}</td>
                  <td className="p-4 text-xs text-zinc-500">{sale.time}</td>
                  <td className="p-4 text-xs">
                    <span className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700/50 font-medium">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-xs">
                    <span className={`font-semibold ${
                      sale.status === "Completado" ? "text-emerald-500" : "text-rose-500"
                    }`}>
                      ● {sale.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right font-bold text-white">${sale.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
