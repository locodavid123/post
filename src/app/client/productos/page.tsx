import React from "react";

interface Product {
  id: number;
  name: string;
  category: "Hamburguesas" | "Bebidas" | "Entradas" | "Postres";
  price: number;
  stock: "disponible" | "agotado";
  description: string;
}

const initialProducts: Product[] = [
  { id: 1, name: "Hamburguesa EcoClassic", category: "Hamburguesas", price: 12.50, stock: "disponible", description: "Carne de res premium de 150g, queso cheddar derretido, lechuga orgánica, tomate fresco y salsa EcoPost especial." },
  { id: 2, name: "Papas Fritas Crujientes", category: "Entradas", price: 4.50, stock: "disponible", description: "Papas cortadas a mano, sazonadas con sal marina y pimentón ahumado." },
  { id: 3, name: "Cerveza Artesanal IPA", category: "Bebidas", price: 5.00, stock: "disponible", description: "Cerveza artesanal de la casa, notas intensas de lúpulo y cítricos." },
  { id: 4, name: "Refresco de Cola de la Casa", category: "Bebidas", price: 2.50, stock: "disponible", description: "Bebida refrescante carbonatada con toques naturales de cola." },
  { id: 5, name: "Volcán de Chocolate", category: "Postres", price: 6.00, stock: "agotado", description: "Bizcocho tibio de chocolate relleno de fudge derretido, servido con helado de vainilla." },
  { id: 6, name: "Aros de Cebolla Crujientes", category: "Entradas", price: 5.50, stock: "disponible", description: "Aros de cebolla rebozados en panko, servidos con alioli de ajo asado." },
];

export default function ProductosPage() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Menú y Catálogo de Productos</h2>
          <p className="text-sm text-zinc-400">Agrega, edita y gestiona el inventario de platos y bebidas del restaurante.</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/15">
          + Agregar Producto
        </button>
      </div>

      {/* Main layout: Sidebar categories + grid */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Categories Sidebar */}
        <aside className="w-full md:w-56 flex flex-col gap-2">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider px-3 mb-2">Categorías</span>
          {[
            { name: "Todos los Platos", count: 12, active: true },
            { name: "🍔 Hamburguesas", count: 4, active: false },
            { name: "🍟 Entradas", count: 3, active: false },
            { name: "🍺 Bebidas", count: 3, active: false },
            { name: "🍰 Postres", count: 2, active: false },
          ].map((cat, idx) => (
            <button
              key={idx}
              className={`flex justify-between items-center px-4 py-3 rounded-xl text-left text-xs font-semibold transition-all ${
                cat.active
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white"
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${cat.active ? "bg-white/20 text-white" : "bg-zinc-950 text-zinc-500"}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </aside>

        {/* Product Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all group"
            >
              <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs bg-zinc-950 text-orange-400 px-2.5 py-1 rounded-full border border-zinc-850 font-semibold">
                    {prod.category}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      prod.stock === "disponible"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {prod.stock}
                  </span>
                </div>

                {/* Info */}
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                    {prod.name}
                  </h4>
                  <p className="text-xs text-zinc-500 line-clamp-3 mt-1.5 leading-relaxed">
                    {prod.description}
                  </p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex justify-between items-center border-t border-zinc-850 pt-4 mt-4">
                <span className="text-lg font-bold text-white">${prod.price.toFixed(2)}</span>
                <div className="flex gap-2">
                  <button className="text-[10px] bg-zinc-950 hover:bg-zinc-850 text-zinc-300 font-semibold px-3 py-1.5 rounded-lg border border-zinc-800 transition-all">
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
