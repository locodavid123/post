"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  Phone,
  MapPin,
  Calendar,
  Users,
  Music,
  QrCode,
  DollarSign,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Crown,
  Zap,
  ShieldAlert,
} from "lucide-react";

interface BusinessDetail {
  id: string;
  name: string;
  code: string | null;
  phone: string | null;
  address: string | null;
  plan?: string;
  planStatus?: string;
  planExpiresAt?: string | null;
  billingCycle?: string;
  enableJukebox: boolean;
  enableQrOrders: boolean;
  createdAt: string;
  users: Array<{ id: string; name: string | null; email: string; role: string; createdAt: string }>;
  tables: Array<{ id: string; tableId: string; nickname: string; capacity: number; status: string; waiter: string | null }>;
  products: Array<{ id: string; name: string; category: string; price: number; stock: string }>;
  sales: Array<{ id: string; invoiceNumber: string; total: number; paymentMethod: string; status: string; createdAt: string }>;
  subscriptions?: Array<{
    id: string;
    invoiceNumber: string;
    plan: string;
    amount: number;
    billingCycle: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
  }>;
  totalSalesVolume: number;
  occupiedTablesCount: number;
  _count: {
    tables: number;
    products: number;
    sales: number;
    songRequests: number;
    users: number;
    subscriptions?: number;
  };
}

