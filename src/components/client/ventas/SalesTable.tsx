import React from "react";
import { Search, Download, Ban, FileText, Printer } from "lucide-react";
import { Sale } from "./types";

interface SalesTableProps {
  sales: Sale[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  formatSaleDate: (sale: Sale) => string;
  onCancelSale: (id: string) => void;
  onPrintSale?: (sale: Sale) => void;
}

export default function SalesTable({
  sales,
  searchQuery,
  setSearchQuery,
  formatSaleDate,
  onCancelSale,
  onPrintSale,
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
    <div className="bg-[#12151e] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
      <div className="p-5 border-b border-white/[0.06] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText size={17} className="text-orange-400" />
            <span>Transacciones y Facturación</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Mostrando {sales.length} registros según los filtros seleccionados.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar factura o mesa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 border border-white/[0.08] text-zinc-100 text-xs pl-9 pr-4 py-2 rounded-xl focus:border-orange-500 focus:outline-none transition-all placeholder:text-zinc-500"
            />
          </div>
          <button
            type="button"
            onClick={exportToCSV}
            className="flex items-center gap-1.5 bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 hover:text-white font-semibold text-xs px-3.5 py-2 rounded-xl border border-white/[0.06] transition-all shrink-0"
          >
            <Download size={13} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {sales.length === 0 ? (
          <div className="text-center py-14 text-zinc-500 italic text-sm">
            No se encontraron facturas con los criterios seleccionados.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950/80 text-zinc-300 font-bold text-xs border-b border-white/[0.06] uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">ID Factura</th>
                <th className="p-4">Origen</th>
                <th className="p-4">Fecha y Hora</th>
                <th className="p-4">Método de Pago</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 pr-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 pl-6 font-bold text-white">{sale.id}</td>
                  <td className="p-4 text-zinc-300 font-medium">{sale.table}</td>
                  <td className="p-4 text-xs text-zinc-400">{formatSaleDate(sale)}</td>
                  <td className="p-4 text-xs">
                    <span className="bg-zinc-900 border border-white/[0.08] text-zinc-300 px-2.5 py-1 rounded-full font-medium">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        sale.status === "Completado" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {sale.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-white text-base">
                    ${sale.total.toFixed(2)}
                  </td>
                  <td className="p-4 pr-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {onPrintSale && (
                        <button
                          type="button"
                          onClick={() => onPrintSale(sale)}
                          title="Imprimir Ticket"
                          className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-semibold bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 px-2 py-1 rounded-lg transition"
                        >
                          <Printer size={12} />
                          <span>Ticket</span>
                        </button>
                      )}
                      {sale.status === "Completado" ? (
                        <button
                          type="button"
                          onClick={() => onCancelSale(sale.id)}
                          title="Anular Factura"
                          className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2 py-1 rounded-lg transition"
                        >
                          <Ban size={12} />
                          <span>Anular</span>
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-600 italic">Anulada</span>
                      )}
                    </div>
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
