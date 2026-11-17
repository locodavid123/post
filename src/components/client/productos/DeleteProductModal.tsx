import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteProductModalProps {
  productId: number | string | null;
  onClose: () => void;
  onConfirm: (id: number | string) => void;
}

export default function DeleteProductModal({
  productId,
  onClose,
  onConfirm,
}: DeleteProductModalProps) {
  if (productId === null) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#12151e] border border-white/[0.08] rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Eliminar Producto</h3>
            <p className="text-xs text-zinc-500">ID: #{productId}</p>
          </div>
        </div>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          ¿Estás seguro de que deseas eliminar este producto del catálogo? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 text-xs font-bold transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(productId)}
            className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Trash2 size={14} />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
