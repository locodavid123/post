import Link from "next/link";
import { Check } from "lucide-react";

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            Planes Transparentes
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black text-white tracking-tight">
            Tarifas diseñadas para{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
              cada etapa
            </span>
          </h1>
          <p className="mt-4 text-zinc-300 text-sm sm:text-base">
            Elige el plan ideal para tu negocio gastronómico. Precios en pesos colombianos (COP).
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {/* Gratuito */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 flex flex-col justify-between hover:border-zinc-700 transition">
            <div>
              <h3 className="text-xl font-bold text-white">Gratuito</h3>
              <p className="mt-2 text-zinc-400 text-xs">Ideal para probar o comercios en apertura.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">COP $0</span>
                <span className="text-xs text-zinc-500">/ mes</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Hasta 5 mesas activas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Gestión de pedidos y comandas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Catálogo de productos</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-500">
                  <span className="w-3.5 text-center font-bold">·</span>
                  <span>Rockola Jukebox básica</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 block w-full text-center rounded-2xl border border-zinc-700/80 py-3 text-xs font-bold text-white hover:bg-zinc-800/80 active:scale-95 transition"
            >
              Comenzar Gratis
            </Link>
          </div>

          {/* Premium / Más Popular */}
          <div className="rounded-3xl border-2 border-orange-500 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 p-7 flex flex-col justify-between shadow-xl shadow-orange-500/10 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
              Más Popular
            </span>
            <div>
              <h3 className="text-xl font-bold text-white">Standard / Pro</h3>
              <p className="mt-2 text-zinc-400 text-xs">Para restaurantes y bares en crecimiento.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">COP $69.000</span>
                <span className="text-xs text-zinc-500">/ mes</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-zinc-200">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Mesas y usuarios ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Rockola Jukebox QR en vivo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Reportes financieros y de ventas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Pagos híbridos (Nequi, Bancolombia, Wompi)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Soporte prioritario por WhatsApp</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="mt-8 block w-full text-center rounded-2xl bg-orange-500 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 active:scale-95 transition"
            >
              Comenzar Prueba
            </Link>
          </div>

          {/* Enterprise */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 flex flex-col justify-between hover:border-zinc-700 transition">
            <div>
              <h3 className="text-xl font-bold text-white">Enterprise</h3>
              <p className="mt-2 text-zinc-400 text-xs">Cadenas, franquicias y múltiples sedes.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">COP $149.000</span>
                <span className="text-xs text-zinc-500">/ mes</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Multi-sede y sedes centralizadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Integración de hardware e impresoras</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>API para facturación electrónica</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Acompañamiento y onboarding dedicado</span>
                </li>
              </ul>
            </div>

            <Link
              href="/contacto"
              className="mt-8 block w-full text-center rounded-2xl border border-zinc-700/80 py-3 text-xs font-bold text-zinc-200 hover:bg-zinc-800 active:scale-95 transition"
            >
              Contactar Ventas
            </Link>
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-zinc-800/80 bg-zinc-900/50 p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white text-base">¿Tienes dudas sobre los planes o facturación?</h4>
            <p className="text-zinc-400 text-xs mt-1">
              Todos nuestros planes incluyen actualizaciones continuas y sin costos ocultos de instalación.
            </p>
          </div>
          <Link
            href="/contacto"
            className="rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-5 py-2.5 text-xs font-bold text-white shrink-0 transition"
          >
            Hablar con un asesor
          </Link>
        </div>
      </div>
    </div>
  );
}
