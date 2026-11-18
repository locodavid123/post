"use client";
import React, { useState, useEffect } from "react";
import { Users, Search, Plus, Trash2, Shield, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  businessId: string | null;
  business?: {
    id: string;
    name: string;
    code: string | null;
  } | null;
}

interface BusinessOption {
  id: string;
  name: string;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // New user form state
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("USER");
  const [newBusinessId, setNewBusinessId] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, bizRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/businesses"),
      ]);

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(Array.isArray(uData) ? uData : []);
      }
      if (bizRes.ok) {
        const bData = await bizRes.json();
        setBusinesses(Array.isArray(bData) ? bData : []);
      }
    } catch (e) {
      console.error("Error loading admin users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;

    setSubmitting(true);
    setNotification(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          name: newName,
          role: newRole,
          businessId: newBusinessId || null,
        }),
      });

      if (res.ok) {
        setNotification({ type: "success", message: `Usuario "${newEmail}" creado exitosamente.` });
        setIsModalOpen(false);
        setNewEmail("");
        setNewName("");
        setNewPassword("");
        setNewRole("USER");
        setNewBusinessId("");
        loadData();
      } else {
        const err = await res.json();
        setNotification({ type: "error", message: err.message || "Error al crear usuario" });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red al crear usuario." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (currentRole === newRole) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setNotification({ type: "success", message: "Rol de usuario actualizado en PostgreSQL." });
        loadData();
      } else {
        setNotification({ type: "error", message: "Error al actualizar rol." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red." });
    }
  };

  const handleBusinessChange = async (userId: string, newBizId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: newBizId }),
      });
      if (res.ok) {
        setNotification({ type: "success", message: "Negocio asignado actualizado." });
        loadData();
      } else {
        setNotification({ type: "error", message: "Error al asignar negocio." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red." });
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`¿Eliminar la cuenta de "${email}" de PostgreSQL?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setNotification({ type: "success", message: `Usuario "${email}" eliminado.` });
        loadData();
      } else {
        const err = await res.json();
        setNotification({ type: "error", message: err.message || "No se pudo eliminar el usuario." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red." });
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      u.email.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.business?.name && u.business.name.toLowerCase().includes(q));

    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
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

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="text-orange-500" />
            Usuarios del Sistema
          </h2>
          <p className="text-sm text-zinc-400">
            Control de accesos, asignación de comercios y roles de administradores en PostgreSQL.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/15 flex items-center gap-2"
        >
          <Plus size={16} />
          Nuevo Usuario
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-3 rounded-2xl flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={18} className="text-zinc-500 ml-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo o comercio..."
            className="bg-transparent text-sm text-white focus:outline-none w-full placeholder:text-zinc-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-xs text-zinc-500 hover:text-zinc-300">
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-semibold uppercase">Rol:</span>
          {["ALL", "ADMIN", "SUPERADMIN", "USER"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                roleFilter === r
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {r === "ALL" ? "Todos" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">
            Usuarios Registrados ({filteredUsers.length})
          </h3>
          <button
            onClick={loadData}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw size={12} /> Actualizar
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-500">Cargando usuarios desde PostgreSQL...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">No se encontraron usuarios coincidentes.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950 text-zinc-300 font-semibold text-xs border-b border-zinc-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Usuario</th>
                  <th className="p-4">Correo</th>
                  <th className="p-4">Comercio Asignado</th>
                  <th className="p-4 text-center">Rol en Plataforma</th>
                  <th className="p-4">Registro</th>
                  <th className="p-4 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-900/50 transition-all">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-200">
                          {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-100 text-xs">{u.name || "Sin nombre"}</p>
                          <p className="font-mono text-[10px] text-zinc-500">ID: {u.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-zinc-300">{u.email}</td>
                    <td className="p-4 text-xs">
                      <select
                        value={u.businessId || ""}
                        onChange={(e) => handleBusinessChange(u.id, e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-orange-500"
                      >
                        <option value="">(Sin asignar - SuperAdmin Global)</option>
                        {businesses.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-center text-xs">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, u.role, e.target.value)}
                        className={`border rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none ${
                          u.role === "SUPERADMIN"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : u.role === "ADMIN"
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                            : "bg-zinc-800 text-zinc-300 border-zinc-700"
                        }`}
                      >
                        <option value="USER">USER (Mesero / Operador)</option>
                        <option value="ADMIN">ADMIN (Gerente de Local)</option>
                        <option value="SUPERADMIN">SUPERADMIN (Acceso Total)</option>
                      </select>
                    </td>
                    <td className="p-4 text-xs text-zinc-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 p-1.5 rounded-lg transition-all"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Crear Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-orange-500" size={18} />
                Crear Nuevo Usuario
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase text-zinc-400">Nombre Completo</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Laura Méndez"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase text-zinc-400">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="usuario@local.com"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase text-zinc-400">Contraseña *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase text-zinc-400">Rol</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="USER">USER (Común)</option>
                    <option value="ADMIN">ADMIN (Gerente)</option>
                    <option value="SUPERADMIN">SUPERADMIN</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase text-zinc-400">Comercio</label>
                  <select
                    value={newBusinessId}
                    onChange={(e) => setNewBusinessId(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">(Sin asignar)</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 transition disabled:opacity-50"
                >
                  {submitting ? "Creando..." : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
