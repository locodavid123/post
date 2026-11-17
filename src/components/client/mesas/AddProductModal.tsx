import React from "react";
import { Product } from "./types";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber?: number;
  availableProducts: Product[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  productSearch: string;
  setProductSearch: (search: string) => void;
  productQuantities: Record<string | number, number>;
  handleQuantityChange: (productId: number | string, delta: number) => void;
  handleSaveProductsToTable: () => void;
  selectedProductsTotalItems: number;
  selectedProductsTotalPrice: number;
}

export default function AddProductModal({
  isOpen,
  onClose,
  tableNumber,
  availableProducts,
  categories,
  selectedCategory,
  setSelectedCategory,
  productSearch,
  setProductSearch,
  productQuantities,
  handleQuantityChange,
  handleSaveProductsToTable,
  selectedProductsTotalItems,
  selectedProductsTotalPrice,
}: AddProductModalProps) {
  if (!isOpen) return null;

  const filteredProducts = availableProducts.filter((p) => {
    const matchesCategory =
      selectedCategory === "Todas" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Agregar Productos a Mesa #{tableNumber}</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Ajusta las cantidades de los productos deseados y confirma el pedido.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="py-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-orange-500 transition"
            />
            {productSearch && (
              <button
                onClick={() => setProductSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Categorías */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listado de Productos con Ajuste de Cantidad */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-2">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p className="text-sm font-medium">No se encontraron productos coincidentes.</p>
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const qty = productQuantities[prod.id] || 0;
              const isAgotado = prod.stock === "agotado";

              return (
                <div
                  key={prod.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    qty > 0
                      ? "bg-orange-500/10 border-orange-500/40"
                      : "bg-zinc-950/70 border-zinc-850 hover:border-zinc-700"
                  } ${isAgotado ? "opacity-50" : ""}`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{prod.name}</h4>
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md font-medium">
                        {prod.category}
                      </span>
                      {isAgotado && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md font-semibold">
                          Agotado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{prod.description}</p>
                    <p className="text-xs font-extrabold text-orange-400 mt-1">
                      ${prod.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Selector de Cantidad */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isAgotado ? (
                      <span className="text-xs text-zinc-500 italic">No disponible</span>
                    ) : (
                      <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(prod.id, -1)}
                          disabled={qty === 0}
                          className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white font-bold transition flex items-center justify-center text-sm"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-extrabold text-white">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(prod.id, 1)}
                          className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer de Confirmación */}
        <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 text-center sm:text-left">
            {selectedProductsTotalItems > 0 ? (
              <span>
                Seleccionados: <strong className="text-white">{selectedProductsTotalItems} productos</strong> por{" "}
                <strong className="text-orange-400 text-sm">${selectedProductsTotalPrice.toFixed(2)}</strong>
              </span>
            ) : (
              <span>Selecciona uno o más productos para agregar a la cuenta</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-5 py-2.5 text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveProductsToTable}
              disabled={selectedProductsTotalItems === 0}
              className="flex-1 sm:flex-initial rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-6 py-2.5 text-xs font-bold transition shadow-lg shadow-orange-500/20"
            >
              Confirmar y Guardar ({selectedProductsTotalItems})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
