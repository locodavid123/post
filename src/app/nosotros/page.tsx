import Link from "next/link";
import {
  UtensilsCrossed,
  Music,
  Coffee,
  TrendingUp,
  CheckCircle2,
  Quote,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function NosotrosPage() {
  const casosExito = [
    {
      tipo: "Restaurante y Asador",
      nombre: "Fogón & Brasa Gastrobar",
      ciudad: "Bogotá, Colombia",
      icono: UtensilsCrossed,
      color: "from-amber-500/20 to-orange-500/10 border-orange-500/30 text-orange-400",
      reto: "Filas de espera y confusión con comandas manuscritas entre los meseros y la parrilla en horas pico de fin de semana.",
      solucion:
        "Implementaron el mapa de mesas interactivo de EcoPost y la recepción instantánea de pedidos en cocina sin papel.",
      metricas: [
        { valor: "+32%", etiqueta: "Rotación de mesas" },
        { valor: "-15 min", etiqueta: "Tiempo de despacho" },
        { valor: "0%", etiqueta: "Errores de facturación" },
      ],
      testimonio:
        "EcoPost nos permitió organizar 24 mesas con total control. Los cierres de turno ahora toman 5 minutos en vez de una hora.",
      autor: "Carlos Mario Restrepo — Propietario",
    },
    {
      tipo: "Bar & Cervecería Artesanal",
      nombre: "The Vintage Taproom & Rock Bar",
      ciudad: "Medellín, Colombia",
      icono: Music,
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
      reto: "Poca interacción del público en las mesas y saturación constante de la barra para pedir bebidas o elegir canciones.",
      solucion:
        "Activaron la Rockola Jukebox QR de EcoPost en cada mesa, permitiendo que los clientes busquen y pidan canciones de YouTube directamente.",
      metricas: [
        { valor: "+45%", etiqueta: "Permanencia en local" },
        { valor: "+24%", etiqueta: "Ventas de bebidas" },
        { valor: "4.9/5", etiqueta: "Satisfacción clientes" },
      ],
      testimonio:
        "La Rockola QR convirtió nuestras noches en una experiencia interactiva que la gente recomienda. La rotación de tragos se disparó.",
      autor: "Diana Morales — Administradora",
    },
    {
      tipo: "Café de Especialidad & Brunch",
      nombre: "Café Botánico Specialty",
      ciudad: "Cali, Colombia",
      icono: Coffee,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
      reto: "Demoras en horas de desayuno para registrar cobros mixtos y dificultades en el control de stock de repostería.",
      solucion:
        "Uso de cobro híbrido rápido con Nequi, Daviplata y datáfono, sumado al catálogo visual dinámico con alerta de inventario.",
      metricas: [
        { valor: "< 60 seg", etiqueta: "Tiempo por cobro" },
        { valor: "100%", etiqueta: "Control de inventario" },
        { valor: "+18%", etiqueta: "Ticket promedio" },
      ],
      testimonio:
        "Para una cafetería rápida, cada segundo cuenta. EcoPost es intuitivo para los baristas y nos da reportes claros de ventas diarias.",
      autor: "Felipe Gómez — Cofundador",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Cabecera / Intro */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            Nuestra Historia & Misión
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-black text-white tracking-tight">
            Tecnología intuitiva para transformar el{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">
              sector gastronómico
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-zinc-300 leading-relaxed">
            EcoPost nació para eliminar la fricción entre la sala, la cocina y la caja.
            Diseñamos un sistema POS ágil, moderno y accesible que integra mesas, pedidos,
            facturación en tiempo real y una innovadora rockola digital interactiva para bares y restaurantes.
          </p>
        </div>

        {/* Pilares */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400 mb-4">
                <Zap size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">Velocidad Operativa</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Sin configuraciones complejas ni terminales costosas. Funciona desde cualquier
                navegador, tablet o móvil en cuestión de minutos.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-4">
                <Music size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">Experiencia de Cliente Única</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Nuestra Rockola QR interactiva permite a los comensales pedir música sin levantarse de la mesa,
                generando un ambiente vibrante y fidelización.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-4">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-lg font-bold text-white">Control Total y Métricas</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Cierres de caja precisos, seguimiento de productos más vendidos, y compatibilidad
                con métodos de pago colombianos (Nequi, Bancolombia, Wompi).
              </p>
            </div>
          </div>
        </div>

        {/* Sección: Casos de Éxito */}
        <section id="casos-exito" className="mt-28 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                Casos de Éxito Reales
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
                Comercios que crecen con EcoPost
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-md">
              Descubre cómo restaurantes, bares y cafeterías optimizaron sus operaciones
              y aumentaron la satisfacción de sus clientes.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {casosExito.map((caso) => {
              const Icon = caso.icono;
              return (
                <div
                  key={caso.nombre}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-7 flex flex-col justify-between hover:border-orange-500/40 transition-all shadow-xl"
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${caso.color}`}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                          {caso.tipo}
                        </span>
                        <h3 className="text-base font-extrabold text-white leading-tight">
                          {caso.nombre}
                        </h3>
                        <span className="text-xs text-orange-400/90 font-medium">
                          {caso.ciudad}
                        </span>
                      </div>
                    </div>

                    {/* Desafío y Solución */}
                    <div className="space-y-3 mt-4 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/80 pt-4">
                      <p>
                        <strong className="text-zinc-100 font-semibold block text-[11px] uppercase tracking-wide text-rose-400/90 mb-1">
                          El Reto:
                        </strong>
                        {caso.reto}
                      </p>
                      <p>
                        <strong className="text-zinc-100 font-semibold block text-[11px] uppercase tracking-wide text-emerald-400/90 mb-1">
                          Solución EcoPost:
                        </strong>
                        {caso.solucion}
                      </p>
                    </div>

                    {/* Métricas clave */}
                    <div className="mt-5 grid grid-cols-3 gap-2 bg-zinc-950/70 rounded-2xl p-3 border border-white/[0.04]">
                      {caso.metricas.map((m, idx) => (
                        <div key={idx} className="text-center">
                          <span className="text-sm font-extrabold text-white block">
                            {m.valor}
                          </span>
                          <span className="text-[10px] text-zinc-400 leading-tight block mt-0.5">
                            {m.etiqueta}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Cita / Testimonio */}
                    <div className="mt-5 bg-orange-500/5 border border-orange-500/15 rounded-2xl p-4 relative">
                      <Quote size={16} className="text-orange-400/40 mb-1" />
                      <p className="text-xs italic text-zinc-200 leading-relaxed">
                        &ldquo;{caso.testimonio}&rdquo;
                      </p>
                      <p className="mt-2 text-[11px] font-semibold text-orange-400">
                        {caso.autor}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 size={14} /> Caso Verificado
                    </span>
                    <Link
                      href="/register"
                      className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 group"
                    >
                      Probar ahora
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Banner */}
        <div className="mt-24 rounded-3xl bg-gradient-to-r from-orange-600 to-amber-600 p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              ¿Listo para modernizar tu restaurante o bar?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-orange-100">
              Comienza hoy mismo con nuestra prueba gratuita. Sin contratos forzosos ni comisiones ocultas.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="rounded-full bg-white px-7 py-3 text-sm font-bold text-orange-600 shadow-lg hover:bg-orange-50 active:scale-95 transition"
              >
                REGÍSTRATE GRATIS
              </Link>
              <Link
                href="/contacto"
                className="rounded-full border-2 border-white/80 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 active:scale-95 transition"
              >
                HABLAR CON VENTAS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
