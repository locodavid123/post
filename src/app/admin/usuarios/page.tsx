import React from "react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "SuperAdmin" | "Soporte" | "Auditor";
  status: "Activo" | "Inactivo";
  lastLogin: string;
}

const adminUsers: AdminUser[] = [
  { id: 1, name: "David López", email: "david@ecopost.com", role: "SuperAdmin", status: "Activo", lastLogin: "Hoy, 09:30 AM" },
  { id: 2, name: "Paula Gomez", email: "paula@ecopost.com", role: "Soporte", status: "Activo", lastLogin: "Hoy, 08:15 AM" },
  { id: 3, name: "Andrés Díaz", email: "andres@ecopost.com", role: "Auditor", status: "Activo", lastLogin: "Ayer, 05:40 PM" },
  { id: 4, name: "Julieta Marín", email: "julieta@ecopost.com", role: "Soporte", status: "Inactivo", lastLogin: "Hace 5 días" },
];

export default function UsuariosPage() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Usuarios del Sistema</h2>
          <p className="text-sm text-zinc-400">Control de acceso y asignación de roles para el personal interno de EcoPost.</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/15">
          + Invitar Usuario
        </button>
      </div>

      {/* Users table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Personal con Acceso</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950 text-zinc-300 font-semibold text-xs border-b border-zinc-800 uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Nombre Completo</th>
                <th className="p-4">Correo Electrónico</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Último Ingreso</th>
                <th className="p-4">Estado</th>
                <th className="p-4 pr-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {adminUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-900/50 transition-all">
                  <td className="p-4 pl-6 font-semibold text-white">#{user.id}</td>
                  <td className="p-4 text-zinc-100 font-semibold">{user.name}</td>
                  <td className="p-4 text-xs text-zinc-400">{user.email}</td>
                  <td className="p-4 text-xs">
                    <span className={`px-2.5 py-1 rounded-full border font-semibold ${
                      user.role === "SuperAdmin"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : user.role === "Soporte"
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : "bg-zinc-800 text-zinc-300 border-zinc-700"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-zinc-500">{user.lastLogin}</td>
                  <td className="p-4 text-xs">
                    <span className={`font-semibold ${user.status === "Activo" ? "text-emerald-500" : "text-zinc-600"}`}>
                      ● {user.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button className="bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-semibold text-xs px-3 py-1.5 rounded-lg transition-all">
                      Editar Rol
                    </button>
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
