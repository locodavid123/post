import React from "react";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  category: string;
  owner: string;
  plan: "Premium Pro" | "Premium Standard" | "Gratuito";
  tablesCount: number;
  status: "Activo" | "Suspendido";
}

const businessList: Business[] = [
  { id: "101", name: "Pizzería Nápoles", category: "Pizzería", owner: "Carlos N.", plan: "Premium Pro", tablesCount: 16, status: "Activo" },
  { id: "102", name: "La Birrería Club", category: "Cervecería / Bar", owner: "Martin B.", plan: "Premium Standard", tablesCount: 12, status: "Activo" },
  { id: "103", name: "Sándwiches del Bosque", category: "Restaurante", owner: "Laura D.", plan: "Gratuito", tablesCount: 8, status: "Activo" },
  { id: "104", name: "Sushi House", category: "Comida Asiática", owner: "Kenzo S.", plan: "Premium Pro", tablesCount: 20, status: "Activo" },
  { id: "105", name: "El Bodegón de Palermo", category: "Bodegón tradicional", owner: "Eduardo P.", plan: "Premium Standard", tablesCount: 24, status: "Suspendido" },
];

export default function NegociosPage() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Comercios Afiliados</h2>
          <p className="text-sm text-zinc-400">Listado, habilitación y administración general de las cuentas de restaurantes.</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/15">
          + Registrar Comercio
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Comercios Registrados</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar comercio..."
              className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs px-4 py-2 rounded-xl focus:border-orange-500 focus:outline-none w-48 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950 text-zinc-300 font-semibold text-xs border-b border-zinc-800 uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Nombre Comercial</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Titular</th>
                <th className="p-4">Plan</th>
                <th className="p-4 text-center">Mesas</th>
                <th className="p-4">Estado</th>
                <th className="p-4 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {businessList.map((biz) => (
                <tr key={biz.id} className="hover:bg-zinc-900/50 transition-all">
                  <td className="p-4 pl-6 font-semibold text-white">#{biz.id}</td>
                  <td className="p-4 text-zinc-100 font-semibold">{biz.name}</td>
                  <td className="p-4 text-xs text-zinc-400">{biz.category}</td>
                  <td className="p-4 text-xs text-zinc-500">{biz.owner}</td>
                  <td className="p-4 text-xs">
                    <span className={`px-2.5 py-1 rounded-full border font-medium ${
                      biz.plan === "Premium Pro"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : biz.plan === "Premium Standard"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700/50"
                    }`}>
                      {biz.plan}
                    </span>
                  </td>
                  <td className="p-4 text-center text-xs font-semibold text-zinc-200">{biz.tablesCount}</td>
                  <td className="p-4 text-xs">
                    <span className={`font-semibold ${biz.status === "Activo" ? "text-emerald-500" : "text-rose-500"}`}>
                      ● {biz.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <Link
                      href={`/admin/negocios/${biz.id}`}
                      className="bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all"
                    >
                      Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
