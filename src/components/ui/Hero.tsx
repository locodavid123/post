import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="min-h-[calc(100vh-65px)] bg-[#0f1720] flex items-center py-12 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="text-left">
            <span className="inline-block mb-4 text-xs sm:text-sm font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 px-3.5 py-1.5 rounded-full border border-orange-500/20">
              SOFTWARE PARA RESTAURANTES, BARES Y CAFÉS
            </span>

            <h1 className="text-4xl sm:text-6xl leading-tight font-black text-orange-400 tracking-tight">
              Encárgate de la comida.
            </h1>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold text-white">
              EcoPost resuelve los pedidos y la música.
            </h2>

            <p className="mt-6 max-w-xl text-zinc-300 text-sm sm:text-base leading-relaxed">
              Administra tu negocio con el sistema POS más completo y moderno: mesas interactivas,
              pedidos en cocina, facturación en tiempo real y Rockola Jukebox QR para tus clientes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 active:scale-95 transition"
              >
                REGÍSTRATE
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-6 py-3.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-900/60 hover:text-white active:scale-95 transition"
              >
                INICIAR SESIÓN
              </Link>
            </div>

            {/* Quick links & badges */}
            <div className="mt-8 pt-6 border-t border-zinc-800/60 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-400">
              <Link
                href="/funcionalidades"
                className="hover:text-orange-400 transition-colors font-medium flex items-center gap-1"
              >
                Conoce las funcionalidades →
              </Link>
              <Link
                href="/precios"
                className="hover:text-orange-400 transition-colors font-medium flex items-center gap-1"
              >
                Ver planes y precios →
              </Link>
              <Link
                href="/contacto"
                className="hover:text-orange-400 transition-colors font-medium flex items-center gap-1"
              >
                Solicitar demo →
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1 text-zinc-300">
                <CheckCircle2 size={13} className="text-emerald-400" /> Plan gratuito disponible
              </span>
              <span className="flex items-center gap-1 text-zinc-300">
                <CheckCircle2 size={13} className="text-emerald-400" /> Configuración en 2 minutos
              </span>
              <span className="flex items-center gap-1 text-zinc-300">
                <CheckCircle2 size={13} className="text-emerald-400" /> Sin contratos forzosos
              </span>
            </div>
          </div>

          {/* Right: Mockup card */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-130 max-w-full">
              <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-3 w-28 rounded-full bg-zinc-800/60" />
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-rose-500" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const num = i + 1;
                    const occupied = [4, 5, 11].includes(num);
                    return (
                      <div
                        key={num}
                        className={`h-16 w-16 flex items-center justify-center rounded-2xl font-bold text-white shadow-inner transition-transform hover:scale-105 ${
                          occupied ? "bg-rose-500/90 shadow-rose-950" : "bg-emerald-500/90 shadow-emerald-950"
                        }`}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="h-24 rounded-2xl bg-zinc-800/60 border border-white/[0.04] p-3 text-sm text-zinc-300 flex flex-col justify-between">
                      <div>
                        <p className="font-bold text-white text-xs">Mesa 4 · Comanda Activa</p>
                        <p className="mt-1 text-xs text-zinc-200">Filete al grill + Guacamole</p>
                      </div>
                      <p className="text-[11px] text-orange-400 font-medium">Copa de vino x2 · En preparación</p>
                    </div>
                  </div>

                  <div className="w-40 flex flex-col items-stretch justify-between">
                    <div className="rounded-2xl bg-orange-500 p-3 text-center text-white font-bold text-xs shadow-lg shadow-orange-500/20">
                      COBRAR COP $59.500
                    </div>
                    <div className="mt-3 text-[11px] text-zinc-500 text-center">POS en tiempo real</div>
                  </div>
                </div>
              </div>

              {/* Subtle background shapes */}
              <div className="pointer-events-none absolute -left-10 -bottom-8 h-36 w-36 rounded-full bg-orange-500/10 blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
