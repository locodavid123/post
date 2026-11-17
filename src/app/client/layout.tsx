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
  const [loggingOut, setLoggingOut] = useState(false);

  // Fetch the authenticated user's business name on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.business?.name) {
          setBusinessName(data.user.business.name);
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
          </nav>

          {/* Business Pill & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-300 shadow-sm">
              <Store size={14} className="text-orange-400" />
              <span className="max-w-[130px] truncate">{businessName}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
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

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</main>
    </div>
  );
}
