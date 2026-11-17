import React from "react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg font-bold">
            ⚠️
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Eliminar Producto</h3>
            <p className="text-xs text-zinc-500">ID: #{productId}</p>
          </div>
        </div>
        <p className="text-sm text-zinc-400 mb-6">
          ¿Estás seguro de que deseas eliminar este producto del catálogo? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 text-sm font-semibold transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(productId)}
            className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-2.5 text-sm font-semibold transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
