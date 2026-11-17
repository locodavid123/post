import React from "react";
import { X } from "lucide-react";
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
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteClick(table.id);
        }}
        title="Eliminar mesa"
        className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
      >
        <X size={12} strokeWidth={2.5} />
      </button>

      {/* Botón de selección de la mesa */}
      <button
        type="button"
        onClick={() => onSelect(table.id)}
        className={`w-full aspect-square rounded-2xl border-2 text-xl font-bold transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden ${
          isOccupied
            ? isSelected
              ? "border-orange-500 bg-orange-500 text-white ring-4 ring-orange-500/30 scale-105 shadow-xl shadow-orange-500/25"
              : "border-orange-500/40 bg-orange-500/10 text-orange-300 hover:border-orange-400 hover:bg-orange-500/20"
            : isSelected
            ? "border-emerald-500 bg-emerald-500 text-white ring-4 ring-emerald-500/30 scale-105 shadow-xl shadow-emerald-500/25"
            : "border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/15"
        }`}
      >
        <span className="text-2xl font-black">{table.number}</span>
        <span className="text-[10px] font-semibold opacity-75 mt-0.5">
          {isOccupied ? "Ocupada" : "Libre"}
        </span>
      </button>

      {/* Punto indicador de estado */}
      <div
        className={`mt-1.5 mx-auto w-2 h-2 rounded-full transition-all ${
          isOccupied
            ? "bg-orange-500 shadow-sm shadow-orange-500"
            : "bg-emerald-500 shadow-sm shadow-emerald-500"
        }`}
      />
    </div>
  );
}
