import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Printer, X, Copy, ExternalLink, CheckCircle2 } from "lucide-react";

interface TableQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  businessCode?: string;
}

export default function TableQRModal({
  isOpen,
  onClose,
  tableNumber,
  businessCode = "demo",
}: TableQRModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // URL del comensal para la mesa
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const tableSlug = `mesa-${tableNumber}`;
  const customerUrl = `${origin}/b/${businessCode}/${tableSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#12151e] border border-white/[0.08] rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between w-full pb-4 border-b border-white/[0.06] no-print">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Código QR de Mesa</h3>
              <p className="text-xs text-zinc-400">Mesa #{tableNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* CONTENEDOR IMPRIMIBLE DEL QR */}
        <div
          id="printable-table-qr"
          className="my-5 bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 border border-zinc-200 select-all"
        >
          <div className="text-center text-zinc-950 font-black text-sm tracking-wider uppercase">
            EcoPost Jukebox
          </div>

          <div className="p-2 bg-white rounded-xl">
            <QRCodeSVG
              value={customerUrl}
              size={180}
              level="H"
              includeMargin={false}
              className="rounded-lg"
            />
          </div>

          <div className="text-center">
            <span className="inline-block bg-orange-500 text-white font-black text-base px-4 py-1 rounded-full shadow-sm">
              MESA #{tableNumber}
            </span>
            <p className="text-[10px] text-zinc-600 mt-1.5 font-medium">
              Escanea con tu cámara para pedir canciones
            </p>
          </div>
        </div>

        {/* Enlace y Acciones */}
        <div className="w-full space-y-3 no-print">
          <div className="flex items-center gap-2 p-2.5 bg-zinc-950/80 rounded-xl border border-white/[0.08] text-xs text-zinc-400 text-left">
            <span className="truncate flex-1 font-mono text-[11px] text-zinc-300">
              {customerUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-orange-400 hover:text-orange-300 p-1 rounded transition shrink-0"
              title="Copiar enlace"
            >
              {copied ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Copy size={15} />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={customerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 text-xs font-bold transition"
            >
              <ExternalLink size={13} />
              <span>Probar</span>
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-2.5 text-xs font-bold transition shadow-lg shadow-orange-500/20 active:scale-95"
            >
              <Printer size={13} />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
