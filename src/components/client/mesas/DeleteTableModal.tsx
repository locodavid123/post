import React from "react";
import { Table } from "./types";

interface DeleteTableModalProps {
  tableToDelete: Table | null;
  onClose: () => void;
  onConfirmDelete: (id: number) => void;
}

export default function DeleteTableModal({
  tableToDelete,
  onClose,
  onConfirmDelete,
}: DeleteTableModalProps) {
  if (!tableToDelete) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg">
            ⚠
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Eliminar mesa</h3>
            <p className="text-xs text-zinc-500">
              Mesa #{tableToDelete.number}
            </p>
          </div>
        </div>
        <p className="text-sm text-zinc-400 mb-6">
          ¿Estás seguro? Esta acción no se puede deshacer.
          {tableToDelete.status === "occupied" && (
            <span className="block mt-2 text-orange-400 font-semibold text-xs">
              ⚠ Esta mesa está actualmente ocupada.
            </span>
          )}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 text-sm font-semibold transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirmDelete(tableToDelete.id)}
            className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-3 text-sm font-semibold transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
