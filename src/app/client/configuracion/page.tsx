"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ConfiguracionPage() {
  const search = useSearchParams();
  const businessId = search.get("businessId");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [enableJukebox, setEnableJukebox] = useState(true);
  const [enableQrOrders, setEnableQrOrders] = useState(true);
  const [alertSound, setAlertSound] = useState("ping");

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    fetch(`/api/business/${businessId}/settings`)
      .then((r) => r.json())
      .then((data) => {
        const s = data?.settings;
        if (s) {
          setName(s.name || "");
          setPhone(s.phone || "");
          setAddress(s.address || "");
          setEnableJukebox(Boolean(s.enableJukebox));
          setEnableQrOrders(Boolean(s.enableQrOrders));
          setAlertSound(s.alertSound || "ping");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [businessId]);

  async function handleSave() {
    if (!businessId) {
      setStatus("businessId missing in URL query");
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/business/${businessId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, enableJukebox, enableQrOrders, alertSound }),
      });
      if (!res.ok) throw new Error("Error saving settings");
      setStatus("Guardado correctamente");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Configuración del Local</h2>
        <p className="text-sm text-zinc-400">Administra los parámetros de tu restaurante, información de contacto y preferencias de la app.</p>
      </div>

      {/* Settings Sections */}
      <div className="flex flex-col gap-6">
        
        {/* Restaurant Profile */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white pb-2 border-b border-zinc-800">Información del Restaurante</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nombre del Negocio</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Teléfono de Contacto</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Dirección Física</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Feature toggles */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white pb-2 border-b border-zinc-800">Preferencias de EcoPost</h3>
          <div className="flex flex-col gap-4">
            
            {/* Toggle 1: Jukebox */}
            <div className="flex justify-between items-center p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
              <div>
                <h4 className="text-sm font-semibold text-white">Activar Jukebox</h4>
                <p className="text-xs text-zinc-500 mt-1">Permite a los comensales pedir música escaneando el código QR de su mesa.</p>
              </div>
               <div className="relative">
                 <label className="switch">
                   <input type="checkbox" checked={enableJukebox} onChange={(e) => setEnableJukebox(e.target.checked)} />
                   <span className="slider" />
                 </label>
               </div>
            </div>

            {/* Toggle 2: Pedidos QR */}
                <div className="flex justify-between items-center p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Autopedido por QR</h4>
                    <p className="text-xs text-zinc-500 mt-1">Los clientes pueden hacer pedidos directamente a cocina desde su teléfono sin mesero.</p>
                  </div>
                  <div className="relative">
                    <label className="switch">
                      <input type="checkbox" checked={enableQrOrders} onChange={(e) => setEnableQrOrders(e.target.checked)} />
                      <span className="slider" />
                    </label>
                  </div>
                </div>

            {/* Toggle 3: Notificaciones de pedidos */}
            <div className="flex flex-col gap-2 p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
              <div>
                <h4 className="text-sm font-semibold text-white">Alertas Sonoras de Pedido</h4>
                <p className="text-xs text-zinc-500 mt-1">Reproducir un sonido cada vez que ingrese un nuevo pedido en cola.</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="text" value={alertSound} onChange={(e) => setAlertSound(e.target.value)} className="bg-zinc-900 px-3 py-2 rounded" />
                <span className="text-xs text-zinc-500">Nombre del sonido (ej. ping, ding)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              if (!businessId) return;
              setLoading(true);
              fetch(`/api/business/${businessId}/settings`)
                .then((r) => r.json())
                .then((d) => {
                  const s = d?.settings;
                  if (s) {
                    setName(s.name || "");
                    setPhone(s.phone || "");
                    setAddress(s.address || "");
                    setEnableJukebox(Boolean(s.enableJukebox));
                    setEnableQrOrders(Boolean(s.enableQrOrders));
                    setAlertSound(s.alertSound || "ping");
                  }
                })
                .catch((e) => console.error(e))
                .finally(() => setLoading(false));
            }}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm px-6 py-2.5 rounded-xl transition-all"
          >
            Descartar Cambios
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/15 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
        {status && <div className="mt-2 text-sm text-zinc-300">{status}</div>}

      </div>
    </div>
  );
}
