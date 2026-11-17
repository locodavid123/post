import React from "react";
import { Product } from "./types";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number | string) => void;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const isAvailable = product.stock === "disponible";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all group">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <span className="text-xs bg-zinc-950 text-orange-400 px-2.5 py-1 rounded-full border border-zinc-850 font-semibold truncate max-w-[120px]">
            {product.category}
          </span>
          <span
            className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
              isAvailable
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            {product.stock}
          </span>
        </div>

        {/* Info */}
        <div>
          <h4 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
            {product.name}
          </h4>
          <p className="text-xs text-zinc-400 line-clamp-3 mt-1.5 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Price & Actions */}
      <div className="flex justify-between items-center border-t border-zinc-850 pt-4 mt-4">
        <span className="text-lg font-bold text-white">${product.price.toFixed(2)}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="text-[10px] bg-zinc-950 hover:bg-zinc-850 text-zinc-300 hover:text-white font-semibold px-3 py-1.5 rounded-lg border border-zinc-800 transition-all"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(product.id)}
            className="text-[10px] bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 font-semibold px-3 py-1.5 rounded-lg border border-rose-900/20 transition-all"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
