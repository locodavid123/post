import React from "react";
import { Printer, X, CheckCircle2 } from "lucide-react";

export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
}

export interface ReceiptData {
  invoiceNumber: string;
  businessName?: string;
  table: string;
  waiter?: string;
  guestCount?: number;
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  tip?: number;
  total: number;
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData | null;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  receiptData,
}: ReceiptModalProps) {
  if (!isOpen || !receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(receiptData.date).toLocaleString([], {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#12151e] border border-white/[0.08] rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Venta Cobrada con Éxito</h3>
              <p className="text-xs text-zinc-400">
                Ticket listo para imprimir o entregar al cliente
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

        {/* VISTA PREVIA DEL TICKET TÉRMICO (80mm) */}
        <div className="my-4 overflow-y-auto flex justify-center p-2">
          <div
            id="thermal-receipt"
            className="w-full max-w-[320px] bg-white text-zinc-900 p-6 rounded-xl font-mono text-xs shadow-2xl space-y-3 border border-zinc-200 select-all"
          >
            {/* Cabecera del Comercio */}
            <div className="text-center space-y-1 border-b border-dashed border-zinc-400 pb-3">
              <h2 className="text-base font-black tracking-wider uppercase">
                {receiptData.businessName || "ECOPOST RESTOBAR"}
              </h2>
              <p className="text-[11px] text-zinc-600">Sistema de Gestión Gastronómica</p>
              <p className="text-[10px] text-zinc-500">Comprobante de Venta</p>
            </div>

            {/* Metadatos de la Venta */}
            <div className="space-y-1 text-[11px] text-zinc-700 border-b border-dashed border-zinc-400 pb-2">
              <div className="flex justify-between">
                <span>Factura:</span>
                <span className="font-bold text-zinc-950">{receiptData.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha / Hora:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Ubicación:</span>
                <span className="font-semibold">{receiptData.table}</span>
              </div>
              {receiptData.waiter && (
                <div className="flex justify-between">
                  <span>Atendido por:</span>
                  <span>{receiptData.waiter}</span>
                </div>
              )}
            </div>

            {/* Listado de Artículos */}
            <div className="space-y-1.5 py-1">
              <div className="flex justify-between font-bold border-b border-zinc-300 pb-1 text-[11px]">
                <span className="flex-1">Cant. / Detalle</span>
                <span className="w-16 text-right">Total</span>
              </div>

              {receiptData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px] leading-tight">
                  <span className="flex-1 truncate pr-2">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="w-16 text-right font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Desglose de Totales */}
            <div className="border-t border-dashed border-zinc-400 pt-2 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${receiptData.subtotal.toFixed(2)}</span>
              </div>

              {receiptData.tip !== undefined && receiptData.tip > 0 && (
                <div className="flex justify-between text-zinc-700">
                  <span>Propina sugerida:</span>
                  <span>+${receiptData.tip.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-black text-sm pt-1 border-t border-zinc-400 text-zinc-950">
                <span>TOTAL:</span>
                <span>${receiptData.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Método de Pago y Cambio */}
            <div className="border-t border-dashed border-zinc-400 pt-2 space-y-1 text-[11px] text-zinc-700">
              <div className="flex justify-between">
                <span>Forma de Pago:</span>
                <span className="font-bold uppercase text-zinc-950">
                  {receiptData.paymentMethod}
                </span>
              </div>

              {receiptData.cashReceived !== undefined && receiptData.cashReceived > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>Efectivo Entregado:</span>
                    <span>${receiptData.cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-zinc-950">
                    <span>Cambio / Vuelto:</span>
                    <span>${(receiptData.change || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Pie del Ticket */}
            <div className="text-center pt-3 border-t border-dashed border-zinc-400 space-y-1">
              <p className="font-bold text-[11px] uppercase tracking-wider">
                ¡Gracias por su visita!
              </p>
              <p className="text-[9px] text-zinc-500">Conserve este comprobante</p>
              <div className="text-[8px] text-zinc-400 pt-1">
                Powered by EcoPost Terminal
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="pt-4 border-t border-white/[0.06] flex gap-3 no-print">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 text-xs font-bold transition"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-3 text-xs font-bold transition shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-95"
          >
            <Printer size={16} />
            <span>Imprimir Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
}
