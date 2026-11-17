"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Users,
  BarChart3,
  CreditCard,
  Sliders,
  ShieldCheck,
  LogOut,
} from "lucide-react";

interface AdminNavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function AdminNavItem({ href, icon, children }: AdminNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname ? pathname === href || pathname.startsWith(href + "/") : false;
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
        isActive
          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-[1.02]"
          : "text-zinc-400 hover:text-white hover:bg-zinc-850/70"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

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
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0c0e15]/85 backdrop-blur-xl px-4 sm:px-6 py-3 transition-all">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          {/* Logo & Badge */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                A
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-rose-400 via-orange-400 to-rose-500 bg-clip-text text-transparent">
                EcoPost
              </span>
            </Link>
            <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
              SuperAdmin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-zinc-950/60 border border-white/[0.05]">
            <AdminNavItem href="/admin/negocios" icon={<Building2 size={16} />}>
              Negocios
            </AdminNavItem>
            <AdminNavItem href="/admin/usuarios" icon={<Users size={16} />}>
              Usuarios
            </AdminNavItem>
            <AdminNavItem href="/admin/reportes" icon={<BarChart3 size={16} />}>
              Reportes
            </AdminNavItem>
            <AdminNavItem href="/admin/facturacion" icon={<CreditCard size={16} />}>
              Facturación
            </AdminNavItem>
            <AdminNavItem href="/admin/configuracion" icon={<Sliders size={16} />}>
              Configuración
            </AdminNavItem>
          </nav>

          {/* Admin Badge & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-300 shadow-sm">
              <ShieldCheck size={14} className="text-rose-400" />
              <span>SuperAdmin</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
            </div>

            <button
              type="button"
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
