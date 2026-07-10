export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="text-4xl font-bold text-orange-400">Precios</h1>
        <p className="mt-4 text-zinc-300">Tarifas pensadas para comercios de todos los tamaños. Precios en pesos colombianos (COP).</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <h3 className="text-xl font-semibold">Gratuito</h3>
            <p className="mt-2 text-zinc-400">Ideal para probar y comercios pequeños.</p>
            <div className="mt-4 text-3xl font-bold">COP $0</div>
            <ul className="mt-4 text-zinc-400 text-sm space-y-2">
              <li>Gestión básica de mesas</li>
              <li>Catálogo limitado</li>
              <li>Soporte comunitario</li>
            </ul>
            <button className="mt-6 rounded-full bg-orange-500 px-4 py-2 font-semibold">Comenzar</button>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <h3 className="text-xl font-semibold">Premium</h3>
            <p className="mt-2 text-zinc-400">Para comercios con crecimiento y necesidades de reporting.</p>
            <div className="mt-4 text-3xl font-bold">COP $29.990 / mes</div>
            <ul className="mt-4 text-zinc-400 text-sm space-y-2">
              <li>Reportes avanzados</li>
              <li>Integraciones con Stripe</li>
              <li>Soporte prioritario</li>
            </ul>
            <button className="mt-6 rounded-full bg-orange-500 px-4 py-2 font-semibold">Contratar</button>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <h3 className="text-xl font-semibold">Premium Pro</h3>
            <p className="mt-2 text-zinc-400">Soporte empresarial, API y despliegue personalizado.</p>
            <div className="mt-4 text-3xl font-bold">COP $49.990 / mes</div>
            <ul className="mt-4 text-zinc-400 text-sm space-y-2">
              <li>API & Webhooks</li>
              <li>Integración POS y hardware</li>
              <li>Servicio dedicado</li>
            </ul>
            <button className="mt-6 rounded-full bg-orange-500 px-4 py-2 font-semibold">Contactar ventas</button>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-bold">Preguntas sobre facturación</h2>
          <p className="mt-2 text-zinc-400 text-sm">Facturación mensual, métodos de pago y políticas de cancelación flexibles.</p>
        </div>
      </div>
    </div>
  );
}
