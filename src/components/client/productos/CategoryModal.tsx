import React from "react";
import { X, Tag } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  newCategoryName: string;
  setNewCategoryName: (val: string) => void;
  newCategoryIcon: string;
  setNewCategoryIcon: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const EMOJI_OPTIONS = ["🍕", "🥗", "🌮", "🍖", "🍦", "🍹", "☕", "🍣", "🍞", "🍽️"];

export default function CategoryModal({
  isOpen,
  onClose,
  newCategoryName,
  setNewCategoryName,
  newCategoryIcon,
  setNewCategoryIcon,
  onSubmit,
}: CategoryModalProps) {
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
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
              <Tag size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Nueva Categoría</h3>
              <p className="text-xs text-zinc-400">Clasifica tus platos y bebidas.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Nombre de la categoría
            </label>
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ej: Pizzas, Ensaladas..."
              className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/80 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
              Icono / Emoji distintivo
            </label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewCategoryIcon(emoji)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                    newCategoryIcon === emoji
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105"
                      : "bg-zinc-950/70 border border-white/[0.06] hover:bg-zinc-850 text-zinc-300"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 py-2.5 text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-2.5 text-xs font-bold transition shadow-lg shadow-orange-500/20"
            >
              Crear Categoría
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
