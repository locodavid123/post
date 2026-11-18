import React from "react";
import prisma from "@/lib/prisma";
import { CreditCard, DollarSign, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default async function FacturacionPage() {
  const [sales, businesses, salesAggregate] = await Promise.all([
    prisma.sale.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        business: { select: { id: true, name: true, code: true } },
      },
    }),
    prisma.business.findMany({
      include: {
        _count: { select: { sales: true } },
        sales: { select: { total: true, status: true } },
      },
    }),
    prisma.sale.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: { status: "Completado" },
    }),
  ]);

  const totalBilled = salesAggregate._sum.total || 0;
  const completedCount = salesAggregate._count.id || 0;
  const cancelledCount = await prisma.sale.count({ where: { status: "Cancelado" } });
  const totalTx = completedCount + cancelledCount;
  const effectivenessRate = totalTx > 0 ? Math.round((completedCount / totalTx) * 100) : 100;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <CreditCard className="text-orange-500" />
          Facturación y Cobros de la Plataforma
        </h2>
        <p className="text-sm text-zinc-400">
          Conciliación de facturas, transacciones comerciales y recaudación global en PostgreSQL.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Facturado en Plataforma</p>
            <p className="text-3xl font-extrabold text-white mt-2">${totalBilled.toFixed(2)}</p>
          </div>
          <p className="text-xs text-emerald-400 mt-4 font-medium flex items-center gap-1">
            <CheckCircle2 size={13} />
            {effectivenessRate}% de transacciones completadas
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Transacciones Exitosas</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">{completedCount}</p>
          </div>
          <p className="text-xs text-zinc-400 mt-4 font-medium">Facturas emitidas y cobradas</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Comprobantes Cancelados</p>
            <p className="text-3xl font-extrabold text-rose-400 mt-2">{cancelledCount}</p>
          </div>
          <p className="text-xs text-zinc-400 mt-4 font-medium flex items-center gap-1">
            <XCircle size={13} />
            Ventas anuladas por operadores
          </p>
        </div>
      </div>

      {/* Breakdown per Business */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
        <h3 className="text-base font-bold text-white">Facturación por Comercio</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {businesses.map((b) => {
            const bizTotal = b.sales
              .filter((s) => s.status === "Completado")
              .reduce((acc, s) => acc + s.total, 0);
            return (
              <div
                key={b.id}
                className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{b.name}</h4>
                  <p className="text-xs text-zinc-500">{b._count.sales} ventas registradas</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-orange-400">${bizTotal.toFixed(2)}</p>
                  <Link
                    href={`/admin/negocios/${b.id}`}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-0.5 justify-end mt-0.5"
                  >
                    Detalle <ArrowUpRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Invoices / Sales Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Historial de Transacciones Globales ({sales.length})</h3>
        </div>

        {sales.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            Aún no hay transacciones de venta registradas en la base de datos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950 text-zinc-300 font-semibold text-xs border-b border-zinc-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Nº Factura</th>
                  <th className="p-4">Comercio</th>
                  <th className="p-4">Mesa / Tipo</th>
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Método de Pago</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 pr-6 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-zinc-900/50 transition-all">
                    <td className="p-4 pl-6 font-semibold text-white font-mono text-xs">
                      {sale.invoiceNumber}
                    </td>
                    <td className="p-4 text-zinc-200 font-medium">
                      {sale.business?.name || "Local sin nombre"}
                    </td>
                    <td className="p-4 text-xs text-zinc-400">{sale.table}</td>
                    <td className="p-4 text-xs text-zinc-500">
                      {new Date(sale.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-xs text-zinc-300">{sale.paymentMethod}</td>
                    <td className="p-4 text-xs">
                      <span
                        className={`font-semibold inline-flex items-center gap-1 ${
                          sale.status === "Completado" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        ● {sale.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right font-bold text-white">
                      ${sale.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
