import React from "react";
import { X, UtensilsCrossed } from "lucide-react";
import { Product, Category } from "./types";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  name: string;
  setName: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  categories: Category[];
  price: number | string;
  setPrice: (val: number | string) => void;
  stock: "disponible" | "agotado";
  setStock: (val: "disponible" | "agotado") => void;
  description: string;
  setDescription: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  name,
  setName,
  category,
  setCategory,
  categories,
  price,
  setPrice,
  stock,
  setStock,
  description,
  setDescription,
  onSubmit,
}: ProductFormModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#12151e] border border-white/[0.08] rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
              <UtensilsCrossed size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h3>
              <p className="text-xs text-zinc-400">
                {editingProduct
                  ? "Modifica los datos del producto seleccionado."
                  : "Completa la información para registrar el ítem."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Nombre del producto
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Hamburguesa EcoDouble"
              className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/80 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500"
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key} className="bg-zinc-950">
                    {c.name}
                  </option>
                ))}
                {category === "Sin Categoría" && (
                  <option value="Sin Categoría" className="bg-zinc-950">
                    Sin Categoría
                  </option>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Precio ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ej: 14.99"
                className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/80 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
              Disponibilidad (Stock)
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="stock"
                  value="disponible"
                  checked={stock === "disponible"}
                  onChange={() => setStock("disponible")}
                  className="accent-orange-500 h-4 w-4 bg-zinc-950 border-zinc-800 cursor-pointer"
                />
                Disponible
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="stock"
                  value="agotado"
                  checked={stock === "agotado"}
                  onChange={() => setStock("agotado")}
                  className="accent-orange-500 h-4 w-4 bg-zinc-950 border-zinc-800 cursor-pointer"
                />
                Agotado
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalles sobre ingredientes, tamaño, etc..."
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-zinc-950/80 px-4 py-2.5 text-xs text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 py-2.5 text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-2.5 text-xs font-bold transition shadow-lg shadow-orange-500/20"
            >
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
