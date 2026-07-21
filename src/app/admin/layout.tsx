"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-900/70 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              EcoPost
            </span>
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-400">
              Admin
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <SidebarLink href="/admin/negocios">Negocios</SidebarLink>
            <SidebarLink href="/admin/usuarios">Usuarios</SidebarLink>
            <SidebarLink href="/admin/reportes">Reportes</SidebarLink>
            <SidebarLink href="/admin/facturacion">Facturación</SidebarLink>
            <SidebarLink href="/admin/configuracion">Administración</SidebarLink>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="text-zinc-300">SuperAdmin</span>
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
