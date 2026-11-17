import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function NegociosPage() {
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { select: { name: true, email: true, role: true } },
      _count: { select: { tables: true, products: true, songRequests: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Comercios Afiliados</h2>
          <p className="text-sm text-zinc-400">Listado y administración general de las cuentas de restaurantes registradas en la base de datos.</p>
        </div>
        <Link
          href="/register"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/15"
        >
          + Registrar Nuevo Comercio
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">
            Comercios Registrados ({businesses.length})
          </h3>
        </div>

        {businesses.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-3">
            <span className="text-4xl">🏪</span>
            <p className="text-base text-zinc-400 font-medium">Aún no hay comercios registrados en el sistema.</p>
            <p className="text-xs text-zinc-500">Puedes registrar el primero desde la página de registro o usando la API.</p>
            <Link
              href="/register"
              className="mt-2 text-xs bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition"
            >
              Crear Comercio
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950 text-zinc-300 font-semibold text-xs border-b border-zinc-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">ID / Código</th>
                  <th className="p-4">Nombre Comercial</th>
                  <th className="p-4">Titular / Contacto</th>
                  <th className="p-4">Teléfono</th>
                  <th className="p-4 text-center">Mesas</th>
                  <th className="p-4 text-center">Productos</th>
                  <th className="p-4 text-center">Jukebox</th>
                  <th className="p-4 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {businesses.map((biz) => {
                  const owner = biz.users[0]?.name || biz.users[0]?.email || "Sin asignar";
                  return (
                    <tr key={biz.id} className="hover:bg-zinc-900/50 transition-all">
                      <td className="p-4 pl-6 font-mono text-xs text-orange-400">
                        {biz.code || biz.id.slice(0, 8)}
                      </td>
                      <td className="p-4 text-zinc-100 font-semibold">{biz.name}</td>
                      <td className="p-4 text-xs text-zinc-400">{owner}</td>
                      <td className="p-4 text-xs text-zinc-500">{biz.phone || "—"}</td>
                      <td className="p-4 text-center text-xs font-semibold text-zinc-200">
                        {biz._count.tables}
                      </td>
                      <td className="p-4 text-center text-xs font-semibold text-zinc-200">
                        {biz._count.products}
                      </td>
                      <td className="p-4 text-center text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          biz.enableJukebox ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                        }`}>
                          {biz.enableJukebox ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <Link
                          href={`/admin/negocios/${biz.id}`}
                          className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all"
                        >
                          Configuración
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
