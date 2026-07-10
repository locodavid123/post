export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h1 className="text-4xl font-bold text-orange-400">Nosotros</h1>
        <p className="mt-4 text-zinc-300">EcoPost nace para simplificar la operación de restaurantes y comercios gastronómicos.</p>

        <div className="mt-8 space-y-6">
          <p className="text-zinc-400">Somos un equipo de producto, ingeniería y diseño con experiencia en soluciones POS y experiencia de usuario en hostelería. Nuestro objetivo es ofrecer herramientas que permitan a los comercios operar con eficiencia y sostenibilidad.</p>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="font-semibold text-white">Misión</h3>
            <p className="text-zinc-400 mt-2">Ayudar a comercios a digitalizar su operación y aumentar su rentabilidad.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

