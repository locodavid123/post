import React from "react";
import { Table, WAITER_OPTIONS } from "./types";

interface TableDetailPaneProps {
  currentTable: Table;
  tableBillSubtotal: number;
  guestCount: number;
  setGuestCount: (count: number) => void;
  selectedWaiter: string;
  setSelectedWaiter: (waiter: string) => void;
  comment: string;
  setComment: (comment: string) => void;
  handleOpenTable: () => void;
  handleCloseTable: () => void;
  onDeleteClick: (id: number) => void;
  openAddProductsModal: () => void;
  handleUpdateOrderItemQuantity: (productId: number | string, newQty: number) => void;
  openCheckoutModal: () => void;
}

export default function TableDetailPane({
  currentTable,
  tableBillSubtotal,
  guestCount,
  setGuestCount,
  selectedWaiter,
  setSelectedWaiter,
  comment,
  setComment,
  handleOpenTable,
  handleCloseTable,
  onDeleteClick,
  openAddProductsModal,
  handleUpdateOrderItemQuantity,
  openCheckoutModal,
}: TableDetailPaneProps) {
  const isOccupied = currentTable.status === "occupied";
  const totalItemsCount = (currentTable.orders || []).reduce(
    (sum, o) => sum + o.quantity,
    0
  );

  return (
    <aside className="relative rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 backdrop-blur shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300">
      {/* Background glowing gradient accents */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          isOccupied ? "bg-orange-500/15" : "bg-emerald-500/15"
        }`}
      />

      {/* VISTA 1: MESA LIBRE (Formulario para Abrir Mesa) */}
      {!isOccupied ? (
        <div key="free-panel" className="flex flex-col gap-5 animate-fade-in">
          {/* Mesa Header */}
          <div className="rounded-2xl p-4 bg-emerald-500 shadow-lg shadow-emerald-500/20 text-emerald-950">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-950/70">
                MESA DISPONIBLE
              </span>
              <span className="text-[11px] font-bold bg-emerald-900/20 px-2.5 py-0.5 rounded-full text-emerald-950">
                Cap. {currentTable.capacity} pers.
              </span>
            </div>
            <h2 className="mt-1 text-4xl font-black tracking-tight">{currentTable.number}</h2>
            <p className="text-xs font-semibold text-emerald-900/80 mt-1">
              Lista para recibir comensales
            </p>
          </div>

          {/* Cantidad de personas */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Número de Personas
            </label>
            <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-2">
              <button
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center text-lg"
              >
                −
              </button>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-white">{guestCount}</span>
                <span className="text-xs text-zinc-500">comensales</span>
              </div>
              <button
                onClick={() => setGuestCount(Math.min(currentTable.capacity, guestCount + 1))}
                className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center text-lg"
              >
                +
              </button>
            </div>
            <p className="text-[10px] text-zinc-500">
              Capacidad máxima sugerida: {currentTable.capacity} personas
            </p>
          </div>

          {/* Selección de Mesero */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Mesero Asignado <span className="text-orange-400">*</span>
            </label>
            <select
              value={selectedWaiter}
              onChange={(e) => setSelectedWaiter(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
            >
              <option value="">Seleccionar mesero...</option>
              {WAITER_OPTIONS.map((w) => (
                <option key={w} value={w} className="bg-zinc-950">
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Comentario Opcional */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Comentario <span className="text-[11px] font-normal text-zinc-500">(opcional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="Ej: Cumpleaños, alergias, mesa preferencial…"
              className="w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
            />
          </div>

          {/* Botón Abrir Mesa */}
          <div className="mt-2 flex flex-col gap-2">
            <button
              onClick={handleOpenTable}
              disabled={!selectedWaiter}
              className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3.5 text-sm font-bold text-white transition shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transform active:scale-98"
            >
              <span>Abrir mesa</span>
              <span>➔</span>
            </button>
            <button
              onClick={() => onDeleteClick(currentTable.id)}
              className="w-full rounded-xl py-2 text-[11px] font-semibold text-zinc-500 hover:text-rose-400 transition"
            >
              Eliminar mesa {currentTable.number}
            </button>
          </div>
        </div>
      ) : (
        /* VISTA 2: PANEL DE MESA ACTIVA */
        <div key="occupied-panel" className="flex flex-col gap-4 animate-fade-in">
          {/* Header Mesa Activa */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-orange-500/25 via-orange-500/15 to-zinc-900 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                MESA ACTIVA
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                👥 {currentTable.guestCount || 1} comensales
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-medium">Número de mesa</p>
                <h2 className="text-3xl font-extrabold text-white">Mesa #{currentTable.number}</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Consumo actual</p>
                <p className="text-2xl font-black text-orange-400">
                  ${tableBillSubtotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Mesero Asignado */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-sm">
                🧑‍🍳
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-500">Mesero asignado</p>
                <p className="text-xs font-bold text-zinc-200">{currentTable.waiter}</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
              En atención
            </span>
          </div>

          {/* Comentarios de la mesa */}
          {currentTable.comment && currentTable.comment.trim().length > 0 && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
              <span className="text-base shrink-0">📝</span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Nota de la mesa:
                </p>
                <p className="mt-0.5 text-xs text-amber-100 font-medium break-words">
                  {currentTable.comment}
                </p>
              </div>
            </div>
          )}

          {/* Listado de Productos en la Cuenta */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Consumos ({totalItemsCount})
              </span>
              <span className="text-xs font-semibold text-orange-400">
                ${tableBillSubtotal.toFixed(2)}
              </span>
            </div>

            {!currentTable.orders || currentTable.orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl border border-dashed border-zinc-800 text-center gap-2 bg-zinc-950/40">
                <span className="text-2xl">🍽️</span>
                <p className="text-xs text-zinc-400 font-medium">Aún no hay productos en la cuenta.</p>
                <p className="text-[11px] text-zinc-600">Presiona el botón de abajo para registrar el pedido.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                {currentTable.orders.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-zinc-400">
                        ${item.price.toFixed(2)} × {item.quantity} ={" "}
                        <span className="font-semibold text-orange-400">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 shrink-0">
                      <button
                        onClick={() =>
                          handleUpdateOrderItemQuantity(item.productId, item.quantity - 1)
                        }
                        className="w-5 h-5 rounded-md hover:bg-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-white transition flex items-center justify-center"
                        title="Restar o eliminar"
                      >
                        −
                      </button>
                      <span className="text-xs font-bold text-white min-w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateOrderItemQuantity(item.productId, item.quantity + 1)
                        }
                        className="w-5 h-5 rounded-md hover:bg-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-white transition flex items-center justify-center"
                        title="Sumar"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOTONES DE ACCIÓN DE MESA ACTIVA */}
          <div className="mt-2 flex flex-col gap-2.5">
            {/* Botón Agregar Productos */}
            <button
              onClick={openAddProductsModal}
              className="w-full rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-3 text-xs font-bold transition flex items-center justify-center gap-2 shadow-md hover:border-orange-500/50"
            >
              <span className="text-base leading-none text-orange-400">＋</span>
              <span>Agregar productos</span>
            </button>

            {/* Botón Cierre de mesa o pagar */}
            <button
              onClick={openCheckoutModal}
              disabled={!currentTable.orders || currentTable.orders.length === 0}
              className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3.5 text-xs font-extrabold text-white transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <span>💳</span>
              <span>Cierre de mesa o pagar (${tableBillSubtotal.toFixed(2)})</span>
            </button>

            {/* Liberar mesa sin cobrar */}
            <button
              onClick={handleCloseTable}
              className="w-full rounded-xl py-1.5 text-[11px] font-semibold text-zinc-500 hover:text-rose-400 transition"
            >
              Liberar mesa (Sin cobrar)
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
