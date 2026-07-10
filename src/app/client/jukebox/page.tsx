import React from "react";

interface SongRequest {
  id: number;
  title: string;
  artist: string;
  table: string;
  votes: number;
  duration: string;
}

const jukeboxQueue: SongRequest[] = [
  { id: 1, title: "Bohemian Rhapsody", artist: "Queen", table: "Mesa 2", votes: 8, duration: "5:55" },
  { id: 2, title: "Hotel California", artist: "Eagles", table: "Mesa 7", votes: 5, duration: "6:30" },
  { id: 3, title: "Stairway to Heaven", artist: "Led Zeppelin", table: "Mesa 11", votes: 3, duration: "8:02" },
  { id: 4, title: "Wonderwall", artist: "Oasis", table: "Mesa 5", votes: 2, duration: "4:18" },
];

export default function JukeboxPage() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Administración de Jukebox</h2>
        <p className="text-sm text-zinc-400">Control de reproducción, aprobación de temas y cola de música votada por tus comensales.</p>
      </div>

      {/* Main Jukebox Interface Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Now Playing (Player) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            En Reproducción
          </span>

          {/* Vinyl Mockup */}
          <div className="relative w-44 h-44 rounded-full bg-zinc-950 border-4 border-zinc-800 flex items-center justify-center shadow-2xl shadow-orange-950/20 animate-spin [animation-duration:15s]">
            <div className="w-16 h-16 rounded-full bg-orange-500 border-4 border-zinc-905 flex items-center justify-center text-zinc-900 font-bold text-xs">
              EcoPost
            </div>
            <div className="absolute w-2 h-2 rounded-full bg-zinc-950"></div>
          </div>

          {/* Track Details */}
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold text-white">Sweet Child O' Mine</h3>
            <p className="text-sm text-zinc-400">Guns N' Roses</p>
            <p className="text-xs text-zinc-500 mt-2">Pedida por: <span className="font-semibold text-zinc-300">Mesa 4</span></p>
          </div>

          {/* Progress bar */}
          <div className="w-full flex flex-col gap-1.5 mt-2">
            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-orange-500 rounded-full"></div>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 font-semibold">
              <span>2:15</span>
              <span>5:56</span>
            </div>
          </div>

          {/* Audio Player Controls */}
          <div className="flex items-center gap-6">
            <button className="text-zinc-500 hover:text-white transition-all text-xl">⏮</button>
            <button className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-bold text-xl transition-all shadow-lg shadow-orange-500/20">
              ⏸
            </button>
            <button className="text-zinc-500 hover:text-white transition-all text-xl">⏭</button>
          </div>
        </div>

        {/* Right Columns: Requests Queue */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Queue container */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white">Cola de Reproducción</h3>
              <span className="text-xs text-zinc-400 font-semibold">{jukeboxQueue.length} temas en cola</span>
            </div>

            <div className="flex flex-col gap-3">
              {jukeboxQueue.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Index or Icon */}
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center font-bold text-zinc-400 text-xs">
                      #{song.id}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{song.title}</h4>
                      <p className="text-xs text-zinc-500">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Source and stats */}
                    <div className="text-right">
                      <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full font-semibold border border-orange-500/20">
                        {song.table}
                      </span>
                      <p className="text-[10px] text-zinc-500 mt-1 font-semibold">{song.votes} votos</p>
                    </div>
                    
                    <span className="text-xs text-zinc-500 font-medium">{song.duration}</span>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <button className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 p-2 rounded-lg text-xs text-zinc-400 hover:text-white transition-all">
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
