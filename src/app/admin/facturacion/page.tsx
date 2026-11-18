import React from "react";
import prisma from "@/lib/prisma";
import {
  CreditCard,
  CheckCircle2,
  ArrowUpRight,
  Crown,
  Sparkles,
  Building2,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FacturacionPage() {
  const [subscriptions, businesses, subAggregate, activePaidSubsCount, freeTrialsCount] = await Promise.all([
    prisma.subscriptionInvoice.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        business: { select: { id: true, name: true, code: true, plan: true } },
      },
    }),
    prisma.business.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        code: true,
        plan: true,
        planStatus: true,
        billingCycle: true,
        planExpiresAt: true,
        subscriptions: {
          select: { id: true, amount: true, status: true, plan: true, createdAt: true },
        },
      },
    }),
    prisma.subscriptionInvoice.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: { status: "PAID" },
    }),
    prisma.business.count({
      where: { planStatus: "ACTIVE", plan: { not: "FREE" } },
    }),
    prisma.business.count({
      where: { plan: "FREE" },
    }),
  ]);

  const totalSubBilled = subAggregate._sum.amount || 0;
  const totalPaidInvoicesCount = subAggregate._count.id || 0;

  // Ingresos recaudados por plan
  const standardRevenue = subscriptions
    .filter((s) => s.plan === "STANDARD" && s.status === "PAID")
    .reduce((acc, s) => acc + s.amount, 0);

  const proRevenue = subscriptions
    .filter((s) => s.plan === "PRO" && s.status === "PAID")
    .reduce((acc, s) => acc + s.amount, 0);

  const enterpriseRevenue = subscriptions
    .filter((s) => s.plan === "ENTERPRISE" && s.status === "PAID")
    .reduce((acc, s) => acc + s.amount, 0);

  // Conteo de clientes por plan
  const standardCount = businesses.filter((b) => b.plan === "STANDARD").length;
  const proCount = businesses.filter((b) => b.plan === "PRO").length;
  const enterpriseCount = businesses.filter((b) => b.plan === "ENTERPRISE").length;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <CreditCard className="text-orange-500" />
          Facturación y Cobros de Planes
        </h2>
        <p className="text-sm text-zinc-400">
          Control de recaudación de suscripciones SaaS, membresías recurrentes y comprobantes de pago de la plataforma.
        </p>
      </div>

      {/* Top Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
          <div>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Recaudación Total de Planes</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              ${totalSubBilled.toLocaleString("es-CO")} COP
            </p>
          </div>
          <p className="text-xs text-emerald-400 mt-4 font-medium flex items-center gap-1">
            <TrendingUp size={13} />
            {totalPaidInvoicesCount} pagos de planes procesados
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
          <div>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Suscripciones Activas de Pago</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2">
              {activePaidSubsCount}
            </p>
          </div>
          <p className="text-xs text-zinc-400 mt-4 font-medium flex items-center gap-1">
            <Crown size={13} className="text-amber-400" />
            Standard, Pro y Enterprise
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
          <div>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Comprobantes Emitidos</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-orange-400 mt-2">
              {subscriptions.length}
            </p>
          </div>
          <p className="text-xs text-zinc-400 mt-4 font-medium flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-400" />
            Histórico en PostgreSQL
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
          <div>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">En Prueba Gratuita (7 Días)</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-2">
              {freeTrialsCount}
            </p>
          </div>
          <p className="text-xs text-zinc-400 mt-4 font-medium flex items-center gap-1">
            <Clock size={13} className="text-blue-400" />
            Comercios evaluando la app
          </p>
        </div>
      </div>

      {/* Plan Revenue Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-blue-500/10 via-zinc-900 to-zinc-900 border border-blue-500/20 p-5 rounded-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold uppercase text-blue-400">Plan Standard ($69.000 COP)</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full">
              {standardCount} clientes
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-3">
            ${standardRevenue.toLocaleString("es-CO")} COP
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Total recaudado por Standard</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 via-zinc-900 to-zinc-900 border border-orange-500/30 p-5 rounded-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold uppercase text-orange-400 flex items-center gap-1">
              <Sparkles size={12} /> Plan Pro ($119.000 COP)
            </span>
            <span className="text-[10px] bg-orange-500/20 text-orange-300 font-bold px-2 py-0.5 rounded-full">
              {proCount} clientes
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-3">
            ${proRevenue.toLocaleString("es-CO")} COP
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Total recaudado por Pro + Jukebox</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 via-zinc-900 to-zinc-900 border border-purple-500/20 p-5 rounded-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold uppercase text-purple-400">Plan Enterprise ($249.000 COP)</span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full">
              {enterpriseCount} clientes
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-3">
            ${enterpriseRevenue.toLocaleString("es-CO")} COP
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Total recaudado por Enterprise</p>
        </div>
      </div>

      {/* Recaudación de Suscripciones por Comercio */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="text-orange-500" size={18} />
              Membresía y Recaudación de Planes por Comercio ({businesses.length})
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Cobros de suscripciones acumulados por cada restaurante</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((b) => {
            const bizSubTotal = b.subscriptions
              .filter((s) => s.status === "PAID")
              .reduce((acc, s) => acc + s.amount, 0);

            const isSuspended = b.planStatus === "SUSPENDED";

            return (
              <div
                key={b.id}
                className="p-4 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 rounded-xl flex flex-col justify-between gap-3 transition"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-[170px]" title={b.name}>
                      {b.name}
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      {b.code || b.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                        b.plan === "PRO"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : b.plan === "STANDARD"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : b.plan === "ENTERPRISE"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {b.plan}
                    </span>
                    <span
                      className={`text-[9px] font-semibold ${
                        isSuspended ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      ● {isSuspended ? "Suspendido" : b.planStatus}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-900 flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">Total en Planes</p>
                    <p className="text-sm font-black text-orange-400 mt-0.5">
                      ${bizSubTotal.toLocaleString("es-CO")} COP
                    </p>
                  </div>
                  <Link
                    href={`/admin/negocios/${b.id}`}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-zinc-800 transition"
                  >
                    <span>Gestionar Plan</span>
                    <ArrowUpRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Invoices Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Crown className="text-orange-500" size={18} />
            Historial de Comprobantes de Planes ({subscriptions.length})
          </h3>
          <span className="text-xs text-zinc-500">Facturación oficial de suscripciones</span>
        </div>

        {subscriptions.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm flex flex-col items-center gap-2">
            <CreditCard size={32} className="text-zinc-600 mb-1" />
            <p className="font-semibold text-zinc-300">No se han emitido pagos de suscripciones todavía.</p>
            <p className="text-xs text-zinc-500">
              Cuando un comercio adquiera o renueve un plan Standard, Pro o Enterprise en Pesos Colombianos (COP), aparecerá aquí su comprobante oficial.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950 text-zinc-300 font-semibold text-xs border-b border-zinc-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Nº Comprobante</th>
                  <th className="p-4">Comercio</th>
                  <th className="p-4">Plan Adquirido</th>
                  <th className="p-4">Ciclo</th>
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Método de Pago</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 pr-6 text-right">Importe Facturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-900/50 transition-all">
                    <td className="p-4 pl-6 font-semibold text-white font-mono text-xs">
                      {sub.invoiceNumber}
                    </td>
                    <td className="p-4 text-zinc-200 font-medium">
                      {sub.business ? (
                        <Link
                          href={`/admin/negocios/${sub.business.id}`}
                          className="hover:text-orange-400 transition underline underline-offset-4"
                        >
                          {sub.business.name}
                        </Link>
                      ) : (
                        "Local sin nombre"
                      )}
                    </td>
                    <td className="p-4 text-xs">
                      <span
                        className={`font-extrabold uppercase px-2 py-0.5 rounded-md text-[10px] border ${
                          sub.plan === "PRO"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : sub.plan === "STANDARD"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : sub.plan === "ENTERPRISE"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {sub.plan}
                      </span>
                    </td>
                    <td className="p-4 text-xs capitalize text-zinc-400">{sub.billingCycle}</td>
                    <td className="p-4 text-xs text-zinc-500">
                      {new Date(sub.createdAt).toLocaleString("es-CO")}
                    </td>
                    <td className="p-4 text-xs text-zinc-300">{sub.paymentMethod}</td>
                    <td className="p-4 text-xs">
                      <span
                        className={`font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${
                          sub.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : sub.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        ● {sub.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right font-bold text-white">
                      ${(sub.amount || 0).toLocaleString("es-CO")} COP
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
