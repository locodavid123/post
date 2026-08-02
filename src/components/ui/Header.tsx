import Link from "next/link";

interface HeaderProps {
  variant?: "default" | "jukebox";
}

export default function Header({ variant = "default" }: HeaderProps) {
  const isJukebox = variant === "jukebox";

  return (
    <header className="w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
              EcoPost
            </span>
          </Link>
        </div>

        {!isJukebox ? (
          <>
            {/* Nav links (páginas públicas) */}
            <nav className="hidden gap-6 text-sm text-zinc-300 md:flex md:flex-1 md:justify-center">
              <Link href="/funcionalidades" className="hover:text-white">Funcionalidades</Link>
              <Link href="/precios" className="hover:text-white">Precios</Link>
              <Link href="/nosotros" className="hover:text-white">Nosotros</Link>
              <Link href="#" className="hover:text-white">Casos de Éxito</Link>
              <Link href="/contacto" className="hover:text-white">Contacto</Link>
            </nav>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900/40 md:inline-flex"
              >
                INICIAR SESIÓN
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600"
              >
                REGÍSTRATE
              </Link>
            </div>
          </>
        ) : (
          /* Espacio en el header de Jukebox reservado para estética y futuras funcionalidades */
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Jukebox EcoPost
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
