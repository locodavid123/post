import React from "react";
import { Table } from "./types";

interface TableCardProps {
  table: Table;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDeleteClick: (id: number) => void;
}

export default function TableCard({
  table,
  isSelected,
  onSelect,
  onDeleteClick,
}: TableCardProps) {
  const isOccupied = table.status === "occupied";

  return (
    <div className="relative group">
      {/* Botón para eliminar mesa */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteClick(table.id);
        }}
        title="Eliminar mesa"
        className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
      >
        ×
      </button>

      {/* Botón de selección de la mesa */}
      <button
        onClick={() => onSelect(table.id)}
        className={`w-full aspect-square rounded-2xl border-2 text-xl font-bold transition-all ${
          isOccupied
            ? isSelected
              ? "border-blue-500 bg-orange-500 text-white ring-4 ring-blue-500/35 scale-105 shadow-xl shadow-blue-500/20"
              : "border-orange-500/60 bg-orange-500/15 text-orange-300 hover:border-orange-400 hover:bg-orange-500/25"
            : isSelected
            ? "border-blue-500 bg-emerald-500 text-white ring-4 ring-blue-500/35 scale-105 shadow-xl shadow-blue-500/20"
            : "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/20"
        }`}
      >
        {table.number}
      </button>

      {/* Punto indicador de estado */}
      <div
        className={`mt-1.5 mx-auto w-1.5 h-1.5 rounded-full ${
          isOccupied
            ? "bg-orange-500 shadow-sm shadow-orange-500"
            : "bg-emerald-500"
        }`}
      />
    </div>
  );
}
