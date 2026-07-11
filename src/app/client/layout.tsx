import React from "react";
import Link from "next/link";

interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
}

function SidebarLink({ href, children }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-orange-500/10 hover:border-l-4 hover:border-orange-500 transition-all font-medium text-sm"
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
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-900/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
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
              <span className="text-zinc-300">Restaurante XYZ</span>
            </div>
            <Link
              href="/login"
              className="rounded-full border border-red-500/30 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
            >
              Cerrar sesión
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl p-8">{children}</main>
    </div>
  );
}
