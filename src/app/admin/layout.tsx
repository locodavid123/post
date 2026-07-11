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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-md flex flex-col justify-between p-6">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-2xl font-bold bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              EcoPost
            </span>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30 font-semibold uppercase tracking-wider">
              Admin
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            <SidebarLink href="/admin">
              <span>📊</span> Dashboard
            </SidebarLink>
            <SidebarLink href="/admin/negocios">
              <span>🏢</span> Negocios
            </SidebarLink>
            <SidebarLink href="/admin/usuarios">
              <span>👥</span> Usuarios
            </SidebarLink>
            <SidebarLink href="/admin/reportes">
              <span>📈</span> Reportes
            </SidebarLink>
            <SidebarLink href="/admin/facturacion">
              <span>🧾</span> Facturación
            </SidebarLink>
            <SidebarLink href="/admin/configuracion">
              <span>🛡️</span> Administración
            </SidebarLink>
          </nav>
        </div>

        {/* Footer/Logout */}
        <div className="flex flex-col gap-4">
          <div className="border-t border-zinc-800 pt-4 px-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center font-bold text-red-400">
              S
            </div>
            <div>
              <p className="text-xs font-semibold text-white">SuperAdmin</p>
              <p className="text-[10px] text-zinc-500">Soporte Técnico</p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-medium"
          >
            <span>🚪</span> Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-900/30 px-8 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-100">Consola de Administración</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-full border border-red-500/20 font-medium">
              ⚙️ Entorno Global
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
