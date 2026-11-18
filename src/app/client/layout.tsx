"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Receipt,
  UtensilsCrossed,
  Music,
  SlidersHorizontal,
  Store,
  LogOut,
  Crown,
  AlertTriangle,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { JukeboxProvider } from "@/context/JukeboxContext";
import PersistentJukeboxPlayer from "@/components/client/jukebox/PersistentJukeboxPlayer";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}

function NavItem({ href, icon, children, disabled = false }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname ? pathname === href || pathname.startsWith(href + "/") : false;

  if (disabled) {
    return (
      <span
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm text-zinc-600 cursor-not-allowed select-none bg-zinc-900/30 opacity-40 border border-white/[0.02]"
        title="Módulo inhabilitado temporalmente por suspensión de servicio"
      >
        <span className="shrink-0 text-zinc-600">{icon}</span>
        <span>{children}</span>
        <Lock size={12} className="text-rose-500/80 ml-0.5" />
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
        isActive
          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]"
          : "text-zinc-400 hover:text-white hover:bg-zinc-850/70"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [businessName, setBusinessName] = useState<string>("Cargando...");
  const [businessPlan, setBusinessPlan] = useState<string>("FREE");
  const [planStatus, setPlanStatus] = useState<string>("ACTIVE");
  const [loggingOut, setLoggingOut] = useState(false);

  const isSuspended = planStatus === "SUSPENDED";
  const isExpired = planStatus === "EXPIRED";
  const isLocked = isSuspended || isExpired;
  const isPlanesPage = pathname === "/client/planes";

  // Función para sincronizar estado de autenticación y plan con la base de datos
  const checkStatus = () => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.business) {
          setBusinessName(data.user.business.name || "Mi Negocio");
          setBusinessPlan(data.user.business.plan || "FREE");
          setPlanStatus(data.user.business.planStatus || "ACTIVE");
        } else if (data?.user?.name) {
          setBusinessName(data.user.name);
        } else {
          setBusinessName("Mi Negocio");
        }
      })
      .catch(() => setBusinessName("Mi Negocio"));
  };

  // Sincronización en montaje, cambios de ruta, foco y sondeo regular
  useEffect(() => {
    checkStatus();

    // Sincronizar cada 6 segundos para detectar suspensiones o reactivaciones en vivo
    const interval = setInterval(checkStatus, 6000);

    const onFocus = () => checkStatus();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);

  // Logout handler
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Error calling logout API:", err);
    }
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("ecopost_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    router.push("/login");
  };

  return (
    <JukeboxProvider>
      <div className="min-h-screen bg-[#090a0f] text-zinc-100 font-sans selection:bg-orange-500/30 selection:text-orange-200">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0c0e15]/85 backdrop-blur-xl px-4 sm:px-6 py-3 transition-all">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            {/* Logo & Badge */}
            <div className="flex items-center gap-3">
              <Link href="/client/mesas" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                  E
                </div>
                <span className="text-xl font-extrabold bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  EcoPost
                </span>
              </Link>
              <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                POS Terminal
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-zinc-950/60 border border-white/[0.05]">
              <NavItem href="/client/mesas" icon={<LayoutGrid size={16} />} disabled={isLocked}>
                Mesas
              </NavItem>
              <NavItem href="/client/ventas" icon={<Receipt size={16} />} disabled={isLocked}>
                Ventas
              </NavItem>
              <NavItem href="/client/productos" icon={<UtensilsCrossed size={16} />} disabled={isLocked}>
                Productos
              </NavItem>
              <NavItem href="/client/jukebox" icon={<Music size={16} />} disabled={isLocked}>
                Jukebox
              </NavItem>
              <NavItem href="/client/configuracion" icon={<SlidersHorizontal size={16} />} disabled={isLocked}>
                Configuración
              </NavItem>
              <NavItem href="/client/planes" icon={<Crown size={16} />}>
                <span className="flex items-center gap-1.5">
                  <span>Planes</span>
                  {isLocked && (
                    <span className="text-[9px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-full uppercase animate-pulse">
                      Reactivar
                    </span>
                  )}
                </span>
              </NavItem>
            </nav>

            {/* Business Pill & Logout */}
            <div className="flex items-center gap-3">
              <Link
                href="/client/planes"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                  businessPlan === "PRO"
                    ? "bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-400 border-orange-500/30 hover:border-orange-500/50"
                    : businessPlan === "STANDARD"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:border-blue-500/50"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                }`}
                title="Ver estado de suscripción y planes"
              >
                <Crown size={12} className={businessPlan === "PRO" ? "text-orange-400" : ""} />
                <span>
                  {businessPlan === "PRO"
                    ? "Pro"
                    : businessPlan === "STANDARD"
                    ? "Standard"
                    : "Free"}
                </span>
              </Link>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-300 shadow-sm">
                <Store size={14} className="text-orange-400" />
                <span className="max-w-[130px] truncate">{businessName}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLocked ? "bg-rose-500" : "bg-emerald-500"
                  } animate-pulse ml-0.5`}
                  title={isSuspended ? "Suspendido" : isExpired ? "Expirado" : "Activo"}
                />
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-400 transition hover:border-rose-500/50 disabled:opacity-50"
              >
                <LogOut size={14} />
                <span>{loggingOut ? "Saliendo..." : "Salir"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Plan Suspended Persistent Banner */}
        {isSuspended && (
          <div className="bg-rose-950/95 border-b border-rose-800 text-rose-200 text-xs py-2.5 px-4 font-semibold flex items-center justify-center gap-2 shadow-inner">
            <AlertTriangle size={16} className="text-rose-400 shrink-0 animate-bounce" />
            <span>
              Tu cuenta y servicios se encuentran <strong>suspendidos por el SuperAdmin</strong>. Los módulos operativos están bloqueados.
            </span>
            <Link href="/client/planes" className="underline ml-2 text-white font-bold hover:text-rose-100 flex items-center gap-1">
              <span>Reactivar Plan</span>
              <Crown size={13} />
            </Link>
          </div>
        )}

        {/* Plan Expired Persistent Banner */}
        {isExpired && (
          <div className="bg-amber-950/95 border-b border-amber-800 text-amber-200 text-xs py-2.5 px-4 font-semibold flex items-center justify-center gap-2 shadow-inner">
            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
            <span>
              Tu período de prueba de 7 días o suscripción ha <strong>finalizado</strong>. Adquiere un plan para desbloquear el POS.
            </span>
            <Link href="/client/planes" className="underline ml-2 text-white font-bold hover:text-amber-100">
              Ver Planes COP →
            </Link>
          </div>
        )}

        {/* Main Container */}
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 animate-fade-in">
          {isLocked && !isPlanesPage ? (
            <div className="min-h-[70vh] flex items-center justify-center py-8 px-4 animate-fade-in">
              <div className="max-w-lg w-full bg-[#10131c] border border-rose-500/30 rounded-3xl p-8 sm:p-10 text-center shadow-2xl shadow-rose-950/70 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-20 -left-20 w-44 h-44 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Icon Badge */}
                <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-6 shadow-xl shadow-rose-500/10 animate-pulse">
                  <ShieldAlert size={40} />
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/25 px-3.5 py-1 rounded-full mb-3">
                  ● {isSuspended ? "Cuenta Suspendida" : "Suscripción Expirada"}
                </span>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                  {isSuspended ? "Acceso Suspendido por Administración" : "Período de Servicio Finalizado"}
                </h2>

                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  {isSuspended
                    ? `El SuperAdmin ha suspendido temporalmente el servicio para el comercio "${businessName}". Durante la suspensión, todos los módulos de atención al cliente y facturación se encuentran bloqueados.`
                    : `El período de prueba de 7 días o suscripción de "${businessName}" ha concluido. Por favor selecciona un plan en Pesos Colombianos para reactivar tus operaciones de inmediato.`}
                </p>

                {/* Status details card */}
                <div className="w-full bg-zinc-950/80 border border-white/[0.06] rounded-2xl p-4 text-xs text-zinc-300 mb-6 text-left flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Estado del restaurante:</span>
                    <span className="font-extrabold text-rose-400 uppercase">
                      ● {isSuspended ? "Suspendido" : "Expirado"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Módulos inhabilitados:</span>
                    <span className="font-semibold text-zinc-200">Mesas, Ventas, Menú, Rockola</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Acción requerida:</span>
                    <span className="font-bold text-amber-400">Reactivar o renovar suscripción</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/client/planes"
                    className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    <Crown size={16} />
                    <span>Ir a Planes y Facturación</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="py-3 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-semibold text-xs border border-white/[0.08] transition"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>

        {/* Reproductor Persistente de Rockola (Audio continuo en segundo plano) */}
        <PersistentJukeboxPlayer isLocked={isLocked} />
      </div>
    </JukeboxProvider>
  );
}
