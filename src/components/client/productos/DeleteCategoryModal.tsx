import React from "react";

interface DeleteCategoryModalProps {
  categoryKey: string | null;
  onClose: () => void;
  onConfirm: (key: string) => void;
}

export default function DeleteCategoryModal({
  categoryKey,
  onClose,
  onConfirm,
}: DeleteCategoryModalProps) {
  if (categoryKey === null) return null;

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
            <h3 className="text-base font-bold text-white">Eliminar Categoría</h3>
            <p className="text-xs text-zinc-500">Categoría: {categoryKey}</p>
          </div>
        </div>
        <p className="text-sm text-zinc-400 mb-6 font-medium">
          ¿Estás seguro de que deseas eliminar esta categoría?
          <span className="block mt-2 text-zinc-500 text-xs font-normal leading-relaxed">
            Nota: Todos los productos de esta categoría se cambiarán automáticamente a la sección de{" "}
            <strong>"Sin Categoría"</strong> para evitar su pérdida.
          </span>
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
            onClick={() => onConfirm(categoryKey)}
            className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-2.5 text-sm font-semibold transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
