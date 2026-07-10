import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-screen bg-[#0f1720] flex items-center">
      <div className="mx-auto w-full max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="text-left">
            <span className="inline-block mb-6 text-sm font-semibold text-orange-400/90 tracking-wider">
              SOFTWARE PARA RESTAURANTES, BARES Y CAFÉS
            </span>

            <h1 className="text-6xl leading-tight font-extrabold text-orange-400">
              Encárgate de la comida.
            </h1>
            <h2 className="mt-2 text-4xl font-bold text-white/90">EcoPost resuelve los pedidos.</h2>

            <p className="mt-6 max-w-xl text-zinc-400">
              Administra tu negocio con el sistema POS más completo del mercado: mesas, pedidos,
              ventas y reportes en tiempo real, todo desde una sola consola.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg hover:bg-orange-600 transition"
              >
                REGÍSTRATE
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-3 font-medium text-zinc-300 hover:bg-zinc-900/40 transition"
              >
                INICIAR SESIÓN
              </Link>
            </div>
          </div>

          {/* Right: Mockup card */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-[520px] max-w-full">
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
                        className={`h-16 w-16 flex items-center justify-center rounded-full font-bold text-white ${
                          occupied ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="h-24 rounded-lg bg-zinc-800/60 p-3 text-sm text-zinc-300">
                      <p className="font-semibold text-white">Mesa 4</p>
                      <p className="mt-2">Filete al grill</p>
                      <p className="text-xs text-zinc-400">Copa de vino x2 · Guacamole</p>
                    </div>
                  </div>

                  <div className="w-36 flex flex-col items-stretch justify-between">
                    <button className="rounded-full bg-orange-500 px-4 py-3 font-semibold text-white">COBRAR $595</button>
                    <div className="mt-4 text-xs text-zinc-500">Sistema POS en tiempo real</div>
                  </div>
                </div>
              </div>

              {/* Subtle background shapes */}
              <div className="pointer-events-none absolute -left-10 -bottom-8 h-36 w-36 rounded-full bg-orange-500/6 blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
