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
  const [bankName, setBankName] = useState("Bancolombia");
  const [bankAccount, setBankAccount] = useState("123-456789-01");
  const [bankType, setBankType] = useState("Ahorros");
  const [bankHolder, setBankHolder] = useState("EcoPost SAS (NIT: 901.234.567-8)");
  const [nequiNumber, setNequiNumber] = useState("300 123 4567");
  const [nequiHolder, setNequiHolder] = useState("EcoPost Colombia");
  const [daviplataNumber, setDaviplataNumber] = useState("");
  const [daviplataHolder, setDaviplataHolder] = useState("");
  const [paymentInstructions, setPaymentInstructions] = useState("");

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

        setBankName(data.bankName || "Bancolombia");
        setBankAccount(data.bankAccount || data.bancolombiaAccount || "");
        setBankType(data.bankType || data.bancolombiaType || "Ahorros");
        setBankHolder(data.bankHolder || data.bancolombiaHolder || "");
        setNequiNumber(data.nequiNumber !== undefined ? data.nequiNumber : "300 123 4567");
        setNequiHolder(data.nequiHolder || "EcoPost Colombia");
        setDaviplataNumber(data.daviplataNumber || "");
        setDaviplataHolder(data.daviplataHolder || "");
        setPaymentInstructions(data.paymentInstructions || "");

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
          bankName,
          bankAccount,
          bankType,
          bankHolder,
          nequiNumber,
          nequiHolder,
          daviplataNumber,
          daviplataHolder,
          paymentInstructions,
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
        {/* Canales de Pago Directo (Colombia - Modo Híbrido Flexible) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="text-orange-500" size={18} />
              Cuentas para Transferencia Directa (Cualquier Banco o Billetera)
            </h3>
            <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2.5 py-0.5 rounded-full border border-orange-500/20 font-bold uppercase">
              Modo Híbrido Flexible
            </span>
          </div>

          <div className="bg-zinc-950 border border-white/[0.06] rounded-xl p-4 text-xs text-zinc-300 flex flex-col gap-1.5 leading-relaxed">
            <p className="font-semibold text-orange-400">💡 ¿No tienes cuenta en Bancolombia, Nequi ni Daviplata? ¡No hay ningún problema!</p>
            <ul className="list-disc list-inside text-zinc-400 space-y-1 text-[11px]">
              <li><strong>Cualquier Banco:</strong> Puedes configurar la cuenta de cualquier entidad bancaria (Banco de Bogotá, Davivienda, BBVA, Scotiabank Colpatria, Nu Colombia, etc.).</li>
              <li><strong>Billeteras Opcionales:</strong> Si no tienes Nequi o Daviplata, déjalos en blanco; el sistema solo mostrará a los clientes las cuentas que tengas activas.</li>
              <li><strong>Pasarela Online:</strong> Si activas Wompi o Mercado Pago, la pasarela recauda con PSE y tarjetas y te deposita a la cuenta bancaria de tu preferencia.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Cuenta Bancaria Principal (Cualquier Banco) */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col gap-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building size={14} /> Cuenta Bancaria Principal (Cualquier Banco de Colombia o el Exterior)
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Transferencia ACH / Transfiya / Directa</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-zinc-500">Entidad Bancaria</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ej. Bancolombia, Davivienda, Banco de Bogotá, BBVA, Nu..."
                    className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-zinc-500">Número de Cuenta</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="Ej. 123-456789-01"
                    className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-zinc-500">Tipo de Cuenta</label>
                  <select
                    value={bankType}
                    onChange={(e) => setBankType(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                  >
                    <option value="Ahorros">Cuenta de Ahorros</option>
                    <option value="Corriente">Cuenta Corriente</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-zinc-500">Titular y NIT / Cédula</label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value)}
                  placeholder="Ej. Mi Empresa SAS (NIT: 900.123.456-7)"
                  className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Nequi (Opcional) */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Nequi (Opcional)</span>
                <span className="text-[10px] text-zinc-500">Dejar vacío si no lo usas</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-zinc-500">Número de Celular Nequi</label>
                <input
                  type="text"
                  value={nequiNumber}
                  onChange={(e) => setNequiNumber(e.target.value)}
                  placeholder="Ej. 300 123 4567 (o dejar vacío)"
                  className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-zinc-500">Nombre del Titular</label>
                <input
                  type="text"
                  value={nequiHolder}
                  onChange={(e) => setNequiHolder(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Daviplata (Opcional) */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Daviplata (Opcional)</span>
                <span className="text-[10px] text-zinc-500">Dejar vacío si no lo usas</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-zinc-500">Número Celular Daviplata</label>
                <input
                  type="text"
                  value={daviplataNumber}
                  onChange={(e) => setDaviplataNumber(e.target.value)}
                  placeholder="Ej. 310 987 6543 (o dejar vacío)"
                  className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-zinc-500">Nombre del Titular</label>
                <input
                  type="text"
                  value={daviplataHolder}
                  onChange={(e) => setDaviplataHolder(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Instrucciones de Pago Personalizadas */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-zinc-300">Instrucciones o Mensaje para el Cliente</label>
              <textarea
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                rows={2}
                placeholder="Ej. Realiza la transferencia desde cualquier banco vía Transfiya o ACH y registra tu número de comprobante..."
                className="bg-zinc-900 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
              />
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
