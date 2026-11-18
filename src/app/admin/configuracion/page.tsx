"use client";
import React, { useState, useEffect } from "react";
import { Sliders, Save, CheckCircle2, AlertCircle, RefreshCw, Key, Shield, HelpCircle } from "lucide-react";

interface SystemConfig {
  platformName: string;
  supportEmail: string;
  currency: string;
  standardPlanPrice: number;
  proPlanPrice: number;
  allowSelfRegistration: boolean;
  youtubeApiKeyConfigured: boolean;
  stripePublicKey: string;
  stripeSecretKey: string;
}

export default function AdminConfiguracionPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form states
  const [platformName, setPlatformName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [currency, setCurrency] = useState("USD ($)");
  const [standardPlanPrice, setStandardPlanPrice] = useState("29.99");
  const [proPlanPrice, setProPlanPrice] = useState("49.99");
  const [allowSelfRegistration, setAllowSelfRegistration] = useState(true);
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setPlatformName(data.platformName || "");
        setSupportEmail(data.supportEmail || "");
        setCurrency(data.currency || "USD ($)");
        setStandardPlanPrice(String(data.standardPlanPrice || 29.99));
        setProPlanPrice(String(data.proPlanPrice || 49.99));
        setAllowSelfRegistration(data.allowSelfRegistration !== false);
        setStripePublicKey(data.stripePublicKey || "");
        setStripeSecretKey(data.stripeSecretKey || "");
      }
    } catch (e) {
      console.error("Error loading config:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformName,
          supportEmail,
          currency,
          standardPlanPrice: parseFloat(standardPlanPrice) || 29.99,
          proPlanPrice: parseFloat(proPlanPrice) || 49.99,
          allowSelfRegistration,
          stripePublicKey,
          stripeSecretKey,
        }),
      });

      if (res.ok) {
        setNotification({ type: "success", message: "¡Configuración global guardada y aplicada con éxito!" });
        fetchConfig();
      } else {
        setNotification({ type: "error", message: "No se pudo guardar la configuración." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red al guardar." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-zinc-500">
        <RefreshCw size={24} className="animate-spin text-orange-500" />
        <p className="text-sm">Cargando configuración del sistema...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
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

      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sliders className="text-orange-500" />
          Configuración Global del Sistema
        </h2>
        <p className="text-sm text-zinc-400">
          Control de tarifas globales, parámetros de registro y claves de integración de la plataforma.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* General Brand Settings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
          <h3 className="text-base font-bold text-white pb-2 border-b border-zinc-800">
            Identidad de la Plataforma
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-zinc-400">Nombre de la Plataforma</label>
              <input
                type="text"
                required
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-zinc-400">Email de Soporte / Admin</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-zinc-400">Moneda del Sistema</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none"
              >
                <option value="USD ($)">USD ($) - Dólares Estadounidenses</option>
                <option value="EUR (€)">EUR (€) - Euros</option>
                <option value="MXN ($)">MXN ($) - Pesos Mexicanos</option>
                <option value="ARS ($)">ARS ($) - Pesos Argentinos</option>
                <option value="COP ($)">COP ($) - Pesos Colombianos</option>
              </select>
            </div>

            <div className="flex flex-col justify-center gap-1.5">
              <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer mt-5">
                <input
                  type="checkbox"
                  checked={allowSelfRegistration}
                  onChange={(e) => setAllowSelfRegistration(e.target.checked)}
                  className="rounded border-zinc-700 text-orange-500 focus:ring-0"
                />
                <span>Permitir auto-registro de nuevos clientes en /register</span>
              </label>
            </div>
          </div>
        </div>

        {/* Subscription Plan Rates */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
          <h3 className="text-base font-bold text-white pb-2 border-b border-zinc-800">
            Tarifas de Planes Mensuales (Referenciales)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Plan Standard ($ USD / mes)
              </label>
              <input
                type="number"
                step="0.01"
                value={standardPlanPrice}
                onChange={(e) => setStandardPlanPrice(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Plan Pro ($ USD / mes)
              </label>
              <input
                type="number"
                step="0.01"
                value={proPlanPrice}
                onChange={(e) => setProPlanPrice(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateway (Stripe) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
          <h3 className="text-base font-bold text-white pb-2 border-b border-zinc-800 flex items-center justify-between">
            <span>Pasarela de Cobros (Stripe)</span>
            <span className="text-[10px] text-zinc-500 font-mono">Opcional para suscripciones</span>
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Stripe Public Key
              </label>
              <input
                type="text"
                value={stripePublicKey}
                onChange={(e) => setStripePublicKey(e.target.value)}
                placeholder="pk_live_..."
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none font-mono text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Stripe Secret Key
              </label>
              <input
                type="password"
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
                placeholder="sk_live_..."
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={fetchConfig}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs px-5 py-2.5 rounded-xl transition"
          >
            Descartar Cambios
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? "Guardando..." : "Guardar Configuración Global"}
          </button>
        </div>
      </form>
    </div>
  );
}
