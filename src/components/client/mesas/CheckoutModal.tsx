import React from "react";
import {
  CreditCard,
  Banknote,
  Smartphone,
  Coins,
  AlertTriangle,
  X,
  CheckCircle2,
} from "lucide-react";
import { Table } from "./types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable: Table | null;
  tableBillSubtotal: number;
  checkoutPaymentMethod: "Efectivo" | "Tarjeta" | "Transferencia";
  setCheckoutPaymentMethod: (method: "Efectivo" | "Tarjeta" | "Transferencia") => void;
  cashReceived: string;
  setCashReceived: (val: string) => void;
  includeTip: boolean;
  setIncludeTip: (val: boolean) => void;
  tipPercentage: number | "custom";
  setTipPercentage: (val: number | "custom") => void;
  customTipAmount: string;
  setCustomTipAmount: (val: string) => void;
  tipAmount: number;
  totalWithTip: number;
  changeAmount: number;
  numCash: number;
  isCashInsufficient: boolean;
  processCheckout: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  currentTable,
  tableBillSubtotal,
  checkoutPaymentMethod,
  setCheckoutPaymentMethod,
  cashReceived,
  setCashReceived,
  includeTip,
  setIncludeTip,
  tipPercentage,
  setTipPercentage,
  customTipAmount,
  setCustomTipAmount,
  tipAmount,
  totalWithTip,
  changeAmount,
  numCash,
  isCashInsufficient,
  processCheckout,
}: CheckoutModalProps) {
  if (!isOpen || !currentTable) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#12151e] border border-white/[0.08] rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Cierre de Mesa #{currentTable.number}
              </h3>
              <p className="text-xs text-zinc-400">
                Atendido por: {currentTable.waiter || "Mesero"}
              </p>
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

        {/* Resumen de Consumos */}
        <div className="mt-4 bg-zinc-950/80 rounded-2xl border border-white/[0.06] p-3.5 max-h-36 overflow-y-auto space-y-1.5">
          {(currentTable.orders || []).map((item) => (
            <div key={item.productId} className="flex justify-between text-xs text-zinc-400">
              <span className="truncate pr-2">
                {item.name} <strong className="text-zinc-200">×{item.quantity}</strong>
              </span>
              <span className="font-semibold text-zinc-200 shrink-0">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* SELECCIÓN DE MÉTODO DE PAGO */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
            Método de Pago
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Efectivo", icon: <Banknote size={18} /> },
              { label: "Tarjeta", icon: <CreditCard size={18} /> },
              { label: "Transferencia", icon: <Smartphone size={18} /> },
            ].map((item) => {
              const isSelected = checkoutPaymentMethod === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setCheckoutPaymentMethod(item.label as "Efectivo" | "Tarjeta" | "Transferencia");
                    if (item.label !== "Efectivo") {
                      setCashReceived("");
                    }
                  }}
                  className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]"
                      : "bg-zinc-950/70 border-white/[0.06] text-zinc-400 hover:bg-zinc-850 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CÁLCULO DE CAMBIO / DEVUELTA (Efectivo) */}
        {checkoutPaymentMethod === "Efectivo" && (
          <div className="mt-4 p-4 rounded-2xl bg-zinc-950/90 border border-white/[0.06] space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Banknote size={14} className="text-emerald-400" />
                <span>Dinero recibido</span>
              </label>
              <button
                type="button"
                onClick={() => setCashReceived(totalWithTip.toFixed(2))}
                className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-lg transition"
              >
                Monto exacto
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.50"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="0.00"
                className={`w-full rounded-xl border bg-zinc-900 pl-8 pr-4 py-2.5 text-sm font-bold text-white outline-none transition ${
                  cashReceived.trim() !== "" && isCashInsufficient
                    ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30"
                    : "border-white/[0.1] focus:border-orange-500"
                }`}
              />
            </div>

            {/* Accesos directos a billetes frecuentes */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold mr-1">
                Billetes:
              </span>
              {[20, 50, 100].map((bill) => (
                <button
                  key={bill}
                  type="button"
                  onClick={() => setCashReceived(String(bill))}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition ${
                    cashReceived === String(bill)
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-zinc-900 hover:bg-zinc-800 border-white/[0.06] text-zinc-400 hover:text-white"
                  }`}
                >
                  ${bill}
                </button>
              ))}
            </div>

            {/* Visualización del Cambio o Advertencia */}
            {cashReceived.trim() !== "" ? (
              isCashInsufficient ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs animate-fade-in">
                  <AlertTriangle size={15} className="text-rose-400 shrink-0" />
                  <span className="font-medium">
                    Monto insuficiente. Faltan{" "}
                    <strong className="font-bold text-rose-200">
                      ${(totalWithTip - numCash).toFixed(2)}
                    </strong>
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Coins size={18} className="text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Cambio / Devuelta:
                    </span>
                  </div>
                  <span className="text-xl font-black text-emerald-400">
                    ${changeAmount.toFixed(2)}
                  </span>
                </div>
              )
            ) : (
              <p className="text-[11px] text-zinc-500 italic">
                Ingresa con cuánto dinero paga el cliente para calcular el cambio.
              </p>
            )}
          </div>
        )}

        {/* CAMPO DE PROPINA */}
        <div className="mt-4 p-4 rounded-2xl bg-zinc-950/80 border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Coins size={14} className="text-orange-400" />
              <span>¿Desea incluir propina?</span>
            </label>
            <input
              type="checkbox"
              checked={includeTip}
              onChange={(e) => setIncludeTip(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
            />
          </div>

          {includeTip && (
            <div className="space-y-3 pt-2 border-t border-white/[0.06] animate-fade-in">
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTipPercentage(pct)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                      tipPercentage === pct
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-zinc-900 border-white/[0.06] text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTipPercentage("custom")}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                    tipPercentage === "custom"
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-zinc-900 border-white/[0.06] text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  Otro
                </button>
              </div>

              {tipPercentage === "custom" ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Monto ($):</span>
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    value={customTipAmount}
                    onChange={(e) => setCustomTipAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-900 border border-white/[0.1] text-white text-xs px-3 py-2 rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Propina calculada ({tipPercentage}%):</span>
                  <span className="font-bold text-emerald-400">${tipAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desglose de Totales */}
        <div className="mt-4 py-3 border-t border-b border-white/[0.06] space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Subtotal consumos:</span>
            <span>${tableBillSubtotal.toFixed(2)}</span>
          </div>
          {includeTip && (
            <div className="flex justify-between text-xs text-emerald-400 font-medium">
              <span>Propina:</span>
              <span>+${tipAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-1">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Total Final a Cobrar:
            </span>
            <span className="text-2xl font-black text-white">${totalWithTip.toFixed(2)}</span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 py-3 text-xs font-bold transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={processCheckout}
            disabled={isCashInsufficient}
            className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 text-xs font-bold transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={16} />
            <span>Confirmar Cobro</span>
          </button>
        </div>
      </div>
    </div>
  );
}
