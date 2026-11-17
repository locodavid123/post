import React from "react";
import prisma from "@/lib/prisma";

export default async function UsuariosPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { business: { select: { name: true } } },
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Usuarios del Sistema</h2>
          <p className="text-sm text-zinc-400">Listado de usuarios registrados en la base de datos de EcoPost.</p>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Usuarios Registrados ({users.length})</h3>
        </div>

        {users.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            No hay usuarios registrados aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950 text-zinc-300 font-semibold text-xs border-b border-zinc-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Nombre Completo</th>
                  <th className="p-4">Correo Electrónico</th>
                  <th className="p-4">Negocio Asociado</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4 pr-6 text-right">Fecha de Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-900/50 transition-all">
                    <td className="p-4 pl-6 font-mono text-xs text-orange-400">
                      {user.id.slice(0, 8)}
                    </td>
                    <td className="p-4 text-zinc-100 font-semibold">{user.name || "Sin nombre"}</td>
                    <td className="p-4 text-xs text-zinc-400">{user.email}</td>
                    <td className="p-4 text-xs text-zinc-300">
                      {user.business?.name || "Sin negocio (Admin Global)"}
                    </td>
                    <td className="p-4 text-xs">
                      <span className={`px-2.5 py-1 rounded-full border font-semibold ${
                        user.role === "ADMIN" || user.role === "SUPERADMIN"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right text-xs text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
