import React from "react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white mb-1">Agregar Mesa</h3>
        <p className="text-xs text-zinc-500 mb-6">
          Se agregará como Mesa #{nextTableNumber}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-white block mb-2">Capacidad</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNewCapacity((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center"
              >
                −
              </button>
              <span className="flex-1 text-center text-2xl font-bold text-white">{newCapacity}</span>
              <button
                type="button"
                onClick={() => setNewCapacity((prev) => Math.min(20, prev + 1))}
                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center"
              >
                +
              </button>
            </div>
            <p className="text-[11px] text-zinc-600 text-center mt-1">personas máximo</p>
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-xs text-zinc-500 mb-2">Presets rápidos</p>
            <div className="flex gap-2 flex-wrap">
              {[2, 4, 6, 8, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNewCapacity(n)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    newCapacity === n
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {n} personas
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
