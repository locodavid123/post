"use client";

import React, { useState } from "react";

interface Table {
  number: number;
  capacity: number;
  status: "free" | "occupied";
  waiter?: string;
  orderCount?: number;
}

const tables: Table[] = [
  { number: 1, capacity: 4, status: "occupied", waiter: "Juan M.", orderCount: 3 },
  { number: 2, capacity: 2, status: "free" },
  { number: 3, capacity: 6, status: "free" },
  { number: 4, capacity: 4, status: "free" },
  { number: 5, capacity: 4, status: "free" },
  { number: 6, capacity: 4, status: "free" },
  { number: 7, capacity: 4, status: "free" },
  { number: 8, capacity: 4, status: "free" },
  { number: 9, capacity: 4, status: "free" },
  { number: 10, capacity: 4, status: "free" },
  { number: 11, capacity: 4, status: "free" },
  { number: 12, capacity: 4, status: "occupied", waiter: "Sofia G.", orderCount: 1 },
];

const waiterOptions = ["Juan M.", "Sofia G.", "Pedro P."];

export default function MesasPage() {
  const [activeTable, setActiveTable] = useState(1);
  const [guestCount, setGuestCount] = useState(1);
  const [selectedWaiter, setSelectedWaiter] = useState("");
  const [comment, setComment] = useState("");

  const currentTable = tables.find((table) => table.number === activeTable) ?? tables[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
      <div className="space-y-6">
        <section className="rounded-4xl border border-zinc-800 bg-zinc-950/90 p-5 shadow-black/10 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Mesas", active: true },
                { label: "Mostrador", active: false },
                { label: "Domicilio +", active: false },
                { label: "Mostrador express", active: false },
              ].map((tab) => (
                <button
                  key={tab.label}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    tab.active
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs uppercase tracking-wide text-zinc-400">
                Salón
              </span>
              <span className="rounded-full bg-zinc-800 px-4 py-2 text-xs uppercase tracking-wide text-white">
                1
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-4xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-black/10 shadow-xl">
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1fr]">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                {tables.slice(0, 4).map((table) => (
                  <button
                    key={table.number}
                    onClick={() => setActiveTable(table.number)}
                    className={`aspect-square rounded-full border-2 text-xl font-bold transition ${
                      activeTable === table.number
                        ? "border-orange-500 bg-emerald-500 text-white shadow-[0_0_0_10px_rgba(16,185,129,0.08)]"
                        : table.status === "occupied"
                        ? "border-orange-500 bg-orange-500/20 text-orange-300"
                        : "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {table.number}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {tables.slice(4).map((table) => (
                  <button
                    key={table.number}
                    onClick={() => setActiveTable(table.number)}
                    className={`aspect-square rounded-3xl border text-xl font-bold transition ${
                      activeTable === table.number
                        ? "border-orange-500 bg-emerald-500 text-white shadow-[0_0_0_10px_rgba(16,185,129,0.08)]"
                        : table.status === "occupied"
                        ? "border-orange-500 bg-orange-500/20 text-orange-300"
                        : "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {table.number}
                  </button>
                ))}
              </div>
            </div>

            <aside className="rounded-4xl border border-zinc-800 bg-zinc-950/90 p-5">
              <div className="rounded-3xl bg-emerald-500 px-6 py-5 text-emerald-950">
                <p className="text-xs uppercase tracking-wide text-emerald-950/80">MESA</p>
                <h2 className="mt-3 text-3xl font-bold">{currentTable.number}</h2>
              </div>

              <div className="mt-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Personas</label>
                  <div className="inline-flex items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-900 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      className="rounded-full bg-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700"
                    >
                      -
                    </button>
                    <span className="min-w-8 text-center text-lg font-semibold text-white">{guestCount}</span>
                    <button
                      type="button"
                      onClick={() => setGuestCount(guestCount + 1)}
                      className="rounded-full bg-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Mesero</label>
                  <select
                    value={selectedWaiter}
                    onChange={(event) => setSelectedWaiter(event.target.value)}
                    className="w-full rounded-3xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
                  >
                    <option value="">Seleccionar</option>
                    {waiterOptions.map((waiter) => (
                      <option key={waiter} value={waiter} className="bg-zinc-950 text-white">
                        {waiter}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Comentario</label>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={6}
                    placeholder="Escribe un comentario"
                    className="w-full resize-none rounded-3xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500"
                  />
                </div>

                <button className="w-full rounded-3xl bg-orange-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-orange-600">
                  Abrir mesa
                </button>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
