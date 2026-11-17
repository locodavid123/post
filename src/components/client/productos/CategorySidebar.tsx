import React from "react";
import { Plus, X } from "lucide-react";
import { Product } from "./types";

export interface CategoryItem {
  name: string;
  key: string;
  icon: string;
}

interface CategorySidebarProps {
  categoriesList: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (key: string) => void;
  products: Product[];
  onOpenNewCategory: () => void;
  onDeleteCategoryClick: (key: string) => void;
}

export default function CategorySidebar({
  categoriesList,
  selectedCategory,
  onSelectCategory,
  products,
  onOpenNewCategory,
  onDeleteCategoryClick,
}: CategorySidebarProps) {
  return (
    <aside className="w-full md:w-60 flex flex-col gap-2">
      <div className="flex justify-between items-center px-3 mb-2">
        <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
          Categorías
        </span>
        <button
          type="button"
          onClick={onOpenNewCategory}
          className="flex items-center gap-1 text-[11px] bg-zinc-900 border border-white/[0.08] text-orange-400 font-semibold px-2.5 py-1 rounded-lg hover:bg-zinc-800 hover:text-orange-300 transition-all shadow-sm"
        >
          <Plus size={12} />
          <span>Nueva</span>
        </button>
      </div>

      <div className="space-y-1.5">
        {categoriesList.map((cat) => {
          const count =
            cat.key === "Todos"
              ? products.length
              : products.filter((p) => p.category === cat.key).length;
          const active = selectedCategory === cat.key;
          const isDeletable = cat.key !== "Todos" && cat.key !== "Sin Categoría";

          return (
            <div key={cat.key} className="relative group/cat flex items-center w-full">
              <button
                type="button"
                onClick={() => onSelectCategory(cat.key)}
                className={`flex-1 flex justify-between items-center pl-3.5 ${
                  isDeletable ? "pr-9" : "pr-3.5"
                } py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-[1.01]"
                    : "bg-[#12151e]/80 border border-white/[0.06] text-zinc-300 hover:bg-zinc-850 hover:text-white"
                }`}
              >
                <span className="truncate mr-1 flex items-center gap-1.5">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-bold ${
                    active ? "bg-white/20 text-white" : "bg-zinc-950 text-zinc-500"
                  }`}
                >
                  {count}
                </span>
              </button>

              {isDeletable && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategoryClick(cat.key);
                  }}
                  title="Eliminar categoría"
                  className="absolute right-2 opacity-0 group-hover/cat:opacity-100 focus:opacity-100 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg w-5 h-5 flex items-center justify-center transition-all shadow-md"
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
