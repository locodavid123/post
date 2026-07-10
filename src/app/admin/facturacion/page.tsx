import React from "react";

interface BillingInvoice {
  id: string;
  businessName: string;
  plan: string;
  amount: number;
  date: string;
  status: "Cobrado" | "Fallido" | "Reintentando";
}

const invoices: BillingInvoice[] = [
  { id: "REC-9031", businessName: "Pizzería Nápoles", plan: "Premium Pro", amount: 49.99, date: "Hoy, 08:30 AM", status: "Cobrado" },
  { id: "REC-9030", businessName: "Sushi House", plan: "Premium Pro", amount: 49.99, date: "Ayer, 11:20 PM", status: "Cobrado" },
  { id: "REC-9029", businessName: "La Birrería Club", plan: "Premium Standard", amount: 29.99, date: "08/07/2026", status: "Cobrado" },
  { id: "REC-9028", businessName: "Hamburguesería Tino", plan: "Premium Pro", amount: 49.99, date: "07/07/2026", status: "Fallido" },
  { id: "REC-9027", businessName: "Café París", plan: "Premium Standard", amount: 29.99, date: "06/07/2026", status: "Reintentando" },
];

export default function FacturacionPage() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Facturación y Cobros</h2>
        <p className="text-sm text-zinc-400">Control de pasarela de pagos, suscripciones activas y conciliación de facturas.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Facturado este Mes</p>
          <p className="text-3xl font-bold text-white mt-2">$8,450.00</p>
          <p className="text-xs text-emerald-500 mt-2 font-medium">96% de efectividad de cobro</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Cobros Fallidos</p>
          <p className="text-3xl font-bold text-rose-500 mt-2">$49.99</p>
          <p className="text-xs text-zinc-400 mt-2 font-medium">1 factura pendiente de reintento</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Suscripciones Recurrentes</p>
          <p className="text-3xl font-bold text-white mt-2">98 Activas</p>
          <p className="text-xs text-zinc-400 mt-2 font-medium">Crecimiento de +4% esta semana</p>
        </div>
      </div>

      {/* Invoices log */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Historial de Transacciones Globales</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950 text-zinc-300 font-semibold text-xs border-b border-zinc-800 uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">Recibo</th>
                <th className="p-4">Comercio</th>
                <th className="p-4">Plan Adquirido</th>
                <th className="p-4">Fecha de Cobro</th>
                <th className="p-4">Estado</th>
                <th className="p-4 pr-6 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-900/50 transition-all">
                  <td className="p-4 pl-6 font-semibold text-white">#{inv.id}</td>
                  <td className="p-4 text-zinc-100 font-semibold">{inv.businessName}</td>
                  <td className="p-4 text-xs text-zinc-400">{inv.plan}</td>
                  <td className="p-4 text-xs text-zinc-500">{inv.date}</td>
                  <td className="p-4 text-xs">
                    <span className={`font-semibold ${
                      inv.status === "Cobrado"
                        ? "text-emerald-500"
                        : inv.status === "Reintentando"
                        ? "text-amber-500"
                        : "text-rose-500"
                    }`}>
                      ● {inv.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right font-bold text-white">${inv.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
