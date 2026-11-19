import React, { useState } from "react";
import {
  Users,
  UserCheck,
  Plus,
  Minus,
  CreditCard,
  ArrowRight,
  Trash2,
  Utensils,
  StickyNote,
  Unlock,
  QrCode,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Table, WAITER_OPTIONS } from "./types";

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "$0";
  const formatted = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `$${formatted}`;
}

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
  onOpenQRModal?: () => void;
  isSavingOrder?: boolean;
  orderSyncError?: string | null;
  onClearOrderSyncError?: () => void;
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
  onOpenQRModal,
  isSavingOrder,
  orderSyncError,
  onClearOrderSyncError,
}: TableDetailPaneProps) {
  const [showConfirmRelease, setShowConfirmRelease] = useState(false);

  const isOccupied = currentTable.status === "occupied";
  const orders = currentTable.orders || [];
  const totalItemsCount = orders.reduce((sum, o) => sum + o.quantity, 0);

  // Manejo de liberación con confirmación si hay consumos pendientes
  const handleReleaseTableClick = () => {
    if (orders.length > 0) {
      setShowConfirmRelease(true);
    } else {
      handleCloseTable();
    }
  };

  return (
    <aside className="relative rounded-3xl border border-white/[0.08] bg-[#10131b]/95 p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300">
      {/* Background glowing gradient accents */}
      <div
        className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          isOccupied ? "bg-orange-500/15" : "bg-emerald-500/15"
        }`}
      />

      {/* VISTA 1: MESA LIBRE (Formulario para Abrir Mesa) */}
      {!isOccupied ? (
        <div key="free-panel" className="flex flex-col gap-5 animate-fade-in">
          {/* Mesa Header */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 text-emerald-950">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-black text-emerald-950/80">
                MESA DISPONIBLE
              </span>
              <span className="text-[11px] font-bold bg-emerald-950/20 px-2.5 py-0.5 rounded-full text-emerald-950">
                Cap. {currentTable.capacity} pers.
              </span>
            </div>
            <h2 className="mt-1 text-4xl font-black tracking-tight">{currentTable.number}</h2>
            <p className="text-xs font-semibold text-emerald-950/80 mt-1">
              Lista para recibir comensales
            </p>
          </div>

          {/* Cantidad de personas */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Users size={13} className="text-orange-400" />
              <span>Número de Personas</span>
            </label>
            <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-zinc-950/70 p-2">
              <button
                type="button"
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center hover:scale-105"
              >
                <Minus size={15} />
              </button>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-white">{guestCount}</span>
                <span className="text-xs text-zinc-500">comensales</span>
              </div>
              <button
                type="button"
                onClick={() => setGuestCount(Math.min(currentTable.capacity, guestCount + 1))}
                className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-center hover:scale-105"
              >
                <Plus size={15} />
              </button>
            </div>
            <p className="text-[10px] text-zinc-500">
              Capacidad máxima sugerida: {currentTable.capacity} personas
            </p>
          </div>

          {/* Selección de Mesero */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <UserCheck size={13} className="text-orange-400" />
              <span>Mesero Asignado</span> <span className="text-orange-400">*</span>
            </label>
            <select
              value={selectedWaiter}
              onChange={(e) => setSelectedWaiter(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.08] bg-zinc-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
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
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <StickyNote size={13} className="text-zinc-500" />
              <span>Comentario</span> <span className="text-[11px] font-normal text-zinc-500">(opcional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              placeholder="Ej: Cumpleaños, alergias, mesa preferencial…"
              className="w-full resize-none rounded-2xl border border-white/[0.08] bg-zinc-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
            />
          </div>

          {/* Botón Abrir Mesa */}
          <div className="mt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleOpenTable}
              disabled={!selectedWaiter}
              className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3.5 text-sm font-bold text-white transition shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transform active:scale-98"
            >
              <span>Abrir mesa</span>
              <ArrowRight size={16} />
            </button>
            {onOpenQRModal && (
              <button
                type="button"
                onClick={onOpenQRModal}
                className="w-full rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/[0.08] hover:border-orange-500/40 text-zinc-300 hover:text-white px-3 py-2.5 text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <QrCode size={14} className="text-orange-400" />
                <span>Ver / Imprimir QR de Mesa</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onDeleteClick(currentTable.id)}
              className="w-full rounded-xl py-2 text-[11px] font-semibold text-zinc-500 hover:text-rose-400 transition flex items-center justify-center gap-1"
            >
              <Trash2 size={12} />
              <span>Eliminar mesa {currentTable.number}</span>
            </button>
          </div>
        </div>
      ) : (
        /* VISTA 2: PANEL DE MESA ACTIVA */
        <div key="occupied-panel" className="flex flex-col gap-4 animate-fade-in">
          {/* Header Mesa Activa */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-zinc-950 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                MESA ACTIVA
              </span>
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                <Users size={13} className="text-orange-400" />
                {currentTable.guestCount || 1} comensales
              </span>
            </div>

            {/* Ajuste 1 y 2: Espaciado con gap-4 y formato de moneda tabular-nums sin desbordes */}
            <div className="mt-3 flex items-baseline justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-400 font-medium">Número de mesa</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white truncate">
                  Mesa #{currentTable.number}
                </h2>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Consumo actual</p>
                <p className="text-xl sm:text-2xl font-black text-orange-400 tabular-nums">
                  {formatCurrency(tableBillSubtotal)}
                </p>
              </div>
            </div>
          </div>

          {/* Mesero Asignado */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/70 border border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <UserCheck size={16} />
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
              <StickyNote size={15} className="text-amber-400 shrink-0 mt-0.5" />
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

          {/* Listado de Productos en la Cuenta (Consumos) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Consumos ({totalItemsCount})
                </span>
                {isSavingOrder && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-orange-400 font-semibold bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 animate-pulse">
                    <RefreshCw size={10} className="animate-spin" /> Guardando...
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-orange-400 tabular-nums">
                {formatCurrency(tableBillSubtotal)}
              </span>
            </div>

            {/* Alerta si falla la conexión con la API */}
            {orderSyncError && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium animate-fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle size={14} className="text-rose-400 shrink-0" />
                  <span className="truncate">{orderSyncError}</span>
                </div>
                {onClearOrderSyncError && (
                  <button
                    type="button"
                    onClick={onClearOrderSyncError}
                    className="text-rose-400 hover:text-white text-xs ml-2 shrink-0 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl border border-dashed border-white/[0.08] text-center gap-2 bg-zinc-950/40">
                <Utensils size={24} className="text-zinc-600" />
                <p className="text-xs text-zinc-400 font-medium">Aún no hay productos en la cuenta.</p>
                <p className="text-[11px] text-zinc-600">Presiona el botón de abajo para registrar el pedido.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                {orders.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-2.5 bg-zinc-950/80 rounded-xl border border-white/[0.06] gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-zinc-400 tabular-nums">
                        {formatCurrency(item.price)} × {item.quantity} ={" "}
                        <span className="font-semibold text-orange-400">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </p>
                    </div>

                    {/* Ajuste 3: Selector de cantidad con ícono Trash2 en rojo cuando la cantidad es 1 */}
                    <div className="flex items-center gap-1 bg-zinc-900 border border-white/[0.08] rounded-lg p-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderItemQuantity(item.productId, item.quantity - 1)
                        }
                        className={`w-6 h-6 rounded-md transition flex items-center justify-center ${
                          item.quantity === 1
                            ? "text-rose-500 hover:bg-rose-500/20 hover:text-rose-400"
                            : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                        title={item.quantity === 1 ? "Eliminar producto de la cuenta" : "Restar cantidad"}
                      >
                        {item.quantity === 1 ? (
                          <Trash2 size={12} className="text-rose-500" />
                        ) : (
                          <Minus size={11} />
                        )}
                      </button>
                      <span className="text-xs font-bold text-white min-w-4 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateOrderItemQuantity(item.productId, item.quantity + 1)
                        }
                        className="w-6 h-6 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition flex items-center justify-center"
                        title="Sumar cantidad"
                      >
                        <Plus size={11} />
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
              type="button"
              onClick={openAddProductsModal}
              className="w-full rounded-2xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.08] text-white px-4 py-3 text-xs font-bold transition flex items-center justify-center gap-2 shadow-md hover:border-orange-500/50"
            >
              <Plus size={15} className="text-orange-400" />
              <span>Agregar productos</span>
            </button>

            {/* Botón Cierre de mesa o pagar con formato de moneda legible */}
            <button
              type="button"
              onClick={openCheckoutModal}
              disabled={orders.length === 0}
              className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3.5 text-xs font-extrabold text-white transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <CreditCard size={15} />
              <span>Cierre de mesa o pagar ({formatCurrency(tableBillSubtotal)})</span>
            </button>

            {/* Ajuste 4: Liberar mesa sin cobrar con confirmación si hay saldo/consumos */}
            <button
              type="button"
              onClick={handleReleaseTableClick}
              className="w-full rounded-xl py-1.5 text-[11px] font-semibold text-zinc-500 hover:text-rose-400 transition flex items-center justify-center gap-1.5"
            >
              <Unlock size={12} />
              <span>Liberar mesa (Sin cobrar)</span>
            </button>

            {/* Ver QR de Mesa */}
            {onOpenQRModal && (
              <button
                type="button"
                onClick={onOpenQRModal}
                className="w-full rounded-xl py-1 text-[11px] font-medium text-zinc-500 hover:text-orange-400 transition flex items-center justify-center gap-1.5"
              >
                <QrCode size={12} />
                <span>Ver QR de esta mesa</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Diálogo modal de confirmación al liberar mesa con saldo */}
      {showConfirmRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-rose-500/30 bg-[#12151e] p-6 shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">¿Liberar mesa con saldo?</h4>
                <p className="text-xs text-zinc-400">Mesa #{currentTable.number}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Esta mesa tiene{" "}
              <strong className="text-white font-semibold">
                {totalItemsCount} {totalItemsCount === 1 ? "producto cargado" : "productos cargados"}
              </strong>{" "}
              por un total acumulado de{" "}
              <strong className="text-orange-400 font-bold tabular-nums">
                {formatCurrency(tableBillSubtotal)}
              </strong>{" "}
              que aún no han sido cobrados.
            </p>

            <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-950/80 p-3 rounded-xl border border-white/[0.04]">
              Al liberar la mesa sin cobrar, se descartarán los consumos pendientes de esta sesión y la mesa quedará disponible.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmRelease(false)}
                className="flex-1 rounded-xl border border-white/[0.08] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs py-2.5 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmRelease(false);
                  handleCloseTable();
                }}
                className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 font-bold text-white text-xs py-2.5 transition shadow-lg shadow-rose-500/25 active:scale-98"
              >
                Sí, liberar mesa
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
