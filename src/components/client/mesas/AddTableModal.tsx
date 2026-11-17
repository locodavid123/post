import React from "react";
import { Plus, Minus, PlusCircle } from "lucide-react";

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  newCapacity: number;
  setNewCapacity: React.Dispatch<React.SetStateAction<number>>;
  handleAddTable: () => void;
  nextTableNumber: number;
}

export default function AddTableModal({
  isOpen,
  onClose,
  newCapacity,
  setNewCapacity,
  handleAddTable,
  nextTableNumber,
}: AddTableModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#12151e] border border-white/[0.08] rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
            <PlusCircle size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Agregar Mesa</h3>
            <p className="text-xs text-zinc-500">Se agregará como Mesa #{nextTableNumber}</p>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Capacidad máxima
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNewCapacity((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center"
              >
                <Minus size={16} />
              </button>
              <span className="flex-1 text-center text-2xl font-bold text-white">{newCapacity}</span>
              <button
                type="button"
                onClick={() => setNewCapacity((prev) => Math.min(20, prev + 1))}
                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 text-center mt-1">personas máximo</p>
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Presets rápidos
            </p>
            <div className="flex gap-2 flex-wrap">
              {[2, 4, 6, 8, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNewCapacity(n)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    newCapacity === n
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "bg-zinc-900 border border-white/[0.06] text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {n} pers.
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 text-sm font-semibold transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAddTable}
            className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-3 text-sm font-semibold transition shadow-lg shadow-orange-500/20"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
