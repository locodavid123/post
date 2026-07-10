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
    <div className="flex min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-md flex flex-col justify-between p-6">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              EcoPost
            </span>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 font-semibold uppercase tracking-wider">
              Client
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            <SidebarLink href="/client">
              <span>📊</span> Dashboard
            </SidebarLink>
            <SidebarLink href="/client/mesas">
              <span>🪑</span> Mesas
            </SidebarLink>
            <SidebarLink href="/client/ventas">
              <span>💰</span> Ventas
            </SidebarLink>
            <SidebarLink href="/client/productos">
              <span>🍔</span> Productos
            </SidebarLink>
            <SidebarLink href="/client/jukebox">
              <span>🎵</span> Jukebox
            </SidebarLink>
            <SidebarLink href="/client/configuracion">
              <span>⚙️</span> Configuración
            </SidebarLink>
          </nav>
        </div>

        {/* Footer/Logout */}
        <div className="flex flex-col gap-4">
          <div className="border-t border-zinc-800 pt-4 px-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center font-bold text-orange-400">
              R
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Restaurante XYZ</p>
              <p className="text-[10px] text-zinc-500">Mesa de Control</p>
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
          <h1 className="text-lg font-semibold text-zinc-100">Panel de Control</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-full border border-zinc-700/50 font-medium">
              🟢 Servidor Online
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
