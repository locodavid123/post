import React from "react";
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
    <aside className="w-full md:w-56 flex flex-col gap-2">
      <div className="flex justify-between items-center px-3 mb-2">
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
          Categorías
        </span>
        <button
          type="button"
          onClick={onOpenNewCategory}
          className="text-[10px] bg-zinc-900 border border-zinc-800 text-orange-400 font-semibold px-2.5 py-1 rounded-lg hover:bg-zinc-800 hover:text-orange-300 transition-all"
        >
          + Nueva
        </button>
      </div>

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
              className={`flex-1 flex justify-between items-center pl-4 ${
                isDeletable ? "pr-10" : "pr-4"
              } py-3 rounded-xl text-left text-xs font-semibold transition-all ${
                active
                  ? "bg-orange-500 text-white animate-fade-in shadow-md shadow-orange-500/20"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white"
              }`}
            >
              <span className="truncate mr-1">
                {cat.icon} {cat.name}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
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
                className="absolute right-2 opacity-0 group-hover/cat:opacity-100 focus:opacity-100 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg w-6 h-6 flex items-center justify-center text-[10px] transition-all shadow-md"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </aside>
  );
}
