import React from "react";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-1">
          {editingProduct ? "Editar Producto" : "Agregar Producto"}
        </h3>
        <p className="text-xs text-zinc-500 mb-6">
          {editingProduct
            ? "Modifica los datos del producto seleccionado."
            : "Completa la información para registrar un nuevo producto."}
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-white block mb-1">Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Hamburguesa EcoDouble"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-white block mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500"
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
              <label className="text-sm font-semibold text-white block mb-1">Precio ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ej: 14.99"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-white block mb-1">Disponibilidad (Stock)</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="stock"
                  value="disponible"
                  checked={stock === "disponible"}
                  onChange={() => setStock("disponible")}
                  className="text-orange-500 focus:ring-orange-500 h-4 w-4 bg-zinc-950 border-zinc-800 cursor-pointer"
                />
                Disponible
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="stock"
                  value="agotado"
                  checked={stock === "agotado"}
                  onChange={() => setStock("agotado")}
                  className="text-orange-500 focus:ring-orange-500 h-4 w-4 bg-zinc-950 border-zinc-800 cursor-pointer"
                />
                Agotado
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-white block mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalles sobre ingredientes, tamaño, etc..."
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 text-sm font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-2.5 text-sm font-semibold transition shadow-lg shadow-orange-500/20"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
