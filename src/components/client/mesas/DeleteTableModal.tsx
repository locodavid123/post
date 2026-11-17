import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
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
            className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-3 text-sm font-semibold transition flex items-center justify-center gap-1.5"
          >
            <Trash2 size={15} />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
