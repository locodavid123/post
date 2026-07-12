"use client";

import React, { useState } from "react";

interface Table {
  id: number;
  number: number;
  capacity: number;
  status: "free" | "occupied";
  waiter?: string;
  comment?: string;
  guestCount?: number;
}

const INITIAL_TABLES: Table[] = [
  { id: 1, number: 1, capacity: 4, status: "occupied", waiter: "Juan M.", guestCount: 3 },
  { id: 2, number: 2, capacity: 2, status: "free" },
  { id: 3, number: 3, capacity: 6, status: "free" },
  { id: 4, number: 4, capacity: 4, status: "free" },
  { id: 5, number: 5, capacity: 4, status: "free" },
  { id: 6, number: 6, capacity: 4, status: "occupied", waiter: "Sofia G.", guestCount: 1 },
];

const WAITER_OPTIONS = ["Juan M.", "Sofia G.", "Pedro P.", "María R."];

export default function MesasPage() {
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [activeTableId, setActiveTableId] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // Add modal state
  const [newCapacity, setNewCapacity] = useState(4);

  // Side panel state
  const [guestCount, setGuestCount] = useState(1);
  const [selectedWaiter, setSelectedWaiter] = useState("");
  const [comment, setComment] = useState("");

  const currentTable = tables.find((t) => t.id === activeTableId) ?? tables[0];
  const occupiedCount = tables.filter((t) => t.status === "occupied").length;

  // --- Actions ---
  const handleSelectTable = (id: number) => {
    const t = tables.find((x) => x.id === id);
    setActiveTableId(id);
    setGuestCount(t?.guestCount ?? 1);
    setSelectedWaiter(t?.waiter ?? "");
    setComment(t?.comment ?? "");
  };

  const handleOpenTable = () => {
    if (!selectedWaiter) return;
    setTables((prev) =>
      prev.map((t) =>
        t.id === activeTableId
          ? { ...t, status: "occupied", waiter: selectedWaiter, guestCount, comment }
          : t
      )
    );
  };

  const handleCloseTable = () => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === activeTableId
          ? { ...t, status: "free", waiter: undefined, guestCount: undefined, comment: undefined }
          : t
      )
    );
    setSelectedWaiter("");
    setGuestCount(1);
    setComment("");
  };

  const handleAddTable = () => {
    const maxNumber = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) : 0;
    const maxId = tables.length > 0 ? Math.max(...tables.map((t) => t.id)) : 0;
    const newTable: Table = {
      id: maxId + 1,
      number: maxNumber + 1,
      capacity: newCapacity,
      status: "free",
    };
    setTables((prev) => [...prev, newTable]);
    setActiveTableId(newTable.id);
    setNewCapacity(4);
    setShowAddModal(false);
  };

  const handleDeleteTable = (id: number) => {
    const remaining = tables.filter((t) => t.id !== id);
    setTables(remaining);
    if (activeTableId === id) {
      setActiveTableId(remaining[0]?.id ?? 0);
    }
    setShowDeleteConfirm(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">

      {/* ─── Top Tab Bar ─── */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["Mesas", "Mostrador", "Domicilio +", "Mostrador express"].map((tab, i) => (
              <button
                key={tab}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  i === 0
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-xs uppercase tracking-wide text-zinc-400">
              Salón
            </span>
            <span className="rounded-full bg-zinc-700 px-3 py-1.5 text-xs font-bold text-white">
              {occupiedCount}/{tables.length}
            </span>
          </div>
        </div>
      </section>

      {/* ─── Main Grid ─── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">

        {/* ─── Table Grid ─── */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Mesas del Salón</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {occupiedCount} ocupadas · {tables.length - occupiedCount} disponibles
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition shadow-lg shadow-orange-500/20"
            >
              <span className="text-lg leading-none">＋</span>
              Agregar Mesa
            </button>
          </div>

          {/* Grid */}
          {tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600 gap-3">
              <span className="text-5xl">🪑</span>
              <p className="text-sm font-medium">No hay mesas configuradas</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-2 hover:bg-orange-500/20 transition"
              >
                Agregar primera mesa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {tables.map((table) => (
                <div key={table.id} className="relative group">
                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(table.id); }}
                    title="Eliminar mesa"
                    className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                  >
                    ×
                  </button>

                  {/* Table button */}
                  <button
                    onClick={() => handleSelectTable(table.id)}
                    className={`w-full aspect-square rounded-2xl border-2 text-xl font-bold transition-all ${
                      activeTableId === table.id
                        ? "border-orange-500 ring-2 ring-orange-500/30 bg-emerald-500 text-white scale-105 shadow-lg"
                        : table.status === "occupied"
                        ? "border-orange-500/60 bg-orange-500/15 text-orange-300 hover:border-orange-500"
                        : "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    {table.number}
                  </button>

                  {/* Status dot */}
                  <div className={`mt-1.5 mx-auto w-1.5 h-1.5 rounded-full ${
                    table.status === "occupied" ? "bg-orange-500" : "bg-emerald-500"
                  }`} />
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-5 mt-6 pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/60" />
              Disponible
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-3 h-3 rounded-full bg-orange-500/30 border border-orange-500/60" />
              Ocupada
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              Seleccionada
            </div>
          </div>
        </section>

        {/* ─── Side Panel ─── */}
        {currentTable && (
          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur flex flex-col gap-5">
            {/* Mesa Header */}
            <div className={`rounded-xl px-5 py-4 ${
              currentTable.status === "occupied"
                ? "bg-orange-500/20 border border-orange-500/30"
                : "bg-emerald-500 shadow-lg shadow-emerald-500/20"
            }`}>
              <p className={`text-xs uppercase tracking-widest font-semibold ${
                currentTable.status === "occupied" ? "text-orange-300" : "text-emerald-950/70"
              }`}>
                MESA
              </p>
              <h2 className={`mt-1 text-4xl font-bold ${
                currentTable.status === "occupied" ? "text-orange-300" : "text-emerald-950"
              }`}>
                {currentTable.number}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-semibold ${
                  currentTable.status === "occupied" ? "text-orange-400" : "text-emerald-900/70"
                }`}>
                  {currentTable.status === "occupied" ? "● Ocupada" : "● Disponible"}
                </span>
                <span className={`text-xs ${
                  currentTable.status === "occupied" ? "text-orange-500/60" : "text-emerald-900/50"
                }`}>
                  · Cap. {currentTable.capacity}
                </span>
              </div>
            </div>

            {/* Personas */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Personas</label>
              <div className="inline-flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2">
                <button
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition"
                >
                  −
                </button>
                <span className="min-w-8 text-center text-lg font-bold text-white">{guestCount}</span>
                <button
                  onClick={() => setGuestCount(Math.min(currentTable.capacity, guestCount + 1))}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition"
                >
                  +
                </button>
              </div>
              <p className="text-[10px] text-zinc-600">Máx. {currentTable.capacity} personas</p>
            </div>

            {/* Mesero */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Mesero</label>
              <select
                value={selectedWaiter}
                onChange={(e) => setSelectedWaiter(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
              >
                <option value="">Seleccionar mesero</option>
                {WAITER_OPTIONS.map((w) => (
                  <option key={w} value={w} className="bg-zinc-950">{w}</option>
                ))}
              </select>
            </div>

            {/* Comentario */}
            <div className="space-y-2 flex-1">
              <label className="text-sm font-semibold text-white">Comentario</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Ej: alergia al maní, cumpleaños…"
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {currentTable.status === "free" ? (
                <button
                  onClick={handleOpenTable}
                  disabled={!selectedWaiter}
                  className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-white transition shadow-lg shadow-orange-500/20"
                >
                  Abrir mesa
                </button>
              ) : (
                <button
                  onClick={handleCloseTable}
                  className="w-full rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/30 text-rose-400 px-4 py-3 text-sm font-semibold transition"
                >
                  Cerrar mesa
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(currentTable.id)}
                className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-4 py-2.5 text-xs font-semibold transition"
              >
                Eliminar mesa {currentTable.number}
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ─── Add Table Modal ─── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-1">Agregar Mesa</h3>
            <p className="text-xs text-zinc-500 mb-6">
              Se agregará como Mesa #{tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-white block mb-2">Capacidad</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNewCapacity(Math.max(1, newCapacity - 1))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-2xl font-bold text-white">{newCapacity}</span>
                  <button
                    onClick={() => setNewCapacity(Math.min(20, newCapacity + 1))}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition"
                  >
                    +
                  </button>
                </div>
                <p className="text-[11px] text-zinc-600 text-center mt-1">personas máximo</p>
              </div>

              {/* Quick presets */}
              <div>
                <p className="text-xs text-zinc-500 mb-2">Presets rápidos</p>
                <div className="flex gap-2 flex-wrap">
                  {[2, 4, 6, 8, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNewCapacity(n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        newCapacity === n
                          ? "bg-orange-500 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {n} personas
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 text-sm font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddTable}
                className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-3 text-sm font-semibold transition shadow-lg shadow-orange-500/20"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─── */}
      {showDeleteConfirm !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg">
                ⚠
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Eliminar mesa</h3>
                <p className="text-xs text-zinc-500">
                  Mesa #{tables.find((t) => t.id === showDeleteConfirm)?.number}
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mb-6">
              ¿Estás seguro? Esta acción no se puede deshacer.
              {tables.find((t) => t.id === showDeleteConfirm)?.status === "occupied" && (
                <span className="block mt-2 text-orange-400 font-semibold text-xs">
                  ⚠ Esta mesa está actualmente ocupada.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 text-sm font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteTable(showDeleteConfirm)}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-3 text-sm font-semibold transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
