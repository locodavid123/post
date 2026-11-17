"use client";

import React, { useState, useEffect } from "react";
import type { SongRequest as PrismaSongRequest, TableSession } from "@prisma/client";
import {
  Music,
  Search,
  Plus,
  Radio,
  CheckCircle2,
  Sparkles,
  Volume2,
  User,
  X,
} from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

type SongRequestWithRelations = PrismaSongRequest & { requestedBy: TableSession };

export default function UserJukeboxPage({
  params,
}: {
  params: { businessCode: string; tableId: string };
}) {
  const { businessCode, tableId } = params;

  const [nickname, setNickname] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingId, setIsRequestingId] = useState<string | null>(null);
  const [songQueue, setSongQueue] = useState<SongRequestWithRelations[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      const response = await fetch(`/api/jukebox/queue?businessCode=${businessCode}`);
      if (!response.ok) throw new Error("Error al obtener la cola");
      const queueData = await response.json();
      setSongQueue(queueData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nicknameInput.trim() === "") return;
    try {
      const response = await fetch("/api/jukebox/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessCode, tableId, nickname: nicknameInput }),
      });
      if (!response.ok) throw new Error("No se pudo registrar el nickname.");
      setNickname(nicknameInput);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/jukebox/search?q=${encodeURIComponent(searchQuery)}`);
      const results = await response.json();
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error("Error al buscar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSong = async (song: Song) => {
    setIsRequestingId(song.id);
    try {
      const response = await fetch("/api/jukebox/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song, businessCode, tableId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "No se pudo pedir la canción.");
      }

      setToastMessage(`¡"${song.title}" añadida a la cola!`);
      setTimeout(() => setToastMessage(null), 3500);
      setSearchResults([]);
      setSearchQuery("");
      fetchQueue();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsRequestingId(null);
    }
  };

  const formattedTableName = decodeURIComponent(tableId).replace(/-/g, " ");

  // Pantalla de bienvenida / registro de nickname
  if (!nickname) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090a0f] text-zinc-100 p-4 relative overflow-hidden">
        {/* Glows */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-orange-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-amber-500/15 blur-[100px] pointer-events-none" />

        <div className="bg-[#12151e] p-8 rounded-3xl border border-white/[0.08] text-center w-full max-w-sm shadow-2xl relative z-10 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-orange-500/25">
            <Radio size={28} />
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            Jukebox Musical
          </h1>
          <p className="text-xs text-zinc-400 mt-1 mb-6">
            Estás en la <span className="font-bold text-orange-400 capitalize">{formattedTableName}</span>. Elige las canciones que sonarán en el local.
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                required
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="Tu nombre o apodo..."
                className="w-full bg-zinc-950/80 border border-white/[0.08] text-white text-sm pl-9 pr-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none transition-all placeholder:text-zinc-600 text-center font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/25 active:scale-95"
            >
              Comenzar a Pedir
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Interfaz principal del usuario
  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 p-4 sm:p-6 pb-20">
      <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fade-in">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#12151e] border border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
              <Music size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">¡Hola, {nickname}!</h2>
              <p className="text-[11px] text-orange-400 font-semibold capitalize">
                {formattedTableName}
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>En vivo</span>
          </span>
        </div>

        {/* Toast Notificación */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Buscador de Canciones */}
        <div className="bg-[#12151e] border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Search size={15} className="text-orange-400" />
            <span>Busca y pide tu canción</span>
          </h3>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre del tema o artista..."
                className="w-full bg-zinc-950/80 border border-white/[0.08] text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl focus:border-orange-500 focus:outline-none transition-all placeholder:text-zinc-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/20 shrink-0"
            >
              {isLoading ? "Buscando..." : "Buscar"}
            </button>
          </form>

          {/* Resultados de Búsqueda */}
          {searchResults.length > 0 && (
            <div className="mt-4 flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Resultados ({searchResults.length}):
              </span>
              {searchResults.map((song) => (
                <div
                  key={song.id}
                  className="flex justify-between items-center p-3 bg-zinc-950/80 border border-white/[0.06] hover:border-orange-500/30 rounded-xl gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-12 h-12 rounded-lg object-cover border border-white/[0.06] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-white truncate">{song.title}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{song.artist}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRequestSong(song)}
                    disabled={isRequestingId === song.id}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shrink-0 flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus size={12} />
                    <span>{isRequestingId === song.id ? "Pidiendo..." : "Pedir"}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cola de Reproducción */}
        <div className="bg-[#12151e] border border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Volume2 size={16} className="text-orange-400" />
              <span>Cola de canciones ({songQueue.length})</span>
            </h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Actualización automática
            </span>
          </div>

          {songQueue.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 flex flex-col items-center gap-1">
              <Music size={24} className="text-zinc-600 mb-1" />
              <p className="text-xs font-medium text-zinc-400">La cola está vacía.</p>
              <p className="text-[11px] text-zinc-600">¡Sé el primero en pedir un tema!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
              {songQueue.map((song, index) => {
                const isMyTable = song.requestedBy?.tableId === tableId;
                return (
                  <div
                    key={song.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      isMyTable
                        ? "bg-orange-500/10 border-orange-500/30"
                        : "bg-zinc-950/70 border-white/[0.06]"
                    }`}
                  >
                    <span className="font-black text-xs text-zinc-500 w-5 shrink-0 text-center">
                      #{index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-white truncate">{song.title}</p>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {song.artist}{" "}
                        <span className="text-zinc-500">
                          (por {song.requestedBy?.nickname ?? "Comensal"})
                        </span>
                      </p>
                    </div>
                    {isMyTable && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-full shrink-0">
                        Tu mesa
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
