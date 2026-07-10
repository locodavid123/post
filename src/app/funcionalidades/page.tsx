export default function FuncionalidadesPage() {
  const features = [
    {
      title: "Gestión de Mesas",
      desc: "Mapa de sala, estado en tiempo real, transferencias entre mesas y cierre rápido de cuentas.",
    },
    {
      title: "Pedidos & Cocina",
      desc: "Recepción de órdenes, impresiones a cocina, tiempos estimados y notificaciones de entrega.",
    },
    {
      title: "Menú y Productos",
      desc: "Catálogo por categorías, variantes, gestión de inventario y precios por horario.",
    },
    {
      title: "Ventas & Facturación",
      desc: "Historial completo, exportes CSV, integración con Stripe y conciliación de cobros.",
    },
    {
      title: "Jukebox",
      desc: "Sistema de música por QR: pedidos, votaciones y cola administrable por el local.",
    },
    {
      title: "Reportes & Analytics",
      desc: "KPIs, MRR, ventas por hora, y descargas para contabilidad y decisiones operativas.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="text-4xl font-bold text-orange-400">Funcionalidades</h1>
        <p className="mt-4 text-zinc-300 max-w-2xl">Todo lo que necesitas para operar un comercio gastronómico moderno: desde sala hasta backoffice.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="text-zinc-400 mt-2 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white">Preguntas frecuentes</h2>
          <div className="mt-4 space-y-4">
            <details className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <summary className="font-semibold text-white">¿Puedo usar EcoPost sin TPV físico?</summary>
              <p className="mt-2 text-zinc-400 text-sm">Sí — EcoPost funciona desde navegadores y tablets. La integración con impresoras y hardware es opcional.</p>
            </details>

            <details className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <summary className="font-semibold text-white">¿Tiene integración con pasarelas de pago?</summary>
              <p className="mt-2 text-zinc-400 text-sm">Sí, soportamos Stripe y enlaces de pago. También exportes para conciliación manual.</p>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
}
