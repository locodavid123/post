import React from "react";
import { Edit3, Trash2, CheckCircle2, XCircle } from "lucide-react";
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
    <div className="bg-[#12151e] border border-white/[0.08] hover:border-orange-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-0.5">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <span className="text-xs bg-zinc-950/80 text-orange-400 px-2.5 py-1 rounded-full border border-orange-500/20 font-semibold truncate max-w-[130px]">
            {product.category}
          </span>
          <span
            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${
              isAvailable
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            {isAvailable ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
            <span>{product.stock}</span>
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
      <div className="flex justify-between items-center border-t border-white/[0.06] pt-4 mt-4">
        <span className="text-xl font-black text-white">
          ${Number(product.price).toLocaleString("es-CO")}
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="flex items-center gap-1 text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold px-3 py-1.5 rounded-xl border border-white/[0.08] transition-all"
          >
            <Edit3 size={12} />
            <span>Editar</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(product.id)}
            className="flex items-center gap-1 text-[11px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold px-2.5 py-1.5 rounded-xl border border-rose-500/20 transition-all hover:border-rose-500/40"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
