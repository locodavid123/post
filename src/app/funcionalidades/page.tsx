import Link from "next/link";
import {
  LayoutGrid,
  ChefHat,
  Utensils,
  Receipt,
  Music,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function FuncionalidadesPage() {
  const features = [
    {
      title: "Gestión de Mesas",
      desc: "Mapa visual de sala, estado en tiempo real, transferencias entre mesas y cierre rápido de cuentas.",
      icon: LayoutGrid,
    },
    {
      title: "Pedidos & Cocina",
      desc: "Recepción de órdenes por mesa, comanda digital de cocina, tiempos estimados y notificaciones.",
      icon: ChefHat,
    },
    {
      title: "Menú y Productos",
      desc: "Catálogo con categorías, variantes, precios especiales, fotos y gestión de inventario.",
      icon: Utensils,
    },
    {
      title: "Ventas & Facturación",
      desc: "Historial completo, cierres de caja (Z), exportación e integración con pagos en Colombia (Wompi, Nequi).",
      icon: Receipt,
    },
    {
      title: "Rockola Jukebox QR",
      desc: "Música interactiva en cada mesa: tus clientes buscan en YouTube, votan canciones y disfrutan el ambiente.",
      icon: Music,
    },
    {
      title: "Reportes & Analytics",
      desc: "Métricas de ventas por hora, ticket promedio, platos más pedidos y control de rentabilidad.",
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            Funcionalidades Principales
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black text-white tracking-tight">
            Todo lo necesario para{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
              operar tu comercio
            </span>
          </h1>
          <p className="mt-4 text-zinc-300 text-sm sm:text-base leading-relaxed">
            Una solución integral pensada para optimizar la atención en sala, acelerar la preparación
            en cocina y maximizar la facturación.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 hover:border-orange-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-white text-lg">{f.title}</h3>
                  <p className="text-zinc-400 mt-2 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <section className="mt-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Preguntas frecuentes</h2>
          <div className="mt-6 space-y-4 max-w-3xl">
            <details className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 cursor-pointer">
              <summary className="font-bold text-white text-sm">¿Puedo usar EcoPost sin comprar un TPV costoso?</summary>
              <p className="mt-3 text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Sí. EcoPost es 100% web y responsivo. Puedes usarlo en cualquier computadora portátil, tablet Android/iPad o teléfono móvil sin necesidad de hardware especializado.
              </p>
            </details>

            <details className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 cursor-pointer">
              <summary className="font-bold text-white text-sm">¿Cómo funciona la Rockola Jukebox en las mesas?</summary>
              <p className="mt-3 text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Cada mesa tiene un código QR único. Los clientes lo escanean con su celular, buscan canciones de YouTube y las agregan a la cola de reproducción del local en tiempo real.
              </p>
            </details>

            <details className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 cursor-pointer">
              <summary className="font-bold text-white text-sm">¿Qué medios de pago puedo registrar?</summary>
              <p className="mt-3 text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Soporta cobros en efectivo, transferencias directas a Nequi, Daviplata o cualquier banco en Colombia, así como pasarela Wompi para tarjetas de crédito y débito.
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 rounded-3xl border border-zinc-800 bg-gradient-to-r from-orange-500/15 via-zinc-900 to-zinc-900 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Comienza a usar EcoPost hoy mismo</h3>
            <p className="text-xs text-zinc-400 mt-1">Configuración rápida en minutos sin compromiso de permanencia.</p>
          </div>
          <Link
            href="/register"
            className="rounded-full bg-orange-500 hover:bg-orange-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/20 active:scale-95 transition flex items-center gap-2 shrink-0"
          >
            REGÍSTRATE GRATIS
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
