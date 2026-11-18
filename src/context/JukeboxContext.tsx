"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { SongRequest as PrismaSongRequest, TableSession } from "@prisma/client";

export type SongRequestWithRelations = PrismaSongRequest & {
  requestedBy: TableSession;
};

interface JukeboxContextType {
  queue: SongRequestWithRelations[];
  currentSong: SongRequestWithRelations | undefined;
  pendingSongs: SongRequestWithRelations[];
  isLoading: boolean;
  isProcessing: boolean;
  businessCode: string;
  businessPlan: string;
  fetchQueue: () => Promise<void>;
  handleNext: () => Promise<void>;
  handlePlaySong: (songId: string) => Promise<void>;
  handleDeleteSong: (songId: string) => Promise<void>;
  isPlayerExpanded: boolean;
  setIsPlayerExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const JukeboxContext = createContext<JukeboxContextType | undefined>(undefined);

export function JukeboxProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<SongRequestWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [businessCode, setBusinessCode] = useState<string>("demo");
  const [businessPlan, setBusinessPlan] = useState<string>("FREE");
  const [isPlayerExpanded, setIsPlayerExpanded] = useState<boolean>(true);

  // Obtener negocio del usuario autenticado
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.business) {
          setBusinessCode(data.user.business.code || data.user.business.id || data.user.businessId || "demo");
          setBusinessPlan(data.user.business.plan || "FREE");
        } else if (data?.user?.businessId) {
          setBusinessCode(data.user.businessId);
        }
      })
      .catch(() => {});
  }, []);

  // Carga la cola desde el servidor
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`/api/jukebox/queue?businessCode=${encodeURIComponent(businessCode)}`);
      if (res.ok) {
        const data = await res.json();
        setQueue(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error al obtener la cola del Jukebox:", err);
    } finally {
      setIsLoading(false);
    }
  }, [businessCode]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3500);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  // Canción actualmente en reproducción (status === 'PLAYING')
  const currentSong = queue.find((s) => s.status === "PLAYING");
  // Canciones pendientes en espera (status === 'PENDING')
  const pendingSongs = queue.filter((s) => s.status === "PENDING");

  // Controladores de reproducción
  const handleNext = useCallback(async () => {
    setIsProcessing(true);
    try {
      await fetch("/api/jukebox/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "NEXT" }),
      });
      await fetchQueue();
    } catch (err) {
      console.error("Error al pasar a siguiente canción:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [fetchQueue]);

  const handlePlaySong = useCallback(async (songId: string) => {
    setIsProcessing(true);
    try {
      await fetch("/api/jukebox/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PLAY", songId }),
      });
      await fetchQueue();
    } catch (err) {
      console.error("Error al reproducir canción:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [fetchQueue]);

  const handleDeleteSong = useCallback(async (songId: string) => {
    try {
      await fetch("/api/jukebox/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE", songId }),
      });
      await fetchQueue();
    } catch (err) {
      console.error("Error al eliminar canción:", err);
    }
  }, [fetchQueue]);

  // Detección automática de fin de canción mediante YouTube postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && data.event === "infoDelivery" && data.info && data.info.playerState === 0) {
          // playerState === 0 significa YT.PlayerState.ENDED
          handleNext();
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleNext]);

  return (
    <JukeboxContext.Provider
      value={{
        queue,
        currentSong,
        pendingSongs,
        isLoading,
        isProcessing,
        businessCode,
        businessPlan,
        fetchQueue,
        handleNext,
        handlePlaySong,
        handleDeleteSong,
        isPlayerExpanded,
        setIsPlayerExpanded,
      }}
    >
      {children}
    </JukeboxContext.Provider>
  );
}

export function useJukebox() {
  const context = useContext(JukeboxContext);
  if (!context) {
    throw new Error("useJukebox debe usarse dentro de un JukeboxProvider");
  }
  return context;
}
