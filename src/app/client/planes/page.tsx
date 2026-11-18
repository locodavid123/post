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
} from "lucide-react";

interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  plan: string;
  amount: number;
  billingCycle: string;
  paymentMethod: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

interface PlanInfo {
  id: string;
  name: string;
  plan: string;
  planStatus: string;
  planExpiresAt: string | null;
  billingCycle: string;
  subscriptions: SubscriptionInvoice[];
}

export default function ClientPlanesPage() {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
    setIsModalOpen(true);
  };

  const handleConfirmPlan = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    setNotification(null);

    try {
      const res = await fetch("/api/business/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          billingCycle,
          paymentMethod,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotification({
          type: "success",
          message: data.message || `¡Plan ${selectedPlan} activado exitosamente!`,
        });
        setIsModalOpen(false);
        fetchPlanInfo();
      } else {
        const err = await res.json();
        setNotification({ type: "error", message: err.message || "Error al procesar el plan." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red al activar el plan." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPlan = async () => {
    if (!confirm("¿Seguro que deseas pausar tu suscripción activa? Al finalizar el ciclo tu cuenta volverá al plan Gratuito.")) {
      return;
    }

    try {
      const res = await fetch("/api/business/plan", { method: "DELETE" });
      if (res.ok) {
        setNotification({ type: "success", message: "Suscripción cancelada correctamente." });
        fetchPlanInfo();
      }
    } catch {
      setNotification({ type: "error", message: "Error al cancelar la suscripción." });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-zinc-500">
        <RefreshCw size={24} className="animate-spin text-orange-500" />
        <p className="text-sm">Cargando estado de suscripción...</p>
      </div>
    );
  }

  const currentPlan = planInfo?.plan || "FREE";
  const currentStatus = planInfo?.planStatus || "ACTIVE";
  const expiresAt = planInfo?.planExpiresAt ? new Date(planInfo.planExpiresAt) : null;

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
                      ? `Prueba gratuita de 1 semana: ${days} día(s) restante(s) (Vence: ${expiresAt.toLocaleDateString()})`
                      : `Período de prueba de 7 días concluido (${expiresAt.toLocaleDateString()}). Elige un plan para seguir operando.`;
                  }
                  return `Próxima renovación: ${expiresAt.toLocaleDateString()} (${Math.max(0, days)} días restantes)`;
                })()
              ) : (
                "Plan sin fecha de expiración"
              )}
            </p>
          </div>
        </div>

        {currentPlan !== "FREE" && currentStatus === "ACTIVE" && (
          <button
            onClick={handleCancelPlan}
            className="text-xs text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/30 bg-zinc-950 px-4 py-2 rounded-xl transition"
          >
            Pausar / Cancelar Suscripción
          </button>
        )}
      </div>

      {/* Cycle Switcher */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h3 className="text-xl font-bold text-white">Planes y Tarifas Disponibles</h3>
        <p className="text-xs text-zinc-400 max-w-md">
          Selecciona el nivel que mejor se adapte a tu restaurante. Puedes actualizar o cambiar de plan en cualquier momento.
        </p>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl mt-2">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              billingCycle === "monthly" ? "bg-orange-500 text-white shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            Facturación Mensual
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              billingCycle === "annual" ? "bg-orange-500 text-white shadow-md" : "text-zinc-400 hover:text-white"
            }`}
          >
            Facturación Anual
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded font-bold">
              -15% Ahorro
            </span>
          </button>
        </div>
      </div>

      {/* Plans Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.key;
          const price = billingCycle === "annual" ? p.priceAnnual : p.priceMonthly;

          return (
            <div
              key={p.key}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                p.popular
                  ? "bg-gradient-to-b from-orange-500/10 via-zinc-900 to-zinc-900 border-2 border-orange-500/50 shadow-2xl shadow-orange-500/10 scale-[1.02]"
                  : "bg-zinc-900 border border-zinc-800"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles size={11} /> Más Popular
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
                {isCurrent ? (
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
                    <span>{p.priceMonthly === 0 ? "Seleccionar Plan" : "Adquirir este Plan"}</span>
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
              Historial de Recibos de Suscripción
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400">
              <thead className="bg-zinc-950 text-zinc-300 font-semibold border-b border-zinc-800">
                <tr>
                  <th className="p-3 pl-6">Nº Comprobante</th>
                  <th className="p-3">Plan Adquirido</th>
                  <th className="p-3">Ciclo</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Método</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 pr-6 text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {planInfo.subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-950/40">
                    <td className="p-3 pl-6 font-mono font-bold text-white">{sub.invoiceNumber}</td>
                    <td className="p-3 text-zinc-200">{sub.plan}</td>
                    <td className="p-3 capitalize">{sub.billingCycle}</td>
                    <td className="p-3 text-zinc-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">{sub.paymentMethod}</td>
                    <td className="p-3">
                      <span className="text-emerald-400 font-bold">● {sub.status}</span>
                    </td>
                    <td className="p-3 pr-6 text-right font-bold text-white">
                      ${sub.amount.toLocaleString("es-CO")} COP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="text-orange-500" size={18} />
                Adquirir {selectedPlan}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-zinc-400 font-semibold uppercase">Total a Facturar</p>
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
                <span className="text-xs text-orange-400 font-mono bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                  {billingCycle === "annual" ? "Renovación Anual" : "Renovación Mensual"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-semibold uppercase text-zinc-400">Método de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Tarjeta", "Transferencia"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition text-center ${
                        paymentMethod === m
                          ? "bg-orange-500/10 border-orange-500 text-orange-400"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {m === "Tarjeta" ? "💳 Tarjeta (Simulada)" : "🏦 Transferencia Bancaria"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-[11px] text-zinc-400 flex items-start gap-2 mt-1">
                <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={14} />
                <span>
                  La activación es inmediata. Los servicios como Jukebox y mesas adicionales se habilitarán automáticamente en tu terminal.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPlan}
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 transition disabled:opacity-50"
              >
                {submitting ? "Activando..." : "Confirmar y Activar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
