"use client";
import React, { useState, useEffect } from "react";
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building,
  Smartphone,
  CreditCard,
} from "lucide-react";

interface SystemConfig {
  platformName: string;
  supportEmail: string;
  currency: string;
  standardPlanPrice: number;
  proPlanPrice: number;
  enterprisePlanPrice?: number;
  allowSelfRegistration: boolean;
  nequiNumber?: string;
  nequiHolder?: string;
  bancolombiaAccount?: string;
  bancolombiaType?: string;
  bancolombiaHolder?: string;
  daviplataNumber?: string;
  daviplataHolder?: string;
  wompiPublicKey?: string;
  wompiSandbox?: boolean;
}

export default function AdminConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form states
  const [platformName, setPlatformName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [currency, setCurrency] = useState("COP ($)");
  const [standardPlanPrice, setStandardPlanPrice] = useState("69000");
  const [proPlanPrice, setProPlanPrice] = useState("119000");
  const [enterprisePlanPrice, setEnterprisePlanPrice] = useState("249000");
  const [allowSelfRegistration, setAllowSelfRegistration] = useState(true);

  // Colombian Banking Details
  const [nequiNumber, setNequiNumber] = useState("300 123 4567");
  const [nequiHolder, setNequiHolder] = useState("EcoPost Colombia");
  const [bancolombiaAccount, setBancolombiaAccount] = useState("123-456789-01");
  const [bancolombiaType, setBancolombiaType] = useState("Ahorros");
  const [bancolombiaHolder, setBancolombiaHolder] = useState("EcoPost SAS (NIT: 901.234.567-8)");
  const [daviplataNumber, setDaviplataNumber] = useState("300 123 4567");
  const [daviplataHolder, setDaviplataHolder] = useState("EcoPost Colombia");

  // Wompi Online Gateway
  const [wompiPublicKey, setWompiPublicKey] = useState("");
  const [wompiSandbox, setWompiSandbox] = useState(true);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const data = await res.json();
        setPlatformName(data.platformName || "EcoPost Gastro POS");
        setSupportEmail(data.supportEmail || "admin@ecopost.local");
        setCurrency(data.currency || "COP ($)");
        setStandardPlanPrice(String(data.standardPlanPrice || 69000));
        setProPlanPrice(String(data.proPlanPrice || 119000));
        setEnterprisePlanPrice(String(data.enterprisePlanPrice || 249000));
        setAllowSelfRegistration(data.allowSelfRegistration !== false);

        setNequiNumber(data.nequiNumber || "300 123 4567");
        setNequiHolder(data.nequiHolder || "EcoPost Colombia");
        setBancolombiaAccount(data.bancolombiaAccount || "123-456789-01");
        setBancolombiaType(data.bancolombiaType || "Ahorros");
        setBancolombiaHolder(data.bancolombiaHolder || "EcoPost SAS (NIT: 901.234.567-8)");
        setDaviplataNumber(data.daviplataNumber || "300 123 4567");
        setDaviplataHolder(data.daviplataHolder || "EcoPost Colombia");

        setWompiPublicKey(data.wompiPublicKey || "");
        setWompiSandbox(data.wompiSandbox !== false);
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
          standardPlanPrice: parseFloat(standardPlanPrice) || 69000,
          proPlanPrice: parseFloat(proPlanPrice) || 119000,
          enterprisePlanPrice: parseFloat(enterprisePlanPrice) || 249000,
          allowSelfRegistration,
          nequiNumber,
          nequiHolder,
          bancolombiaAccount,
          bancolombiaType,
          bancolombiaHolder,
          daviplataNumber,
          daviplataHolder,
          wompiPublicKey,
          wompiSandbox,
        }),
      });

      if (res.ok) {
        setNotification({ type: "success", message: "¡Configuración de pagos y sistema guardada con éxito!" });
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
        <p className="text-sm">Cargando configuración...</p>
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
          Configuración Global y Canales de Pago
        </h2>
        <p className="text-sm text-zinc-400">
          Administra las cuentas bancarias para transferencias en Colombia (Modo Híbrido), tarifas y pasarelas.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Canales de Pago Directo (Colombia - Modo Híbrido) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="text-orange-500" size={18} />
              Cuentas para Transferencia Directa (Nequi / Bancolombia / Daviplata)
            </h3>
            <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2.5 py-0.5 rounded-full border border-orange-500/20 font-bold uppercase">
              Modo Híbrido
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            Estos datos bancarios se mostrarán a los restaurantes en la pantalla de adquisición de planes para que realicen transferencias directas y reporten su número de comprobante.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nequi */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col gap-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Cuenta Nequi</span>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-zinc-500">Número de Celular Nequi</label>
                <input
                  type="text"
                  value={nequiNumber}
                  onChange={(e) => setNequiNumber(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-zinc-500">Nombre del Titular</label>
                <input
                  type="text"
                  value={nequiHolder}
                  onChange={(e) => setNequiHolder(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Bancolombia */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col gap-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Cuenta Bancolombia</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-zinc-500">Número de Cuenta</label>
                  <input
                    type="text"
                    value={bancolombiaAccount}
                    onChange={(e) => setBancolombiaAccount(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-zinc-500">Tipo de Cuenta</label>
                  <select
                    value={bancolombiaType}
                    onChange={(e) => setBancolombiaType(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                  >
                    <option value="Ahorros">Ahorros</option>
                    <option value="Corriente">Corriente</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-zinc-500">Titular y NIT / Cédula</label>
                <input
                  type="text"
                  value={bancolombiaHolder}
                  onChange={(e) => setBancolombiaHolder(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Daviplata */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col gap-3 md:col-span-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Daviplata</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-zinc-500">Número Celular Daviplata</label>
                  <input
                    type="text"
                    value={daviplataNumber}
                    onChange={(e) => setDaviplataNumber(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-zinc-500">Nombre del Titular</label>
                  <input
                    type="text"
                    value={daviplataHolder}
                    onChange={(e) => setDaviplataHolder(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pasarela Online (Wompi) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="text-orange-500" size={18} />
              Pasarela de Pagos en Línea (Wompi - Bancolombia)
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">PSE, Tarjetas, Botón Bancolombia</span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Wompi Public Key (Llave Pública)
              </label>
              <input
                type="text"
                value={wompiPublicKey}
                onChange={(e) => setWompiPublicKey(e.target.value)}
                placeholder="pub_test_... o pub_prod_..."
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs px-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="wompiSandbox"
                checked={wompiSandbox}
                onChange={(e) => setWompiSandbox(e.target.checked)}
                className="rounded border-zinc-700 text-orange-500 focus:ring-0"
              />
              <label htmlFor="wompiSandbox" className="text-xs text-zinc-300 cursor-pointer">
                Activar Modo Sandbox (Ambiente de Pruebas de Wompi)
              </label>
            </div>
          </div>
        </div>

        {/* Tarifas de Planes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
          <h3 className="text-base font-bold text-white pb-2 border-b border-zinc-800">
            Tarifas Mensuales de los Planes ($ COP)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Plan Standard ($ COP)
              </label>
              <input
                type="number"
                step="1000"
                value={standardPlanPrice}
                onChange={(e) => setStandardPlanPrice(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Plan Pro ($ COP)
              </label>
              <input
                type="number"
                step="1000"
                value={proPlanPrice}
                onChange={(e) => setProPlanPrice(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Plan Enterprise ($ COP)
              </label>
              <input
                type="number"
                step="1000"
                value={enterprisePlanPrice}
                onChange={(e) => setEnterprisePlanPrice(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none"
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
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? "Guardando..." : "Guardar Configuración de Pagos"}
          </button>
        </div>
      </form>
    </div>
  );
}
