"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  ArrowUpRight,
  Crown,
  Sparkles,
  Building2,
  Clock,
  TrendingUp,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Copy,
  Smartphone,
  Check,
} from "lucide-react";
import Link from "next/link";

interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  plan: string;
  amount: number;
  billingCycle: string;
  paymentMethod: string;
  status: string;
  referenceNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  business?: {
    id: string;
    name: string;
    code: string | null;
    plan: string;
    planStatus: string;
  } | null;
}

interface BusinessItem {
  id: string;
  name: string;
  code: string | null;
  plan: string;
  planStatus: string;
  billingCycle: string;
  planExpiresAt: string | null;
  subscriptions: { id: string; amount: number; status: string; plan: string; createdAt: string }[];
}

export default function FacturacionPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionInvoice[]>([]);
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [totalSubBilled, setTotalSubBilled] = useState(0);
  const [totalPaidInvoicesCount, setTotalPaidInvoicesCount] = useState(0);
  const [activePaidSubsCount, setActivePaidSubsCount] = useState(0);
  const [freeTrialsCount, setFreeTrialsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
        setBusinesses(data.businesses || []);
        setTotalSubBilled(data.totalSubBilled || 0);
        setTotalPaidInvoicesCount(data.totalPaidInvoicesCount || 0);
        setActivePaidSubsCount(data.activePaidSubsCount || 0);
        setFreeTrialsCount(data.freeTrialsCount || 0);
      }
    } catch (err) {
      console.error("Error cargando suscripciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleApprove = async (invoiceId: string, invoiceNumber: string, businessName: string) => {
    if (!confirm(`¿Deseas validar y aprobar el comprobante "${invoiceNumber}" de "${businessName}"? Esto activará de inmediato el plan para este restaurante.`)) {
      return;
    }

    setProcessingId(invoiceId);
    setNotification(null);
    try {
      const res = await fetch(`/api/admin/subscriptions/${invoiceId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: "success",
          message: data.message || `Comprobante ${invoiceNumber} aprobado con éxito.`,
        });
        fetchSubscriptions();
      } else {
        setNotification({ type: "error", message: data.message || "Error al aprobar comprobante." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red al conectar con el servidor." });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invoiceId: string, invoiceNumber: string) => {
    const reason = prompt("Ingresa el motivo del rechazo del comprobante (opcional):", "Fondos no encontrados en la cuenta");
    if (reason === null) return;

    setProcessingId(invoiceId);
    setNotification(null);
    try {
      const res = await fetch(`/api/admin/subscriptions/${invoiceId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: "success",
          message: data.message || `Comprobante ${invoiceNumber} marcado como rechazado.`,
        });
        fetchSubscriptions();
      } else {
        setNotification({ type: "error", message: data.message || "Error al rechazar comprobante." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red al conectar con el servidor." });
    } finally {
      setProcessingId(null);
    }
  };

  const copyRef = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingInvoices = subscriptions.filter((s) => s.status === "PENDING");

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
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <CreditCard className="text-orange-500" />
            Facturación y Cobros de Planes
          </h2>
          <p className="text-sm text-zinc-400">
            Control de recaudación SaaS en Pesos Colombianos (COP), validación de transferencias y comprobantes de la plataforma.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSubscriptions}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-orange-400" : ""} />
          <span>{loading ? "Actualizando..." : "Refrescar"}</span>
        </button>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            notification.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs underline ml-4">
            Cerrar
          </button>
        </div>
      )}

      {/* SECCIÓN ESPECIAL: COMPROBANTES PENDIENTES DE VALIDACIÓN (MODO HÍBRIDO) */}
      {pendingInvoices.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-amber-950/40 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Transferencias Pendientes de Validación</span>
                  <span className="bg-amber-500 text-zinc-950 font-black text-xs px-2 py-0.5 rounded-full">
                    {pendingInvoices.length} {pendingInvoices.length === 1 ? "pendiente" : "pendientes"}
                  </span>
                </h3>
                <p className="text-xs text-amber-200/80">
                  Comercios que han reportado transferencia directa por Nequi o Bancolombia esperando activación
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-zinc-950/90 border border-amber-500/25 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-lg"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {inv.business?.name || "Comercio sin nombre"}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        Comprobante: <strong className="text-zinc-200">{inv.invoiceNumber}</strong>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {inv.plan} ({inv.billingCycle})
                      </span>
                      <span className="text-xs font-black text-white">
                        ${inv.amount.toLocaleString("es-CO")} COP
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/80 rounded-xl border border-white/[0.05] text-xs flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Canal utilizado:</span>
                      <strong className="text-white flex items-center gap-1">
                        <Smartphone size={12} className="text-orange-400" /> {inv.paymentMethod}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Referencia reportada:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {inv.referenceNumber || "No especificada"}
                        </span>
                        {inv.referenceNumber && (
                          <button
                            type="button"
                            onClick={() => copyRef(inv.referenceNumber || "", inv.id)}
                            className="text-zinc-400 hover:text-white"
                            title="Copiar referencia"
                          >
                            {copiedId === inv.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                    </div>
                    {inv.notes && (
                      <div className="text-[11px] text-zinc-400 mt-0.5 pt-1 border-t border-zinc-800">
                        <span className="text-zinc-500">Nota:</span> &ldquo;{inv.notes}&rdquo;
                      </div>
                    )}
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      Reportado: {new Date(inv.createdAt).toLocaleString("es-CO")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => handleApprove(inv.id, inv.invoiceNumber, inv.business?.name || "Comercio")}
                    disabled={processingId === inv.id}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 size={13} />
                    <span>{processingId === inv.id ? "Activando..." : "Validar y Activar Plan"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(inv.id, inv.invoiceNumber)}
                    disabled={processingId === inv.id}
                    className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs border border-rose-500/20 transition flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <XCircle size={13} />
                    <span>Rechazar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <span className="text-xs text-zinc-500">Historial completo en PostgreSQL</span>
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
                  <th className="p-4 pl-6">Nº Factura</th>
                  <th className="p-4">Comercio</th>
                  <th className="p-4">Plan Adquirido</th>
                  <th className="p-4">Ciclo</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Método / Canal</th>
                  <th className="p-4">Ref. Comprobante</th>
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
                    <td className="p-4 text-xs font-mono text-zinc-400">
                      {sub.referenceNumber || "—"}
                    </td>
                    <td className="p-4 text-xs">
                      {sub.status === "PAID" ? (
                        <span className="font-semibold inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          <CheckCircle2 size={11} /> Aprobado
                        </span>
                      ) : sub.status === "PENDING" ? (
                        <span className="font-semibold inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border bg-amber-500/10 text-amber-400 border-amber-500/20">
                          <Clock size={11} /> Pendiente
                        </span>
                      ) : (
                        <span className="font-semibold inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border bg-rose-500/10 text-rose-400 border-rose-500/20">
                          <XCircle size={11} /> Rechazado
                        </span>
                      )}
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
