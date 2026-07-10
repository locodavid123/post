import React from "react";

export default function ConfiguracionPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Configuración del Local</h2>
        <p className="text-sm text-zinc-400">Administra los parámetros de tu restaurante, información de contacto y preferencias de la app.</p>
      </div>

      {/* Settings Sections */}
      <div className="flex flex-col gap-6">
        
        {/* Restaurant Profile */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white pb-2 border-b border-zinc-800">Información del Restaurante</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nombre del Negocio</label>
              <input
                type="text"
                defaultValue="Restaurante XYZ"
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Teléfono de Contacto</label>
              <input
                type="text"
                defaultValue="+54 11 2345-6789"
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Dirección Física</label>
              <input
                type="text"
                defaultValue="Av. Corrientes 1234, Ciudad Autónoma de Buenos Aires"
                className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm px-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Feature toggles */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white pb-2 border-b border-zinc-800">Preferencias de EcoPost</h3>
          <div className="flex flex-col gap-4">
            
            {/* Toggle 1: Jukebox */}
            <div className="flex justify-between items-center p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
              <div>
                <h4 className="text-sm font-semibold text-white">Activar Jukebox</h4>
                <p className="text-xs text-zinc-500 mt-1">Permite a los comensales pedir música escaneando el código QR de su mesa.</p>
              </div>
              <div className="relative w-11 h-6 bg-orange-500 rounded-full flex items-center px-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full translate-x-5 transition-transform"></div>
              </div>
            </div>

            {/* Toggle 2: Pedidos QR */}
            <div className="flex justify-between items-center p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
              <div>
                <h4 className="text-sm font-semibold text-white">Autopedido por QR</h4>
                <p className="text-xs text-zinc-500 mt-1">Los clientes pueden hacer pedidos directamente a cocina desde su teléfono sin mesero.</p>
              </div>
              <div className="relative w-11 h-6 bg-orange-500 rounded-full flex items-center px-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full translate-x-5 transition-transform"></div>
              </div>
            </div>

            {/* Toggle 3: Notificaciones de pedidos */}
            <div className="flex justify-between items-center p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
              <div>
                <h4 className="text-sm font-semibold text-white">Alertas Sonoras de Pedido</h4>
                <p className="text-xs text-zinc-500 mt-1">Reproducir un sonido cada vez que ingrese un nuevo pedido en cola.</p>
              </div>
              <div className="relative w-11 h-6 bg-zinc-800 rounded-full flex items-center px-1 cursor-pointer">
                <div className="w-4 h-4 bg-zinc-500 rounded-full transition-transform"></div>
              </div>
            </div>

          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm px-6 py-2.5 rounded-xl transition-all">
            Descartar Cambios
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/15">
            Guardar Configuración
          </button>
        </div>

      </div>
    </div>
  );
}
