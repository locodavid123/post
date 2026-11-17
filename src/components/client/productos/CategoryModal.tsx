import React from "react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-1">Agregar Categoría</h3>
        <p className="text-xs text-zinc-500 mb-6">
          Crea una nueva categoría para clasificar tus platos y bebidas.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-white block mb-1">Nombre</label>
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ej: Pizzas, Ensaladas..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white block mb-1">Icono / Emoji</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewCategoryIcon(emoji)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                    newCategoryIcon === emoji
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "bg-zinc-950 border border-zinc-800 hover:bg-zinc-850 text-zinc-300"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 text-sm font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-2.5 text-sm font-semibold transition shadow-lg shadow-orange-500/20"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
