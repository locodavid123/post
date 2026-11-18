"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useJukebox } from "@/context/JukeboxContext";
import {
  Music,
  SkipForward,
  ChevronDown,
  ChevronUp,
  Volume2,
  ExternalLink,
  Disc,
} from "lucide-react";

export default function PersistentJukeboxPlayer() {
  const { currentSong, handleNext, isProcessing } = useJukebox();
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = useState(false);

  // Si no hay canción en reproducción, no renderizamos el reproductor
  if (!currentSong) return null;

  const isJukeboxPage = pathname === "/client/jukebox";
  const requesterText = currentSong.requestedBy?.nickname
    ? `${currentSong.requestedBy.nickname} (${currentSong.requestedBy.tableId?.replace(/-/g, " ") || "Mesa"})`
    : currentSong.requestedBy?.tableId
    ? currentSong.requestedBy.tableId.replace(/-/g, " ")
    : "Administrador";

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-in-out ${
        isJukeboxPage
          ? "bottom-5 right-5 w-72 sm:w-80 opacity-90 hover:opacity-100"
          : isMinimized
          ? "bottom-4 right-4 w-72 sm:w-80"
          : "bottom-5 right-5 w-80 sm:w-88"
      }`}
    >
      <div className="bg-[#12151e]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white transition-all">
        {/* Top Header Bar */}
        <div className="px-3.5 py-2 bg-zinc-950/80 border-b border-white/[0.06] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-bold text-[11px] uppercase tracking-wider text-orange-400 flex items-center gap-1">
              <Disc size={12} className="animate-spin text-orange-400" />
              Rockola en Vivo
            </span>
            <span className="text-[10px] text-zinc-500 truncate max-w-[120px]" title={`Pedida por: ${requesterText}`}>
              • {requesterText}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isJukeboxPage && (
              <Link
                href="/client/jukebox"
                className="text-[10px] text-zinc-400 hover:text-orange-400 p-1 rounded-md transition"
                title="Abrir Rockola completa"
              >
                <ExternalLink size={12} />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-zinc-400 hover:text-white p-1 rounded-md transition"
              title={isMinimized ? "Expandir reproductor" : "Minimizar reproductor"}
            >
              {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Video Container (Always kept in DOM so audio never stops!) */}
        <div
          className={`w-full bg-black transition-all duration-300 relative ${
            isMinimized ? "h-0 overflow-hidden opacity-0" : "aspect-video opacity-100"
          }`}
        >
          <iframe
            key={currentSong.youtubeId}
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&enablejsapi=1`}
            title={currentSong.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Bottom Track Info & Controls */}
        <div className="p-3 flex items-center justify-between gap-3 bg-[#12151e]/90">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentSong.thumbnailUrl}
              alt={currentSong.title}
              className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0 shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight" title={currentSong.title}>
                {currentSong.title}
              </p>
              <p className="text-[11px] text-zinc-400 truncate leading-tight mt-0.5">
                {currentSong.artist}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleNext}
              disabled={isProcessing}
              className="flex items-center gap-1 bg-zinc-800 hover:bg-orange-500 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-sm"
              title="Pasar al siguiente tema de la cola"
            >
              <SkipForward size={13} />
              <span className="hidden sm:inline text-[11px]">Siguiente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