export default function DetalleNegocioPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params?.id as string;

  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regeneratingPromo, setRegeneratingPromo] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Editable Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [enableJukebox, setEnableJukebox] = useState(true);
  const [enableQrOrders, setEnableQrOrders] = useState(true);

  // Plan Management fields
  const [selectedPlan, setSelectedPlan] = useState("FREE");
  const [selectedPlanStatus, setSelectedPlanStatus] = useState("ACTIVE");
  const [savingPlan, setSavingPlan] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/businesses/${businessId}`);
      if (res.ok) {
        const data = await res.json();
        setBusiness(data);
        setName(data.name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setEnableJukebox(Boolean(data.enableJukebox));
        setEnableQrOrders(Boolean(data.enableQrOrders));
        setSelectedPlan(data.plan || "FREE");
        setSelectedPlanStatus(data.planStatus || "ACTIVE");
      } else {
        setNotification({ type: "error", message: "No se pudo encontrar el comercio." });
      }
    } catch {
      setNotification({ type: "error", message: "Error al cargar datos del comercio." });
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleUpdatePlan = async () => {
    setSavingPlan(true);
    setNotification(null);
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          planStatus: selectedPlanStatus,
        }),
      });
      if (res.ok) {
        setNotification({ type: "success", message: `Plan actualizado a ${selectedPlan} (${selectedPlanStatus}) con éxito.` });
        fetchDetail();
      } else {
        setNotification({ type: "error", message: "Error al actualizar plan." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red al actualizar plan." });
    } finally {
      setSavingPlan(false);
    }
  };

  const handleExtendPlan = async (days: number) => {
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extendDays: days }),
      });
      if (res.ok) {
        setNotification({ type: "success", message: `Vencimiento del plan extendido por ${days} días.` });
        fetchDetail();
      } else {
        setNotification({ type: "error", message: "Error al extender el plan." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red." });
    }
  };

  const handleToggleSuspend = async () => {
    const nextStatus = business?.planStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planStatus: nextStatus }),
      });
      if (res.ok) {
        setNotification({
          type: "success",
          message: nextStatus === "ACTIVE" ? "Servicios reactivados con éxito." : "Servicios suspendidos.",
        });
        fetchDetail();
      } else {
        setNotification({ type: "error", message: "Error al cambiar estado." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red." });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setSaving(true);
    setNotification(null);
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          address,
          enableJukebox,
          enableQrOrders,
        }),
      });

      if (res.ok) {
        setNotification({ type: "success", message: "Datos del comercio actualizados correctamente en PostgreSQL." });
        fetchDetail();
      } else {
        setNotification({ type: "error", message: "Error al actualizar los datos." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red al actualizar." });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateCode = async () => {
    if (!confirm("¿Deseas generar un nuevo código para este comercio?")) return;

    setRegeneratingPromo(true);
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/promo`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setNotification({ type: "success", message: `Nuevo código asignado: ${data.code}` });
        fetchDetail();
      } else {
        setNotification({ type: "error", message: "Error al regenerar código." });
      }
    } catch {
      setNotification({ type: "error", message: "Error al comunicar con la API." });
    } finally {
      setRegeneratingPromo(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar definitivamente el comercio "${business?.name}"? Esta acción borrará todas sus mesas, productos y ventas de PostgreSQL.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/businesses/${businessId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/negocios");
      } else {
        setNotification({ type: "error", message: "No se pudo eliminar el comercio." });
      }
    } catch {
      setNotification({ type: "error", message: "Error de red." });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-zinc-500">
        <RefreshCw size={24} className="animate-spin text-orange-500" />
        <p className="text-sm">Cargando datos del comercio...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <AlertCircle size={40} className="text-rose-500" />
        <h3 className="text-xl font-bold text-white">Comercio no encontrado</h3>
        <p className="text-sm text-zinc-400">El comercio solicitado no existe o fue eliminado de la base de datos.</p>
        <Link
          href="/admin/negocios"
          className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition"
        >
          ← Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/admin/negocios"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft size={14} />
          Volver a Negocios
        </Link>
      </div>

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

      {/* Header Info */}
      <div className="flex justify-between items-start flex-wrap gap-4 pb-4 border-b border-zinc-800">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">{business.name}</h2>
            <span className="text-xs font-mono px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg">
              Código: {business.code || "Sin código"}
            </span>
          </div>
          <p className="text-xs text-zinc-400 flex items-center gap-4 mt-1">
            <span>ID: <code className="text-zinc-500">{business.id}</code></span>
            <span>Registrado el: {new Date(business.createdAt).toLocaleDateString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRegenerateCode}
            disabled={regeneratingPromo}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
          >
            <RefreshCw size={13} className={regeneratingPromo ? "animate-spin" : ""} />
            Regenerar Código
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
          >
            <Trash2 size={13} />
            Eliminar Comercio
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[11px] text-zinc-500 uppercase font-semibold">Ventas Acumuladas</p>
          <p className="text-2xl font-black text-white mt-1">${business.totalSalesVolume.toFixed(2)}</p>
          <p className="text-[11px] text-zinc-400 mt-1">{business._count.sales} ventas registradas</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[11px] text-zinc-500 uppercase font-semibold">Mesas Configuradas</p>
          <p className="text-2xl font-black text-white mt-1">{business._count.tables}</p>
          <p className="text-[11px] text-emerald-400 mt-1">{business.occupiedTablesCount} ocupadas en vivo</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[11px] text-zinc-500 uppercase font-semibold">Productos en Carta</p>
          <p className="text-2xl font-black text-white mt-1">{business._count.products}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Disponibles en el POS</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-[11px] text-zinc-500 uppercase font-semibold">Canciones Jukebox</p>
          <p className="text-2xl font-black text-white mt-1">{business._count.songRequests}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Peticiones de clientes</p>
        </div>
      </div>

      {/* Main Grid: Form + Users + Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Plan Management & Edit Settings */}
        <div className="flex flex-col gap-6">
          {/* Subscription & Plan Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Crown className="text-orange-500" size={18} />
                Plan y Suscripción
              </h3>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  business.planStatus === "SUSPENDED"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
              >
                ● {business.planStatus === "SUSPENDED" ? "Suspendido" : "Activo"}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase text-zinc-400">Nivel de Plan</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="FREE">FREE (Prueba Gratuita 7 Días - 6 Mesas)</option>
                  <option value="STANDARD">STANDARD ($69.000 COP/mes - 15 Mesas)</option>
                  <option value="PRO">PRO ($119.000 COP/mes - Mesas ilimitadas + Jukebox)</option>
                  <option value="ENTERPRISE">ENTERPRISE ($249.000 COP/mes - Multi-sucursal)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase text-zinc-400">Estado del Servicio</label>
                <select
                  value={selectedPlanStatus}
                  onChange={(e) => setSelectedPlanStatus(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="ACTIVE">ACTIVE (Activo y Operativo)</option>
                  <option value="SUSPENDED">SUSPENDED (Suspendido por Admin)</option>
                  <option value="EXPIRED">EXPIRED (Vencido)</option>
                  <option value="CANCELLED">CANCELLED (Cancelado)</option>
                </select>
              </div>

              <div className="text-xs text-zinc-400 flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800/80 rounded-xl mt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-zinc-500" />
                  Vencimiento:
                </span>
                <span className="font-semibold text-zinc-200">
                  {business.planExpiresAt
                    ? new Date(business.planExpiresAt).toLocaleDateString()
                    : "Sin fecha / Indefinido"}
                </span>
              </div>

              {/* Quick Actions for SuperAdmin */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleExtendPlan(30)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition text-center"
                >
                  +30 Días
                </button>
                <button
                  type="button"
                  onClick={() => handleExtendPlan(365)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition text-center"
                >
                  +1 Año
                </button>
              </div>

              <button
                type="button"
                onClick={handleToggleSuspend}
                className={`w-full py-2 rounded-xl text-xs font-semibold border transition ${
                  business.planStatus === "SUSPENDED"
                    ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30"
                }`}
              >
                {business.planStatus === "SUSPENDED" ? "Reactivar Servicio Ahora" : "Suspender Servicio Temporalmente"}
              </button>

              <button
                type="button"
                onClick={handleUpdatePlan}
                disabled={savingPlan}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition shadow-md shadow-orange-500/15 disabled:opacity-50 mt-1"
              >
                {savingPlan ? "Guardando Plan..." : "Guardar Cambios de Plan"}
              </button>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="text-orange-500" size={18} />
              Configuración del Comercio
            </h3>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase text-zinc-400">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase text-zinc-400">Teléfono</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="555-0100"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase text-zinc-400">Dirección</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Gastronómica 123"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-3 pt-3 border-t border-zinc-800">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableJukebox}
                    onChange={(e) => setEnableJukebox(e.target.checked)}
                    className="rounded border-zinc-700 text-orange-500 focus:ring-0"
                  />
                  <span>Habilitar Rockola / Jukebox YouTube</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableQrOrders}
                    onChange={(e) => setEnableQrOrders(e.target.checked)}
                    className="rounded border-zinc-700 text-orange-500 focus:ring-0"
                  />
                  <span>Habilitar Pedidos QR desde la mesa</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-orange-500/15 disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Users & Sales */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Associated Users */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="text-orange-500" size={18} />
              Usuarios Asignados a este Comercio ({business.users.length})
            </h3>

            {business.users.length === 0 ? (
              <p className="text-xs text-zinc-500">No hay usuarios asignados directamente a este local.</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {business.users.map((u) => (
                  <div key={u.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-zinc-200">{u.name || "Sin nombre"}</p>
                      <p className="text-zinc-500">{u.email}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Sales for this business */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="text-orange-500" size={18} />
              Últimas Ventas ({business.sales.length})
            </h3>

            {business.sales.length === 0 ? (
              <p className="text-xs text-zinc-500">Este comercio aún no tiene ventas registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-400">
                  <thead className="bg-zinc-950 text-zinc-300 font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-2.5">Factura</th>
                      <th className="p-2.5">Fecha</th>
                      <th className="p-2.5">Pago</th>
                      <th className="p-2.5">Estado</th>
                      <th className="p-2.5 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {business.sales.map((s) => (
                      <tr key={s.id} className="hover:bg-zinc-950/40">
                        <td className="p-2.5 font-semibold text-white">{s.invoiceNumber}</td>
                        <td className="p-2.5 text-zinc-500">{new Date(s.createdAt).toLocaleString()}</td>
                        <td className="p-2.5">{s.paymentMethod}</td>
                        <td className="p-2.5">
                          <span className={`font-semibold ${s.status === "Completado" ? "text-emerald-400" : "text-rose-400"}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-bold text-white">${s.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Subscription Purchases History */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Crown className="text-orange-500" size={18} />
              Historial de Recibos de Planes ({business.subscriptions?.length || 0})
            </h3>

            {!business.subscriptions || business.subscriptions.length === 0 ? (
              <p className="text-xs text-zinc-500">Este comercio no tiene pagos de planes registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-400">
                  <thead className="bg-zinc-950 text-zinc-300 font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="p-2.5">Recibo</th>
                      <th className="p-2.5">Plan</th>
                      <th className="p-2.5">Fecha</th>
                      <th className="p-2.5">Método / Ref</th>
                      <th className="p-2.5">Estado</th>
                      <th className="p-2.5 text-right">Importe</th>
                      <th className="p-2.5 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {business.subscriptions.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-zinc-950/40">
                        <td className="p-2.5 font-semibold text-white font-mono">{sub.invoiceNumber}</td>
                        <td className="p-2.5 font-bold text-orange-400">{sub.plan}</td>
                        <td className="p-2.5 text-zinc-500">{new Date(sub.createdAt).toLocaleDateString("es-CO")}</td>
                        <td className="p-2.5">
                          <div>
                            <span>{sub.paymentMethod}</span>
                            {sub.referenceNumber && (
                              <p className="text-[10px] font-mono text-amber-300">Ref: {sub.referenceNumber}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5">
                          {sub.status === "PAID" ? (
                            <span className="text-emerald-400 font-semibold text-[11px]">● Aprobado</span>
                          ) : sub.status === "PENDING" ? (
                            <span className="text-amber-400 font-semibold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              ⏳ Pendiente
                            </span>
                          ) : (
                            <span className="text-rose-400 font-semibold text-[11px]">✕ Rechazado</span>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-bold text-white">
                          ${Number(sub.amount || 0).toLocaleString("es-CO")} COP
                        </td>
                        <td className="p-2.5 text-center">
                          {sub.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (!confirm(`¿Aprobar comprobante ${sub.invoiceNumber} y activar plan para este comercio?`)) return;
                                try {
                                  const res = await fetch(`/api/admin/subscriptions/${sub.id}/approve`, { method: "POST" });
                                  if (res.ok) {
                                    setNotification({ type: "success", message: `Comprobante ${sub.invoiceNumber} aprobado con éxito.` });
                                    fetchDetail();
                                  } else {
                                    setNotification({ type: "error", message: "Error al aprobar comprobante." });
                                  }
                                } catch {
                                  setNotification({ type: "error", message: "Error de red." });
                                }
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] transition"
                            >
                              Aprobar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
