"use client";
import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Calendar, Printer, DollarSign, Building2, CreditCard, RefreshCw } from "lucide-react";

interface ReportData {
  summary: {
    totalRevenue: number;
    completedSalesCount: number;
    cancelledSalesCount: number;
    totalBusinesses: number;
    totalProducts: number;
    totalSongs: number;
  };
  monthlyRevenue: Array<{ label: string; total: number; count: number }>;
  monthlySignups: Array<{ label: string; count: number }>;
  paymentMethods: Record<string, { count: number; total: number }>;
  topBusinesses: Array<{ name: string; total: number; count: number }>;
}

export default function ReportesPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const report = await res.json();
        setData(report);
      }
    } catch (e) {
      console.error("Error loading reports:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-zinc-500">
        <RefreshCw size={24} className="animate-spin text-orange-500" />
        <p className="text-sm">Generando analíticas desde PostgreSQL...</p>
      </div>
    );
  }

  const summary = data?.summary || {
    totalRevenue: 0,
    completedSalesCount: 0,
    cancelledSalesCount: 0,
    totalBusinesses: 0,
    totalProducts: 0,
    totalSongs: 0,
  };

  const monthlyRev = data?.monthlyRevenue || [];
  const maxMonthlyRev = Math.max(...monthlyRev.map((m) => m.total), 100);

  const monthlySignups = data?.monthlySignups || [];
  const maxSignups = Math.max(...monthlySignups.map((s) => s.count), 5);

  const paymentMethods = data?.paymentMethods || {};
  const totalPaymentSum = Object.values(paymentMethods).reduce((acc, p) => acc + p.total, 0) || 1;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto print:max-w-none print:m-0">
      {/* Title & Actions */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="text-orange-500" />
            Analíticas de Plataforma
          </h2>
          <p className="text-sm text-zinc-400">
            Estadísticas consolidadas, facturación acumulada y crecimiento de comercios en PostgreSQL.
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={fetchReports}
            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw size={13} />
            Actualizar
          </button>
          <button
            onClick={handlePrint}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/15 flex items-center gap-1.5"
          >
            <Printer size={14} />
            Imprimir Reporte
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Facturación Total</p>
          <p className="text-xl font-black text-white mt-1">${summary.totalRevenue.toFixed(2)}</p>
          <p className="text-[10px] text-emerald-400 mt-1">En todas las sucursales</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Ventas Cobradas</p>
          <p className="text-xl font-black text-white mt-1">{summary.completedSalesCount}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Completadas con éxito</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Ventas Canceladas</p>
          <p className="text-xl font-black text-white mt-1">{summary.cancelledSalesCount}</p>
          <p className="text-[10px] text-rose-400 mt-1">Cancelaciones</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Locales Gastronómicos</p>
          <p className="text-xl font-black text-white mt-1">{summary.totalBusinesses}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Registrados en BD</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Productos en Carta</p>
          <p className="text-xl font-black text-white mt-1">{summary.totalProducts}</p>
          <p className="text-[10px] text-zinc-400 mt-1">En el catálogo global</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[10px] text-zinc-500 uppercase font-semibold">Canciones Pedidas</p>
          <p className="text-xl font-black text-white mt-1">{summary.totalSongs}</p>
          <p className="text-[10px] text-orange-400 mt-1">Vía Jukebox</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-orange-500" size={18} />
              Facturación Mensual Consolidada
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Volumen total de facturas cobradas por mes en USD.
            </p>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-zinc-800">
            {monthlyRev.map((m, idx) => {
              const heightPct = Math.max(Math.round((m.total / maxMonthlyRev) * 100), 6);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg hover:from-orange-500 hover:to-orange-300 transition-all cursor-pointer relative group"
                  >
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-950 text-white border border-zinc-800 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      ${m.total.toFixed(2)} ({m.count} vtas)
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">
                    {m.label.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* New Businesses Registrations Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="text-emerald-500" size={18} />
              Nuevos Comercios Adheridos
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Crecimiento mensual de la base de restaurantes afiliados.
            </p>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-zinc-800">
            {monthlySignups.map((s, idx) => {
              const heightPct = Math.max(Math.round((s.count / maxSignups) * 100), 6);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg hover:from-emerald-500 hover:to-emerald-300 transition-all cursor-pointer relative group"
                  >
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-950 text-white border border-zinc-800 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      {s.count} locales
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">
                    {s.label.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Businesses + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Businesses by Revenue */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="text-orange-500" size={18} />
            Comercios con Mayor Facturación
          </h3>

          {data?.topBusinesses.length === 0 ? (
            <p className="text-xs text-zinc-500">Sin datos de ventas todavía.</p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {data?.topBusinesses.map((b, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-orange-400">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{b.name}</p>
                      <p className="text-zinc-500">{b.count} ventas realizadas</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400 text-sm">${b.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="text-orange-500" size={18} />
            Distribución por Método de Pago
          </h3>

          <div className="flex flex-col gap-4">
            {["Efectivo", "Tarjeta", "Transferencia"].map((method) => {
              const item = paymentMethods[method] || { count: 0, total: 0 };
              const pct = Math.round((item.total / totalPaymentSum) * 100);
              return (
                <div key={method} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-300">{method}</span>
                    <span className="text-zinc-400">
                      ${item.total.toFixed(2)} ({item.count} pagos • {pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${
                        method === "Efectivo"
                          ? "bg-emerald-500"
                          : method === "Tarjeta"
                          ? "bg-blue-500"
                          : "bg-purple-500"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
