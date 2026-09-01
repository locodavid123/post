"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { SongRequest as PrismaSongRequest, TableSession } from "@prisma/client";

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
      const res = await fetch("/api/jukebox/queue");
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
    } catch (err) {
      console.error("Error al obtener la cola:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al agregar la canción a la cola.");
      }

      // Actualizar la cola inmediatamente
      await fetchQueue();

      // Notificación de éxito
      setSuccessToast(`"${song.title}" añadida a la cola de espera`);
      setTimeout(() => setSuccessToast(null), 3500);

      // Opcional: remover de la lista local de resultados para evitar duplicación accidental
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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-white">
      {/* Título y Cabecera de la página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Administración de Jukebox</span>
            <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full font-semibold">
              Admin
            </span>
          </h1>
          <p className="text-sm text-zinc-400">
            Control en tiempo real de reproducción y cola de temas pedidos por tus comensales y el personal.
          </p>
        </div>
      </div>

      {/* SECCIÓN DE BÚSQUEDA Y AGREGADO RÁPIDO DE YOUTUBE */}
      <section className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔍</span>
              <h2 className="text-base font-bold text-white tracking-wide">
                Buscador de Canciones (YouTube)
              </h2>
            </div>
            {searchResults.length > 0 && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors underline"
              >
                Limpiar resultados
              </button>
            )}
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por canción, artista o género en YouTube..."
                className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-orange-500 text-white placeholder-zinc-500 text-sm px-4 py-3 rounded-2xl outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-orange-950/30"
            >
              {isSearching ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <span>Buscar Tema</span>
                  <span>▶</span>
                </>
              )}
            </button>
          </form>

          {/* Mensajes de Alerta / Error */}
          {searchError && (
            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 text-xs px-4 py-3 rounded-xl">
              <span>⚠️</span>
              <span>{searchError}</span>
            </div>
          )}

          {/* Toast de Éxito al Encolar */}
          {successToast && (
            <div className="flex items-center gap-2 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 text-xs px-4 py-3 rounded-xl animate-fade-in">
              <span>✅</span>
              <span>{successToast}</span>
            </div>
          )}

          {/* Desplegable / Lista de Resultados de YouTube */}
          {searchResults.length > 0 && (
            <div className="mt-2 flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span>Resultados encontrados ({searchResults.length}):</span>
                <span className="text-[11px] text-zinc-500">Haz clic en &ldquo;+ Encolar&rdquo; para agregar directamente</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((song) => {
                  const isBeingAdded = addingSongId === song.id;
                  return (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3 bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl gap-3 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-14 h-14 rounded-xl object-cover border border-zinc-800 shrink-0 shadow"
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
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-950/40"
                      >
                        {isBeingAdded ? (
                          <>
                            <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Encolando...</span>
                          </>
                        ) : (
                          <>
                            <span>+ Encolar</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Reproductor Principal (En Reproducción) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 items-center text-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              {currentSong ? "En Reproducción" : "En Espera"}
            </span>
          </div>

          {currentSong ? (
            <>
              {/* Reproductor Embebido de YouTube */}
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&enablejsapi=1`}
                  title={currentSong.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Vinilo Animado / Portada */}
              <div className="flex items-center gap-4 text-left w-full bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentSong.thumbnailUrl}
                  alt={currentSong.title}
                  className="w-14 h-14 rounded-lg object-cover border border-zinc-800 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-white truncate">{currentSong.title}</h2>
                  <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
                  <p className="text-[11px] text-orange-400 mt-1 font-medium">
                    Pedida por:{" "}
                    <span className="font-semibold">
                      {currentSong.requestedBy?.nickname || "Administrador"}
                    </span>{" "}
                    ({currentSong.requestedBy?.tableId?.replace(/-/g, " ") || "Barra"})
                  </p>
                </div>
              </div>

              {/* Botones de Control de Reproducción */}
              <div className="flex items-center justify-center gap-4 w-full pt-2">
                <button
                  onClick={handleNext}
                  disabled={isProcessing}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40"
                >
                  <span>Siguiente Canción</span>
                  <span>⏭</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-zinc-500">
              <div className="w-24 h-24 rounded-full bg-zinc-950 border-4 border-zinc-800 flex items-center justify-center text-zinc-700 font-bold text-3xl shadow-inner">
                🎵
              </div>
              <div>
                <p className="text-zinc-300 font-semibold">No hay ninguna canción sonando</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {pendingSongs.length > 0
                    ? 'Haz clic en "Reproducir" en una canción de la cola.'
                    : "Los pedidos de los clientes y del admin aparecerán aquí."}
                </p>
              </div>
              {pendingSongs.length > 0 && (
                <button
                  onClick={handleNext}
                  disabled={isProcessing}
                  className="mt-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all"
                >
                  Iniciar Cola (Reproducción Automática)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Columna Derecha: Cola de Solicitudes */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white">Cola de Espera</h2>
                <p className="text-xs text-zinc-400">Canciones pedidas por clientes y administrador pendientes de sonar</p>
              </div>
              <span className="text-xs text-orange-400 font-semibold bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                {pendingSongs.length} en cola
              </span>
            </div>

            {isLoading ? (
              <p className="text-zinc-500 text-sm text-center py-8">Cargando cola de reproducción...</p>
            ) : pendingSongs.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 flex flex-col items-center gap-2">
                <span className="text-3xl">☕</span>
                <p className="text-sm font-medium">La cola de espera está vacía.</p>
                <p className="text-xs text-zinc-600">
                  Usa el buscador de arriba para agregar temas o espera las solicitudes de los clientes desde los QR.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl transition-all gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-xs shrink-0">
                        #{index + 1}
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={song.thumbnailUrl}
                        alt={song.title}
                        className="w-12 h-12 rounded-md object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{song.title}</h3>
                        <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] bg-zinc-900 text-orange-400 px-2.5 py-1 rounded-full font-semibold border border-zinc-800">
                        {song.requestedBy?.tableId?.replace(/-/g, " ") || "Admin"} ({song.requestedBy?.nickname || "Barra"})
                      </span>

                      <button
                        onClick={() => handlePlaySong(song.id)}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        ▶ Reproducir
                      </button>

                      <button
                        onClick={() => handleDeleteSong(song.id)}
                        className="bg-zinc-900 hover:bg-red-950/40 hover:text-red-400 border border-zinc-800 p-2 rounded-lg text-xs text-zinc-400 transition-all"
                        title="Eliminar de la cola"
                      >
                        🗑
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
