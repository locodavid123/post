import React from "react";

export default function AdminConfiguracionPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Configuración del Sistema</h2>
        <p className="text-sm text-zinc-400">Control de tarifas globales, parámetros de suscripciones y claves de servicios de la plataforma.</p>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Subscription Plan Rates */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white pb-2 border-b border-zinc-800">Precios de Suscripciones (Mensual USD)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Plan Premium Standard</label>
              <input
                type="text"
                defaultValue="29.99"
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Plan Premium Pro</label>
              <input
                type="text"
                defaultValue="49.99"
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Global APIs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white pb-2 border-b border-zinc-800">Integración de Pasarela de Pagos (Stripe)</h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Stripe Public Key</label>
              <input
                type="password"
                defaultValue="pk_live_51N8x..."
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Stripe Secret Key</label>
              <input
                type="password"
                defaultValue="sk_live_51N8x..."
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end gap-3">
          <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm px-6 py-2.5 rounded-xl transition-all">
            Descartar
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/15">
            Guardar Configuración Global
          </button>
        </div>

      </div>
    </div>
  );
}
