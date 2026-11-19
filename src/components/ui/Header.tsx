"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  variant?: "default" | "jukebox";
}

export default function Header({ variant = "default" }: HeaderProps) {
  const isJukebox = variant === "jukebox";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 w-full border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3.5">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
              EcoPost
            </span>
          </Link>
        </div>

        {!isJukebox ? (
          <>
            {/* Nav links de escritorio */}
            <nav className="hidden gap-7 text-sm font-medium text-zinc-300 md:flex md:flex-1 md:justify-center">
              <Link href="/funcionalidades" className="hover:text-orange-400 transition-colors">
                Funcionalidades
              </Link>
              <Link href="/precios" className="hover:text-orange-400 transition-colors">
                Precios
              </Link>
              <Link href="/nosotros" className="hover:text-orange-400 transition-colors">
                Nosotros
              </Link>
              <Link href="/nosotros#casos-exito" className="hover:text-orange-400 transition-colors">
                Casos de Éxito
              </Link>
              <Link href="/contacto" className="hover:text-orange-400 transition-colors">
                Contacto
              </Link>
            </nav>

            {/* CTAs de escritorio */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full border border-zinc-700/80 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900/60 hover:text-white transition"
              >
                INICIAR SESIÓN
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-95 transition"
              >
                REGÍSTRATE
              </Link>
            </div>

            {/* Botón hamburguesa móvil */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/register"
                className="rounded-full bg-orange-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-orange-600 transition"
              >
                REGÍSTRATE
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-zinc-400 hover:text-white focus:outline-none"
                aria-label="Abrir menú de navegación"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Jukebox EcoPost
            </span>
          </div>
        )}
      </div>

      {/* Menú desplegable en dispositivos móviles */}
      {!isJukebox && mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-6 py-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-zinc-300">
            <Link
              href="/funcionalidades"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-orange-400 py-1"
            >
              Funcionalidades
            </Link>
            <Link
              href="/precios"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-orange-400 py-1"
            >
              Precios
            </Link>
            <Link
              href="/nosotros"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-orange-400 py-1"
            >
              Nosotros
            </Link>
            <Link
              href="/nosotros#casos-exito"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-orange-400 py-1"
            >
              Casos de Éxito
            </Link>
            <Link
              href="/contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-orange-400 py-1"
            >
              Contacto
            </Link>
          </nav>

          <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-xl border border-zinc-700/80 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-900 transition"
            >
              INICIAR SESIÓN
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-600 transition"
            >
              REGÍSTRATE
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
