"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { SongRequest as PrismaSongRequest, TableSession } from "@prisma/client";
import {
  Search,
  Music,
  Play,
  SkipForward,
  Trash2,
  Plus,
  X,
  Disc,
  Radio,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Crown,
} from "lucide-react";

type SongRequestWithRelations = PrismaSongRequest & { requestedBy: TableSession };

interface YouTubeSongResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  url?: string;
}

export default function JukeboxAdminPage() {
  const [queue, setQueue] = useState<SongRequestWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [businessCode, setBusinessCode] = useState<string>("demo");
  const [businessPlan, setBusinessPlan] = useState<string>("FREE");

  // Obtener negocio del usuario si está autenticado
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.business) {
          setBusinessCode(data.user.business.code || data.user.businessId || "demo");
          setBusinessPlan(data.user.business.plan || "FREE");
        } else if (data?.user?.businessId) {
          setBusinessCode(data.user.businessId);
        }
      })
      .catch(() => {});
  }, []);

  // Estados para el buscador de YouTube
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<YouTubeSongResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingSongId, setAddingSongId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Carga la cola desde el servidor
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`/api/jukebox/queue?businessCode=${encodeURIComponent(businessCode)}`);
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
    } catch (err) {
      console.error("Error al obtener la cola:", err);
    } finally {
      setIsLoading(false);
    }
  }, [businessCode]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  // Canción actualmente en reproducción (status === 'PLAYING')
  const currentSong = queue.find((s) => s.status === "PLAYING");
  // Canciones pendientes en espera (status === 'PENDING')
  const pendingSongs = queue.filter((s) => s.status === "PENDING");

  // Controladores de reproducción
  const handleNext = async () => {
    setIsProcessing(true);
    try {
      await fetch("/api/jukebox/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "NEXT" }),
      });
      fetchQueue();
    } catch (err) {
      console.error("Error al pasar a siguiente canción:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaySong = async (songId: string) => {
    setIsProcessing(true);
    try {
      await fetch("/api/jukebox/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PLAY", songId }),
      });
      fetchQueue();
    } catch (err) {
      console.error("Error al reproducir canción:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    try {
      await fetch("/api/jukebox/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE", songId }),
      });
      fetchQueue();
    } catch (err) {
      console.error("Error al eliminar canción:", err);
    }
  };

  // Manejo de búsqueda en YouTube
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/jukebox/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudieron obtener resultados de YouTube.");
      }

      setSearchResults(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length === 0) {
        setSearchError("No se encontraron videos con ese término.");
      }
    } catch (err) {
      console.error("Error al buscar en YouTube:", err);
      setSearchError(
        err instanceof Error ? err.message : "Error al conectar con el servicio de búsqueda."
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Inyección directa del tema a la cola de reproducción
  const handleAddToQueue = async (song: YouTubeSongResult) => {
    setAddingSongId(song.id);
    setSearchError(null);

    try {
      const response = await fetch("/api/jukebox/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song: {
            id: song.id,
            title: song.title,
            artist: song.artist,
            thumbnail: song.thumbnail,
          },
          tableId: "admin",
          businessCode: businessCode || "demo",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al agregar la canción a la cola.");
      }

      await fetchQueue();
      setSuccessToast(`"${song.title}" añadida a la cola de espera`);
      setTimeout(() => setSuccessToast(null), 3500);
      setSearchResults((prev) => prev.filter((item) => item.id !== song.id));
    } catch (err) {
      console.error("Error al encolar tema:", err);
      setSearchError(
        err instanceof Error ? err.message : "No se pudo encolar la canción seleccionada."
      );
    } finally {
      setAddingSongId(null);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto text-zinc-100">
      {/* Título y Cabecera de la página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Radio size={26} className="text-orange-400" />
            <span>Jukebox Interactivo</span>
            <span className="text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              En Vivo
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Control de reproducción en el local y cola de temas pedidos por los clientes mediante código QR.
          </p>
        </div>
      </div>

      {/* Plan Pro Info Banner */}
      {businessPlan === "FREE" && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-orange-500/30 p-4 rounded-2xl flex items-center justify-between text-xs text-orange-200">
          <div className="flex items-center gap-2.5">
            <Crown size={18} className="text-orange-400 shrink-0" />
            <span>
              Estás utilizando la Rockola en modo de prueba. Con el <strong>Plan Pro</strong> tus clientes podrán pedir música ilimitada escaneando el código QR de sus mesas.
            </span>
          </div>
          <Link
            href="/client/planes"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shrink-0 ml-3 transition shadow-md shadow-orange-500/20"
          >
            Mejorar a Pro →
          </Link>
        </div>
      )}

      {/* SECCIÓN DE BÚSQUEDA Y AGREGADO RÁPIDO DE YOUTUBE */}
      <section className="bg-[#12151e] border border-white/[0.08] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-orange-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                Buscador de Canciones (YouTube)
              </h2>
            </div>
            {searchResults.length > 0 && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-xs text-zinc-400 hover:text-white transition-colors underline"
              >
                Limpiar resultados
              </button>
            )}
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por canción, artista o género..."
                className="w-full bg-zinc-950/80 border border-white/[0.08] focus:border-orange-500 text-white placeholder-zinc-500 text-xs sm:text-sm pl-9 pr-8 py-3 rounded-2xl outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-orange-500/20 active:scale-95"
            >
              {isSearching ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <span>Buscar Tema</span>
                  <Play size={14} fill="currentColor" />
                </>
              )}
            </button>
          </form>

          {/* Mensajes de Alerta / Error */}
          {searchError && (
            <div className="flex items-center gap-2 text-rose-300 bg-rose-500/10 border border-rose-500/25 text-xs px-4 py-3 rounded-xl animate-fade-in">
              <AlertCircle size={15} className="text-rose-400 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Toast de Éxito al Encolar */}
          {successToast && (
            <div className="flex items-center gap-2 text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 text-xs px-4 py-3 rounded-xl animate-fade-in">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Resultados de YouTube */}
          {searchResults.length > 0 && (
            <div className="mt-2 flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span>Resultados encontrados ({searchResults.length}):</span>
                <span className="text-[11px] text-zinc-500">Haz clic en &ldquo;+ Encolar&rdquo; para agregar a la lista</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((song) => {
                  const isBeingAdded = addingSongId === song.id;
                  return (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3 bg-zinc-950/80 border border-white/[0.06] hover:border-orange-500/40 rounded-2xl gap-3 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-14 h-14 rounded-xl object-cover border border-white/[0.06] shrink-0 shadow-md"
                        />
                        <div className="min-w-0 flex-1">
                          <h4
                            className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition-colors"
                            title={song.title}
                          >
                            {song.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400 truncate">{song.artist}</p>
                          <span className="text-[10px] text-zinc-500 font-mono">ID: {song.id}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToQueue(song)}
                        disabled={isBeingAdded}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-500/20"
                      >
                        {isBeingAdded ? (
                          <>
                            <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Encolando...</span>
                          </>
                        ) : (
                          <>
                            <Plus size={13} />
                            <span>Encolar</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interfaz principal (Reproductor y Cola de Espera) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Reproductor Principal (En Reproducción) */}
        <div className="bg-[#12151e] border border-white/[0.08] rounded-3xl p-6 flex flex-col gap-5 items-center text-center shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between w-full">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                currentSong
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  : "bg-zinc-800 text-zinc-400 border-white/[0.06]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${currentSong ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
              <span>{currentSong ? "En Reproducción" : "En Espera"}</span>
            </span>

            {currentSong && (
              <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                <Volume2 size={13} className="text-orange-400" />
                <span>Audio activo</span>
              </span>
            )}
          </div>

          {currentSong ? (
            <>
              {/* Reproductor Embebido de YouTube */}
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&enablejsapi=1`}
                  title={currentSong.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Portada y detalles del tema */}
              <div className="flex items-center gap-3.5 text-left w-full bg-zinc-950/80 p-3.5 rounded-2xl border border-white/[0.06]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentSong.thumbnailUrl}
                  alt={currentSong.title}
                  className="w-12 h-12 rounded-xl object-cover border border-white/[0.08] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate">{currentSong.title}</h3>
                  <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
                  <p className="text-[10px] text-orange-400 mt-0.5 font-semibold">
                    Pedida por:{" "}
                    <span className="text-zinc-200">
                      {currentSong.requestedBy?.nickname || "Administrador"}
                    </span>{" "}
                    ({currentSong.requestedBy?.tableId?.replace(/-/g, " ") || "Barra"})
                  </p>
                </div>
              </div>

              {/* Botones de Control de Reproducción */}
              <div className="w-full pt-1">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isProcessing}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95"
                >
                  <span>Siguiente Canción</span>
                  <SkipForward size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-zinc-500">
              <div className="w-20 h-20 rounded-full bg-zinc-950 border border-white/[0.08] flex items-center justify-center text-zinc-600">
                <Disc size={36} className="animate-spin duration-3000" />
              </div>
              <div>
                <p className="text-zinc-300 font-bold text-sm">No hay canciones sonando</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {pendingSongs.length > 0
                    ? 'Haz clic en "Reproducir" en una canción de la cola.'
                    : "Los pedidos de los clientes aparecerán automáticamente."}
                </p>
              </div>
              {pendingSongs.length > 0 && (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isProcessing}
                  className="mt-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-orange-500/20"
                >
                  Iniciar Reproducción
                </button>
              )}
            </div>
          )}
        </div>

        {/* Columna Derecha: Cola de Solicitudes */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#12151e] border border-white/[0.08] rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Music size={16} className="text-orange-400" />
                  <span>Cola de Espera</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Temas solicitados por clientes desde sus mesas
                </p>
              </div>
              <span className="text-xs text-orange-400 font-bold bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                {pendingSongs.length} en cola
              </span>
            </div>

            {isLoading ? (
              <p className="text-zinc-500 text-xs text-center py-8">Cargando cola de reproducción...</p>
            ) : pendingSongs.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 flex flex-col items-center gap-2">
                <Music size={28} className="text-zinc-600 mb-1" />
                <p className="text-sm font-semibold text-zinc-300">La cola de espera está vacía.</p>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Usa el buscador de arriba para agregar temas o espera las solicitudes de los clientes desde sus mesas QR.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                {pendingSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3.5 bg-zinc-950/70 border border-white/[0.06] hover:border-white/[0.12] rounded-2xl transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/[0.08] flex items-center justify-center font-black text-zinc-400 text-xs shrink-0">
                        #{index + 1}
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={song.thumbnailUrl}
                        alt={song.title}
                        className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/[0.06]"
                      />
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-white truncate">{song.title}</h3>
                        <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-[10px] bg-zinc-900 text-orange-400 px-2.5 py-1 rounded-full font-semibold border border-white/[0.08]">
                        {song.requestedBy?.tableId?.replace(/-/g, " ") || "Admin"} ({song.requestedBy?.nickname || "Barra"})
                      </span>

                      <button
                        type="button"
                        onClick={() => handlePlaySong(song.id)}
                        disabled={isProcessing}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                      >
                        <Play size={12} fill="currentColor" />
                        <span>Sonar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSong(song.id)}
                        className="bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-white/[0.08] p-1.5 rounded-xl transition-all"
                        title="Eliminar de la cola"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
