"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Search, Plus, Trash2, Settings, AlertCircle, CheckCircle2 } from "lucide-react";

interface Business {
  id: string;
  name: string;
  code: string | null;
  phone: string | null;
  address: string | null;
  plan?: string;
  planStatus?: string;
  planExpiresAt?: string | null;
  enableJukebox: boolean;
  enableQrOrders: boolean;
  createdAt: string;
  users: Array<{ id: string; name: string | null; email: string; role: string }>;
  _count: {
    tables: number;
    products: number;
    sales: number;
    songRequests: number;
  };
}

export default function NegociosPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newEnableJukebox, setNewEnableJukebox] = useState(true);
  const [newEnableQrOrders, setNewEnableQrOrders] = useState(true);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/businesses");
      if (res.ok) {
        const data = await res.json();
        setBusinesses(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Error al cargar negocios:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    setNotification(null);
    try {
      const res = await fetch("/api/admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          address: newAddress,
          enableJukebox: newEnableJukebox,
          enableQrOrders: newEnableQrOrders,
        }),
      });

      if (res.ok) {
        setNotification({ type: "success", message: `¡Comercio "${newName}" creado con éxito!` });
        setIsModalOpen(false);
        setNewName("");
        setNewPhone("");
        setNewAddress("");
        fetchBusinesses();
      } else {
        const err = await res.json();
        setNotification({ type: "error", message: err.message || "Error al crear el comercio" });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red al conectar con el servidor" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePlanStatus = async (id: string, name: string, currentStatus?: string) => {
    const nextStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    const actionName = nextStatus === "ACTIVE" ? "reactivar" : "suspender";
    if (!confirm(`¿Deseas ${actionName} el plan y servicios de "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/businesses/${id}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planStatus: nextStatus }),
      });
      if (res.ok) {
        setNotification({
          type: "success",
          message: nextStatus === "ACTIVE" ? `Servicios de "${name}" reactivados.` : `Servicios de "${name}" suspendidos.`,
        });
        fetchBusinesses();
      } else {
        setNotification({ type: "error", message: "Error al cambiar el estado del servicio." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red al actualizar estado." });
    }
  };

  const handleDeleteBusiness = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar permanentemente el comercio "${name}" y todos sus datos asociados?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/businesses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotification({ type: "success", message: `Comercio "${name}" eliminado correctamente.` });
        fetchBusinesses();
      } else {
        setNotification({ type: "error", message: "No se pudo eliminar el comercio." });
      }
    } catch {
      setNotification({ type: "error", message: "Error al comunicar con la API." });
    }
  };

  const filtered = businesses.filter((b) => {
    const q = searchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.code && b.code.toLowerCase().includes(q)) ||
      (b.phone && b.phone.includes(q))
    );
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
            <Building2 className="text-orange-500" />
            Comercios Afiliados
          </h2>
          <p className="text-sm text-zinc-400">
            Administración centralizada de restaurantes y locales gastronómicos en PostgreSQL.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/15 flex items-center gap-2"
        >
          <Plus size={16} />
          Nuevo Comercio
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-2 rounded-2xl">
        <Search size={18} className="text-zinc-500 ml-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, código o teléfono..."
          className="bg-transparent text-sm text-white focus:outline-none w-full py-1.5 placeholder:text-zinc-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-xs text-zinc-500 hover:text-zinc-300 mr-2"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">
            Comercios Registrados ({filtered.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-500">Cargando comercios desde PostgreSQL...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-3">
            <span className="text-4xl">🏪</span>
            <p className="text-base text-zinc-400 font-medium">No se encontraron comercios registrados.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-xs bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition"
            >
              Crear el primer comercio
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950 text-zinc-300 font-semibold text-xs border-b border-zinc-800 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Código</th>
                  <th className="p-4">Nombre Comercial</th>
                  <th className="p-4">Titular</th>
                  <th className="p-4">Plan y Estado</th>
                  <th className="p-4 text-center">Mesas</th>
                  <th className="p-4 text-center">Productos</th>
                  <th className="p-4 text-center">Ventas</th>
                  <th className="p-4 text-center">Jukebox</th>
                  <th className="p-4 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.map((biz) => {
                  const owner = biz.users[0]?.name || biz.users[0]?.email || "Sin asignar";
                  const plan = biz.plan || "FREE";
                  const status = biz.planStatus || "ACTIVE";
                  const isSuspended = status === "SUSPENDED";

                  return (
                    <tr key={biz.id} className="hover:bg-zinc-900/50 transition-all">
                      <td className="p-4 pl-6 font-mono text-xs text-orange-400">
                        {biz.code || biz.id.slice(0, 8)}
                      </td>
                      <td className="p-4 text-zinc-100 font-semibold">{biz.name}</td>
                      <td className="p-4 text-xs text-zinc-400">{owner}</td>
                      <td className="p-4 text-xs">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase w-fit ${
                              plan === "PRO"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : plan === "STANDARD"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {plan}
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${
                              isSuspended ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            ● {isSuspended ? "Suspendido" : "Activo"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-xs font-semibold text-zinc-200">
                        {biz._count.tables}
                      </td>
                      <td className="p-4 text-center text-xs font-semibold text-zinc-200">
                        {biz._count.products}
                      </td>
                      <td className="p-4 text-center text-xs font-semibold text-zinc-200">
                        {biz._count.sales}
                      </td>
                      <td className="p-4 text-center text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            biz.enableJukebox
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          {biz.enableJukebox ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTogglePlanStatus(biz.id, biz.name, biz.planStatus)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                              isSuspended
                                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30"
                            }`}
                            title={isSuspended ? "Reactivar servicios" : "Suspender servicios"}
                          >
                            {isSuspended ? "Activar" : "Suspender"}
                          </button>
                          <Link
                            href={`/admin/negocios/${biz.id}`}
                            className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                          >
                            <Settings size={13} />
                            Configurar
                          </Link>
                          <button
                            onClick={() => handleDeleteBusiness(biz.id, biz.name)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 p-1.5 rounded-lg transition-all"
                            title="Eliminar comercio"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Crear Comercio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="text-orange-500" size={18} />
                Registrar Nuevo Comercio
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase text-zinc-400">
                  Nombre Comercial *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Hamburguesería Gourmet"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase text-zinc-400">Teléfono</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="555-1234"
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase text-zinc-400">Dirección</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Av. Principal #123"
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEnableJukebox}
                    onChange={(e) => setNewEnableJukebox(e.target.checked)}
                    className="rounded border-zinc-700 text-orange-500 focus:ring-0"
                  />
                  Habilitar Jukebox / Rockola para este comercio
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEnableQrOrders}
                    onChange={(e) => setNewEnableQrOrders(e.target.checked)}
                    className="rounded border-zinc-700 text-orange-500 focus:ring-0"
                  />
                  Habilitar pedidos por QR en mesas
                </label>
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
                  {submitting ? "Creando..." : "Crear Comercio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
