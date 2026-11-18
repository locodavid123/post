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
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function NavItem({ href, icon, children }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname ? pathname === href || pathname.startsWith(href + "/") : false;
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
  const [businessName, setBusinessName] = useState<string>("Cargando...");
  const [businessPlan, setBusinessPlan] = useState<string>("FREE");
  const [planStatus, setPlanStatus] = useState<string>("ACTIVE");
  const [loggingOut, setLoggingOut] = useState(false);

  // Fetch the authenticated user's business name and plan on mount
  useEffect(() => {
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
  }, []);

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
            <NavItem href="/client/mesas" icon={<LayoutGrid size={16} />}>
              Mesas
            </NavItem>
            <NavItem href="/client/ventas" icon={<Receipt size={16} />}>
              Ventas
            </NavItem>
            <NavItem href="/client/productos" icon={<UtensilsCrossed size={16} />}>
              Productos
            </NavItem>
            <NavItem href="/client/jukebox" icon={<Music size={16} />}>
              Jukebox
            </NavItem>
            <NavItem href="/client/configuracion" icon={<SlidersHorizontal size={16} />}>
              Configuración
            </NavItem>
            <NavItem href="/client/planes" icon={<Crown size={16} />}>
              Planes
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
                  planStatus === "SUSPENDED" ? "bg-rose-500" : "bg-emerald-500"
                } animate-pulse ml-0.5`}
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
      {planStatus === "SUSPENDED" && (
        <div className="bg-rose-950/90 border-b border-rose-800/80 text-rose-200 text-xs py-2.5 px-4 font-semibold flex items-center justify-center gap-2">
          <AlertTriangle size={15} className="text-rose-400 shrink-0" />
          <span>
            Tu cuenta y servicios se encuentran temporalmente <strong>suspendidos</strong> por el SuperAdmin. Por favor regulariza tu suscripción o contacta a soporte técnico.
          </span>
          <Link href="/client/planes" className="underline ml-2 text-white hover:text-rose-100">
            Reactivar Plan →
          </Link>
        </div>
      )}

      {/* Plan Expired Persistent Banner */}
      {planStatus === "EXPIRED" && (
        <div className="bg-amber-950/90 border-b border-amber-800/80 text-amber-200 text-xs py-2.5 px-4 font-semibold flex items-center justify-center gap-2">
          <AlertTriangle size={15} className="text-amber-400 shrink-0" />
          <span>
            Tu período de prueba de 7 días o suscripción ha <strong>finalizado</strong>. Adquiere un plan para seguir gestionando mesas, comandas y ventas.
          </span>
          <Link href="/client/planes" className="underline ml-2 text-white hover:text-amber-100">
            Ver Planes COP →
          </Link>
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</main>
    </div>
  );
}
