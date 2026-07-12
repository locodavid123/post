import React from "react";

export default function ReportesPage() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Analíticas de Plataforma</h2>
          <p className="text-sm text-zinc-400">Estadísticas avanzadas, crecimiento de suscripciones y facturación global acumulada.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-zinc-800 transition-all">
            Filtrar: Últimos 30 días
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/15">
            Generar Reporte PDF
          </button>
        </div>
      </div>

      {/* Grid of chart placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue chart mockup */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-white">Ingresos por Suscripciones</h3>
            <p className="text-xs text-zinc-500 mt-1">Comparativa de ingresos mensuales recurrentes (MRR) en USD.</p>
          </div>
          
          {/* Mock chart bars */}
          <div className="h-64 flex items-end justify-between gap-2 pt-6 border-b border-zinc-800">
            {[45, 60, 55, 70, 95, 80, 110, 130].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  style={{ height: `${height}%` }}
                  className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg hover:from-orange-500 hover:to-orange-300 transition-all cursor-pointer relative group"
                >
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-950 text-zinc-200 border border-zinc-800 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${height * 120}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-medium">Mes {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signup chart mockup */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-white">Nuevos Restaurantes Adheridos</h3>
            <p className="text-xs text-zinc-500 mt-1">Crecimiento mensual de la base de clientes gastronómicos.</p>
          </div>
          
          {/* Mock chart bars */}
          <div className="h-64 flex items-end justify-between gap-2 pt-6 border-b border-zinc-800">
            {[20, 35, 45, 40, 55, 65, 80, 98].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  style={{ height: `${height}%` }}
                  className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg hover:from-emerald-500 hover:to-emerald-300 transition-all cursor-pointer relative group"
                >
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-950 text-zinc-200 border border-zinc-800 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {height} locales
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-medium">Mes {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
