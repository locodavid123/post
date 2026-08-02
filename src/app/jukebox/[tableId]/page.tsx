"use client";

import React, { useState, useEffect } from 'react';
import type { SongRequest as PrismaSongRequest, TableSession } from '@prisma/client';

// Interfaz para los resultados de búsqueda de YouTube
interface Song {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
}

// Tipo extendido para la cola, que incluye los datos de la sesión de la mesa
type SongRequestWithRelations = PrismaSongRequest & { requestedBy: TableSession };

// En Next.js 14, params se recibe directamente como objeto (no es una Promise)
export default function UserJukeboxPage({ params }: { params: { tableId: string } }) {
    const { tableId } = params;

    const [nickname, setNickname] = useState<string | null>(null);
    const [nicknameInput, setNicknameInput] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [songQueue, setSongQueue] = useState<SongRequestWithRelations[]>([]);

    // Obtiene la cola de canciones desde la API
    const fetchQueue = async () => {
        try {
            const response = await fetch('/api/jukebox/queue');
            if (!response.ok) throw new Error('Error al obtener la cola');
            const queueData = await response.json();
            setSongQueue(queueData);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (nicknameInput.trim() === '') {
            alert('Por favor, ingresa un nickname.');
            return;
        }
        try {
            const response = await fetch('/api/jukebox/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableId, nickname: nicknameInput }),
            });
            if (!response.ok) throw new Error('No se pudo registrar el nickname.');
            setNickname(nicknameInput);
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : 'Error desconocido');
        }
    };

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/jukebox/search?q=${encodeURIComponent(searchQuery)}`);
            const results = await response.json();
            setSearchResults(results);
        } catch (error) {
            console.error("Error al buscar:", error);
            alert("Hubo un error al realizar la búsqueda.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestSong = async (song: Song) => {
        try {
            const response = await fetch('/api/jukebox/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ song, tableId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'No se pudo pedir la canción.');
            }

            alert(`¡"${song.title}" ha sido añadida a la cola!`);
            setSearchResults([]);
            fetchQueue();
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : 'Error desconocido');
        }
    };

    // Pantalla de bienvenida / registro de nickname
    if (!nickname) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
                <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center w-full max-w-sm shadow-2xl shadow-orange-950/20">
                    <h1 className="text-2xl font-bold mb-2">¡Bienvenido a la Jukebox de EcoPost!</h1>
                    <p className="text-zinc-400 mb-6">
                        Estás en la <span className="font-bold text-orange-400 capitalize">{decodeURIComponent(tableId).replace(/-/g, ' ')}</span>.
                    </p>
                    <form onSubmit={handleRegister} className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={nicknameInput}
                            onChange={(e) => setNicknameInput(e.target.value)}
                            placeholder="Crea tu nickname"
                            className="bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm text-center px-4 py-3 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                        />
                        <button
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all"
                        >
                            Entrar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Interfaz principal del usuario
    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {/* Cabecera */}
                <div>
                    <h1 className="text-3xl font-bold text-white">¡Hola, {nickname}!</h1>
                    <p className="text-orange-400 font-semibold capitalize">
                        Estás pidiendo desde la {decodeURIComponent(tableId).replace(/-/g, ' ')}
                    </p>
                </div>

                {/* Buscador de Canciones */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4">Busca y pide tu canción</h2>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Nombre de la canción o artista..."
                            className="flex-grow bg-zinc-950 border border-zinc-800 text-zinc-100 px-4 py-2 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                        />
                        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-xl transition-all">
                            {isLoading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </form>

                    {/* Resultados de Búsqueda */}
                    {searchResults.length > 0 && (
                        <div className="mt-4 flex flex-col gap-2">
                            {searchResults.map((song) => (
                                <div key={song.id} className="flex justify-between items-center p-3 bg-zinc-950 rounded-lg gap-4">
                                    <div className="flex items-center gap-4">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={song.thumbnail} alt={song.title} className="w-12 h-12 rounded-md" />
                                        <div>
                                            <p className="font-semibold text-sm">{song.title}</p>
                                            <p className="text-xs text-zinc-400">{song.artist}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRequestSong(song)}
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full shrink-0"
                                    >
                                        Pedir
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cola de Reproducción */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4">Cola de reproducción ({songQueue.length})</h2>
                    {songQueue.length === 0 ? (
                        <p className="text-zinc-500 text-sm text-center py-4">La cola está vacía. ¡Sé el primero en pedir una canción!</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {songQueue.map((song, index) => (
                                <div
                                    key={song.id}
                                    className={`flex items-center gap-4 p-3 rounded-lg ${
                                        song.requestedBy?.tableId === tableId
                                            ? 'bg-orange-500/10 border border-orange-500/20'
                                            : 'bg-zinc-950'
                                    }`}
                                >
                                    <span className="font-bold text-zinc-500 w-6 shrink-0">#{index + 1}</span>
                                    <div className="min-w-0">
                                        <p className="font-semibold truncate">{song.title}</p>
                                        <p className="text-sm text-zinc-400">
                                            {song.artist}{' '}
                                            <span className="text-zinc-500">
                                                (pedido por {song.requestedBy?.nickname ?? 'Alguien'})
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
