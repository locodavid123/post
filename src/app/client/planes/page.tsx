"use client";
import React, { useState, useEffect } from "react";
import {
  Crown,
  Check,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  CreditCard,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Copy,
  Clock,
  XCircle,
  Building,
  Smartphone,
  ExternalLink,
} from "lucide-react";

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
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

interface PaymentConfig {
  nequiNumber: string;
  nequiHolder: string;
  bancolombiaAccount: string;
  bancolombiaType: string;
  bancolombiaHolder: string;
  daviplataNumber: string;
  daviplataHolder: string;
  paymentInstructions: string;
  wompiPublicKey: string;
  wompiSandbox: boolean;
}

interface PlanInfo {
  id: string;
  name: string;
  plan: string;
  planStatus: string;
  planExpiresAt: string | null;
  billingCycle: string;
  subscriptions: SubscriptionInvoice[];
  paymentConfig?: PaymentConfig;
}

export default function ClientPlanesPage() {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Estados del Modo Híbrido
  const [paymentMode, setPaymentMode] = useState<"transfer" | "gateway">("transfer");
  const [transferChannel, setTransferChannel] = useState<"Nequi" | "Bancolombia" | "Daviplata">("Nequi");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [transferNotes, setTransferNotes] = useState("");

  const fetchPlanInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/business/plan");
      if (res.ok) {
        const data = await res.json();
        setPlanInfo(data);
      }
    } catch (e) {
      console.error("Error fetching plan info:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanInfo();
  }, []);

  const handleOpenCheckout = (planKey: string) => {
    setSelectedPlan(planKey);
    setReferenceNumber("");
    setTransferNotes("");
    if (planKey === "FREE") {
      setPaymentMode("gateway");
    } else {
      setPaymentMode("transfer");
    }
    setIsModalOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleConfirmPlan = async () => {
    if (!selectedPlan) return;

    if (selectedPlan !== "FREE" && paymentMode === "transfer") {
      if (!referenceNumber.trim()) {
        alert("Por favor ingresa el número de comprobante o referencia de tu transferencia.");
        return;
      }
    }

    setSubmitting(true);
    setNotification(null);

    try {
      const res = await fetch("/api/business/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          billingCycle,
          paymentMode: selectedPlan === "FREE" ? "free" : paymentMode === "transfer" ? "manual_transfer" : "gateway",
          paymentMethod: selectedPlan === "FREE" ? "Prueba Gratuita" : paymentMode === "transfer" ? transferChannel : "Wompi Online",
          referenceNumber: referenceNumber.trim() || undefined,
          notes: transferNotes.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotification({
          type: "success",
          message: data.message || `Operación completada con éxito.`,
        });
        setIsModalOpen(false);
        fetchPlanInfo();
      } else {
        const err = await res.json();
        setNotification({ type: "error", message: err.message || "Error al procesar la solicitud." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red al procesar el pago." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-zinc-500">
        <RefreshCw size={24} className="animate-spin text-orange-500" />
        <p className="text-sm">Cargando estado de suscripción y planes...</p>
      </div>
    );
  }

  const currentPlan = planInfo?.plan || "FREE";
  const currentStatus = planInfo?.planStatus || "ACTIVE";
  const expiresAt = planInfo?.planExpiresAt ? new Date(planInfo.planExpiresAt) : null;
  const paymentConfig = planInfo?.paymentConfig;

  const plans = [
    {
      key: "FREE",
      name: "Plan Free (Prueba 7 Días)",
      priceMonthly: 0,
      priceAnnual: 0,
      description: "Prueba completa de 1 semana con todas las funciones operativas del punto de venta.",
      features: [
        "Prueba completa durante 7 días",
        "Hasta 6 mesas simultáneas",
        "Gestión de comandas y cobros",
        "Catálogo de productos ilimitado",
        "Tickets térmicos de venta",
        "Jukebox en modo demostración",
      ],
      popular: false,
    },
    {
      key: "STANDARD",
      name: "Plan Standard",
      priceMonthly: 69000,
      priceAnnual: 690000,
      description: "Para restaurantes en crecimiento que requieren mayor capacidad y pedidos QR.",
      features: [
        "Hasta 15 mesas simultáneas",
        "Autopedido por QR en mesas",
        "Facturación y reportes de caja",
        "Impresión térmica personalizada",
        "Soporte estándar vía WhatsApp/Email",
      ],
      popular: false,
    },
    {
      key: "PRO",
      name: "Plan Pro (Recomendado)",
      priceMonthly: 119000,
      priceAnnual: 1190000,
      description: "El paquete gastronómico definitivo con Rockola Jukebox y mesas ilimitadas.",
      features: [
        "Mesas ilimitadas en el salón",
        "Rockola Jukebox YouTube completa",
        "Autopedido QR con alertas sonoras",
        "Reportes analíticos avanzados",
        "Historial y métricas de consumo",
        "Soporte prioritario 24/7",
      ],
      popular: true,
    },
    {
      key: "ENTERPRISE",
      name: "Plan Enterprise",
      priceMonthly: 249000,
      priceAnnual: 2490000,
      description: "Para cadenas gastronómicas, franquicias y locales de alto volumen.",
      features: [
        "Múltiples sucursales y franquicias",
        "Todas las funciones Pro desbloqueadas",
        "Auditoría y control de administradores",
        "Personalización de marca blanca",
        "Asesor dedicado para implementación",
      ],
      popular: false,
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
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
            {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs underline ml-4">
            Cerrar
          </button>
        </div>
      )}

      {/* Current Plan Status Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-850 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
            <Crown size={28} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Plan Actual</span>
              <span
                className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  currentStatus === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : currentStatus === "SUSPENDED"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                ● {currentStatus === "ACTIVE" ? "Activo" : currentStatus === "SUSPENDED" ? "Suspendido" : currentStatus}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {currentPlan === "FREE"
                ? "Plan Free (Prueba Gratuita 7 Días)"
                : currentPlan === "STANDARD"
                ? "Plan Standard"
                : currentPlan === "PRO"
                ? "Plan Pro Premium"
                : "Plan Enterprise"}
            </h2>
            <p className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
              <Calendar size={13} className="text-zinc-500" />
              {expiresAt ? (
                (() => {
                  const days = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  if (currentPlan === "FREE") {
                    return days > 0
                      ? `Prueba de 1 semana: ${days} día(s) restante(s) (Vence: ${expiresAt.toLocaleDateString("es-CO")})`
                      : `Período de prueba concluido (${expiresAt.toLocaleDateString("es-CO")}). Adquiere un plan para reactivar el terminal.`;
                  }
                  return `Próxima renovación: ${expiresAt.toLocaleDateString("es-CO")} (${Math.max(0, days)} días restantes)`;
                })()
              ) : (
                "Plan sin fecha de expiración registrada"
              )}
            </p>
          </div>
        </div>

        {/* Quick Bank Details Banner for Colombia */}
        {paymentConfig && (
          <div className="bg-zinc-950/70 border border-white/[0.08] rounded-xl p-4 text-xs text-zinc-300 max-w-sm">
            <p className="font-bold text-orange-400 mb-1 flex items-center gap-1.5">
              <Smartphone size={14} /> Canales de Pago Directo EcoPost:
            </p>
            <p className="text-[11px] text-zinc-400">
              Nequi: <strong className="text-white">{paymentConfig.nequiNumber}</strong> • Bancolombia Ahorros: <strong className="text-white">{paymentConfig.bancolombiaAccount}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Billing Cycle Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <div>
          <h3 className="text-base font-bold text-white">Elige la modalidad para tu restaurante</h3>
          <p className="text-xs text-zinc-400">Precios transparentes en Pesos Colombianos (COP). Sin cláusulas de permanencia.</p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              billingCycle === "monthly" ? "bg-orange-500 text-white shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            Facturación Mensual
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              billingCycle === "annual" ? "bg-orange-500 text-white shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>Facturación Anual</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-emerald-500/30">
              Ahorra 2 meses
            </span>
          </button>
        </div>
      </div>

      {/* Plans Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.key;
          const price = billingCycle === "annual" ? p.priceAnnual : p.priceMonthly;

          return (
            <div
              key={p.key}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 relative ${
                p.popular
                  ? "bg-gradient-to-b from-orange-500/10 via-zinc-900 to-zinc-900 border-2 border-orange-500 shadow-xl shadow-orange-500/10"
                  : isCurrent
                  ? "bg-zinc-900 border-2 border-emerald-500/50 shadow-lg"
                  : "bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles size={11} /> Más Elegido por Restaurantes
                </div>
              )}

              <div>
                <h4 className="text-lg font-bold text-white">{p.name}</h4>
                <p className="text-xs text-zinc-400 mt-1 min-h-[36px]">{p.description}</p>

                <div className="mt-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {p.priceMonthly === 0 ? "Gratis" : `$${price.toLocaleString("es-CO")}`}
                    </span>
                    <span className="text-xs text-zinc-500 font-semibold">
                      {p.priceMonthly === 0 ? "(7 Días de Prueba)" : `COP / ${billingCycle === "annual" ? "año" : "mes"}`}
                    </span>
                  </div>
                </div>

                <ul className="flex flex-col gap-2.5 mt-5">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                      <Check size={14} className="text-orange-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800">
                {isCurrent && currentStatus === "ACTIVE" ? (
                  <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Plan Activo Actualmente
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenCheckout(p.key)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md ${
                      p.popular
                        ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    }`}
                  >
                    <span>{p.priceMonthly === 0 ? "Seleccionar Prueba" : isCurrent ? "Renovar Plan" : "Adquirir este Plan"}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Invoices History */}
      {planInfo?.subscriptions && planInfo.subscriptions.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl mt-4">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="text-orange-500" size={18} />
              Historial de Comprobantes de Suscripción ({planInfo.subscriptions.length})
            </h3>
            <span className="text-xs text-zinc-500">Comprobantes y transferencias registradas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400">
              <thead className="bg-zinc-950 text-zinc-300 font-semibold border-b border-zinc-800 uppercase tracking-wider">
                <tr>
                  <th className="p-3 pl-6">Nº Factura</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Ciclo</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Canal de Pago</th>
                  <th className="p-3">Ref. Comprobante</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 pr-6 text-right">Importe Facturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {planInfo.subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-950/40 transition">
                    <td className="p-3 pl-6 font-mono font-bold text-white">{sub.invoiceNumber}</td>
                    <td className="p-3 text-zinc-200 font-semibold">{sub.plan}</td>
                    <td className="p-3 capitalize">{sub.billingCycle}</td>
                    <td className="p-3 text-zinc-500">{new Date(sub.createdAt).toLocaleDateString("es-CO")}</td>
                    <td className="p-3 text-zinc-300">{sub.paymentMethod}</td>
                    <td className="p-3 font-mono text-[11px] text-zinc-400">
                      {sub.referenceNumber || "—"}
                    </td>
                    <td className="p-3">
                      {sub.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 size={11} /> Aprobado
                        </span>
                      ) : sub.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20" title="Pendiente de validación por SuperAdmin">
                          <Clock size={11} className="animate-spin" /> En Validación
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <XCircle size={11} /> Rechazado
                        </span>
                      )}
                    </td>
                    <td className="p-3 pr-6 text-right font-black text-white">
                      ${sub.amount.toLocaleString("es-CO")} COP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Pago Híbrido (Transferencia Directa o Pasarela Wompi) */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10131c] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedPlan === "FREE" ? "Iniciar Prueba Gratuita" : `Adquirir Plan ${selectedPlan}`}
                  </h3>
                  <p className="text-[11px] text-zinc-400">Modalidad Híbrida: Transferencia Colombia o Pago en Línea</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Total Summary */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total a Pagar</p>
                <p className="text-2xl font-black text-white mt-0.5">
                  {selectedPlan === "FREE"
                    ? "$0 COP (7 Días)"
                    : selectedPlan === "STANDARD"
                    ? billingCycle === "annual"
                      ? "$690.000 COP"
                      : "$69.000 COP"
                    : selectedPlan === "PRO"
                    ? billingCycle === "annual"
                      ? "$1.190.000 COP"
                      : "$119.000 COP"
                    : billingCycle === "annual"
                    ? "$2.490.000 COP"
                    : "$249.000 COP"}
                </p>
              </div>
              <span className="text-xs text-orange-400 font-mono bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20 font-semibold">
                {billingCycle === "annual" ? "Renovación Anual" : "Renovación Mensual"}
              </span>
            </div>

            {selectedPlan !== "FREE" && (
              <>
                {/* Selector de Modalidad de Pago (Tabs) */}
                <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("transfer")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      paymentMode === "transfer"
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                  >
                    <Smartphone size={14} />
                    <span>Nequi / Bancolombia</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode("gateway")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      paymentMode === "gateway"
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>Pasarela Online (Wompi)</span>
                  </button>
                </div>

                {/* OPCIÓN 1: TRANSFERENCIA DIRECTA */}
                {paymentMode === "transfer" && (
                  <div className="flex flex-col gap-4">
                    {/* Tarjeta de Datos Bancarios de EcoPost */}
                    <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Building size={14} className="text-orange-400" /> Cuentas Oficiales para Transferir:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Nequi Card */}
                        <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                              Nequi
                            </span>
                            <p className="text-sm font-black text-white mt-1.5">{paymentConfig?.nequiNumber || "300 123 4567"}</p>
                            <p className="text-[10px] text-zinc-400">{paymentConfig?.nequiHolder || "EcoPost Colombia"}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(paymentConfig?.nequiNumber?.replace(/\s/g, "") || "3001234567", "Nequi")}
                            className="mt-2 text-[10px] text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 self-start"
                          >
                            <Copy size={11} />
                            <span>{copiedText === "Nequi" ? "¡Copiado!" : "Copiar Número"}</span>
                          </button>
                        </div>

                        {/* Bancolombia Card */}
                        <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              Bancolombia Ahorros
                            </span>
                            <p className="text-sm font-black text-white mt-1.5">{paymentConfig?.bancolombiaAccount || "123-456789-01"}</p>
                            <p className="text-[10px] text-zinc-400 truncate">{paymentConfig?.bancolombiaHolder || "EcoPost SAS"}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(paymentConfig?.bancolombiaAccount?.replace(/[-\s]/g, "") || "12345678901", "Bancolombia")}
                            className="mt-2 text-[10px] text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 self-start"
                          >
                            <Copy size={11} />
                            <span>{copiedText === "Bancolombia" ? "¡Copiado!" : "Copiar Cuenta"}</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        Transfiere el valor exacto desde tu aplicación bancaria y registra el número de comprobante abajo. El SuperAdmin validará los fondos y tu servicio quedará habilitado.
                      </p>
                    </div>

                    {/* Formulario de Registro de Comprobante */}
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-xs font-semibold text-zinc-400 block mb-1">
                          Canal desde el cual transferiste:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["Nequi", "Bancolombia", "Daviplata"] as const).map((channel) => (
                            <button
                              key={channel}
                              type="button"
                              onClick={() => setTransferChannel(channel)}
                              className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition text-center ${
                                transferChannel === channel
                                  ? "bg-orange-500/15 border-orange-500 text-orange-400"
                                  : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white"
                              }`}
                            >
                              {channel}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-400 block mb-1">
                          Número de Comprobante / Referencia de Transferencia <span className="text-rose-400">*</span>:
                        </label>
                        <input
                          type="text"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder="Ej: M12345678 o Nº Aprobación"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-400 block mb-1">
                          Nota o Titular de la cuenta que transfiere (opcional):
                        </label>
                        <input
                          type="text"
                          value={transferNotes}
                          onChange={(e) => setTransferNotes(e.target.value)}
                          placeholder="Ej: Transferido por Juan Pérez"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* OPCIÓN 2: PASARELA ONLINE */}
                {paymentMode === "gateway" && (
                  <div className="flex flex-col gap-4">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="text-orange-400" size={18} />
                        <div>
                          <p className="text-xs font-bold text-white">Pasarela Integrada Wompi (Bancolombia)</p>
                          <p className="text-[11px] text-zinc-400">Acepta PSE, Tarjetas de Crédito/Débito y Nequi en línea</p>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/[0.05] text-xs text-zinc-300 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                          <ShieldCheck size={14} /> Pago con activación 100% inmediata
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Al hacer clic en confirmar, se procesa la transacción de forma segura y tu plan se activa automáticamente en tu terminal sin esperas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition border border-white/[0.05]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPlan}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/20 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : selectedPlan === "FREE" ? (
                  "Iniciar Prueba de 7 Días"
                ) : paymentMode === "transfer" ? (
                  "Registrar Comprobante de Pago"
                ) : (
                  "Pagar y Activar Inmediato"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
