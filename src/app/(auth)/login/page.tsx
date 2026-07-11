"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.07fr_1fr] xl:grid-cols-[1.1fr_1fr]">
        <section className="rounded-[32px] border border-zinc-800 bg-[#101b2f]/80 p-10 shadow-[0_40px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="mb-10 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">EcoPost</h1>
              <p className="text-sm text-zinc-400">Sistema POS</p>
            </div>
            <div className="h-4 w-4 rounded-full bg-orange-500" />
          </div>

          <div className="space-y-4 rounded-3xl border border-zinc-800 bg-[#0f1720] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <p className="text-base font-semibold text-orange-400">Ingresa a tu cuenta</p>

            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
              Usuario
              <input
                type="text"
                placeholder="Ingresa tu usuario"
                className="rounded-2xl border border-zinc-800 bg-[#0f1720] px-4 py-3 text-white outline-none transition focus:border-orange-500"
              />
            </label>

            <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Contraseña
              <div className="mt-2 relative rounded-2xl border border-zinc-800 bg-[#0f1720] focus-within:border-orange-500">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-2xl bg-transparent px-4 py-3 pr-14 text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-zinc-900/80 px-3 py-2 text-xs text-zinc-300 transition hover:bg-zinc-800"
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-xs text-zinc-500">
              <button type="button" className="font-semibold text-zinc-300 hover:text-white">
                ¿Olvidaste tu contraseña?
              </button>
              <span className="rounded-full bg-zinc-900 px-3 py-1 text-zinc-400">PRO</span>
            </div>

            <Link
              href="/client"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              INGRESAR
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-500">
            ¿Nuevo en EcoPost?{' '}
            <Link href="/register" className="font-semibold text-orange-400 hover:text-orange-300">
              Regístrate aquí.
            </Link>
          </p>
        </section>

        <section className="relative overflow-hidden rounded-[32px] border border-zinc-800 bg-[#111b2f] p-10 text-white shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10 space-y-6">
            <p className="text-3xl font-bold text-orange-400">¡Recomienda EcoPost y gana!</p>
            <p className="max-w-xl text-sm text-zinc-400">
              Comparte tu código con otros negocios gastronómicos que aún no usan EcoPost y gana beneficios exclusivos.
            </p>

            <div className="rounded-[24px] border border-zinc-800 bg-[#0f1720]/70 p-5">
              <div className="mb-4 flex items-center justify-between rounded-2xl bg-zinc-900/70 px-4 py-3 text-sm text-zinc-300">
                <span>09:28</span>
                <span className="rounded-full bg-orange-500/20 px-3 py-1 text-orange-300">PRO</span>
                <span>admin</span>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-[#111b2f] p-5">
                <div className="mb-4 text-sm text-zinc-400">Tu código promocional:</div>
                <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <span className="break-all text-sm font-semibold text-white">ECOPOST.USUARIO_EP</span>
                  <div className="flex items-center justify-between gap-3">
                    <button className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white">Refiere</button>
                    <button className="rounded-full border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:border-orange-500 hover:text-white">
                      Copiar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
