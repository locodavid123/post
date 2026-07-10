import React from "react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalleNegocioPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Back button & Title */}
      <div className="flex flex-col gap-4">
        <Link href="/admin/negocios" className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold transition-all">
          ← Volver a negocios
        </Link>
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight text-white">Detalle de Comercio #{id}</h2>
            <p className="text-sm text-zinc-400">Panel administrativo individual para control de cuenta y auditoría.</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 font-semibold text-xs px-4 py-2 rounded-xl transition-all">
              Suspender Cuenta
            </button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all">
              Editar Datos
            </button>
          </div>
        </div>
      </div>

      {/* Main Details layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: General Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-extrabold text-orange-400 text-2xl">
              PN
            </div>
            <h3 className="text-lg font-bold text-white mt-2">Pizzería Nápoles</h3>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-semibold">
              Plan Premium Pro
            </span>
          </div>

          <div className="border-t border-zinc-800 pt-4 flex flex-col gap-3">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Habilitación:</span>
              <span className="font-semibold text-emerald-500">Activo</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Registrado el:</span>
              <span className="font-semibold text-zinc-200">12/04/2026</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Propietario:</span>
              <span className="font-semibold text-zinc-200">Carlos N.</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Teléfono:</span>
              <span className="font-semibold text-zinc-200">+54 11 9876-5432</span>
            </div>
          </div>
        </div>

        {/* Right Side: Logs / Stats */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Platform Usage Stats */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white">Uso de la Plataforma</h3>
            <div className="grid grid-cols-3 gap-4 text-center mt-2">
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                <p className="text-[10px] text-zinc-500 font-semibold uppercase">Mesas Activas</p>
                <p className="text-xl font-bold text-white mt-1">16</p>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                <p className="text-[10px] text-zinc-500 font-semibold uppercase">Pedidos (Mes)</p>
                <p className="text-xl font-bold text-white mt-1">1,240</p>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                <p className="text-[10px] text-zinc-500 font-semibold uppercase">Jukebox Canciones</p>
                <p className="text-xl font-bold text-white mt-1">456</p>
              </div>
            </div>
          </div>

          {/* Subscriptions invoices list */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white">Historial de Cobros</h3>
            <div className="flex flex-col gap-3">
              {[
                { period: "Junio 2026", amount: "$50.00", method: "Tarjeta de Crédito", status: "Cobrado" },
                { period: "Mayo 2026", amount: "$50.00", method: "Tarjeta de Crédito", status: "Cobrado" },
                { period: "Abril 2026", amount: "$50.00", method: "Tarjeta de Crédito", status: "Cobrado" },
              ].map((inv, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Período: {inv.period}</h4>
                    <p className="text-[10px] text-zinc-500">{inv.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{inv.amount}</p>
                    <span className="text-[9px] text-emerald-500 font-semibold">{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
