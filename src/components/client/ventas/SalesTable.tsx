import React from "react";
import { Sale } from "./types";

interface SalesTableProps {
  sales: Sale[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  formatSaleDate: (sale: Sale) => string;
  onCancelSale: (id: string) => void;
}

export default function SalesTable({
  sales,
  searchQuery,
  setSearchQuery,
  formatSaleDate,
  onCancelSale,
}: SalesTableProps) {
  const exportToCSV = () => {
    if (sales.length === 0) return;
    const headers = ["ID Factura", "Origen", "Fecha", "Metodo Pago", "Estado", "Total", "Mesero", "Comensales"];
    const rows = sales.map((s) => [
      s.id,
      s.table,
      formatSaleDate(s),
      s.paymentMethod,
      s.status,
      s.total.toFixed(2),
      s.waiter || "N/A",
      s.guestCount || 1,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ventas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Transacciones Filtradas</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar factura o mesa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs px-4 py-2 rounded-xl focus:border-orange-500 focus:outline-none w-48 transition-all placeholder:text-zinc-600"
          />
          <button
            type="button"
            onClick={exportToCSV}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs px-3 py-2 rounded-xl transition-all"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {sales.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 italic text-sm">
            No se encontraron facturas con ese criterio.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950 text-zinc-300 font-semibold text-xs border-b border-zinc-800 uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">ID Factura</th>
                <th className="p-4">Origen</th>
                <th className="p-4">Hora</th>
                <th className="p-4">Método de Pago</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 pr-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-zinc-900/50 transition-all">
                  <td className="p-4 pl-6 font-semibold text-white">{sale.id}</td>
                  <td className="p-4 text-zinc-300">{sale.table}</td>
                  <td className="p-4 text-xs text-zinc-500">{formatSaleDate(sale)}</td>
                  <td className="p-4 text-xs">
                    <span className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700/50 font-medium">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-xs">
                    <span
                      className={`font-semibold ${
                        sale.status === "Completado" ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      ● {sale.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-white">${sale.total.toFixed(2)}</td>
                  <td className="p-4 pr-6 text-center">
                    {sale.status === "Completado" ? (
                      <button
                        type="button"
                        onClick={() => onCancelSale(sale.id)}
                        className="text-xs text-rose-500 hover:text-rose-400 hover:underline font-semibold bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg transition"
                      >
                        Anular
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-600 italic">Anulada</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
