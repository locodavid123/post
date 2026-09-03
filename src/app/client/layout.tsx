"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
}

function SidebarLink({ href, children }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname ? (pathname === href || pathname.startsWith(href + "/")) : false;
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all border-l-4 ${
        isActive
          ? "text-white bg-orange-500/10 border-orange-500"
          : "text-zinc-300 hover:text-white hover:bg-orange-500/10 border-transparent hover:border-orange-500"
      }`}
    >
      {children}
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

  // Logout handler: call API, clear localStorage, redirect
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Error calling logout API:", err);
    }
    // Clear all ecopost_ keys from localStorage
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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-900/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              EcoPost
            </span>
            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-orange-400">
              Client
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <SidebarLink href="/client/mesas">Mesas</SidebarLink>
            <SidebarLink href="/client/ventas">Ventas</SidebarLink>
            <SidebarLink href="/client/productos">Productos</SidebarLink>
            <SidebarLink href="/client/jukebox">Jukebox</SidebarLink>
            <SidebarLink href="/client/configuracion">Configuración</SidebarLink>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-zinc-300">{businessName}</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-full border border-red-500/30 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              {loggingOut ? "Cerrando..." : "Cerrar sesión"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl p-8">{children}</main>
    </div>
  );
}
