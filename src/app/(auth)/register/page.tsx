"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-[#08101d] px-6 py-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 xl:grid-cols-[1.2fr_0.9fr]">
        <section className="rounded-4xl border border-zinc-800 bg-[#101b2f]/80 p-10 shadow-[0_40px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="mb-10 space-y-6">
            <span className="text-sm uppercase tracking-[0.32em] text-zinc-500">EcoPost</span>
            <h1 className="max-w-3xl text-5xl font-bold leading-tight text-white sm:text-6xl">
              Transforma tu negocio gastronómico <span className="text-orange-400">con EcoPost</span>
            </h1>
            <p className="max-w-2xl text-base text-zinc-400 sm:text-lg">
              Software para restaurantes, bares y cafeterías. Controla mesas, ventas y stock desde una plataforma moderna y fácil de usar.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-4xl border border-orange-500/10 bg-orange-500/10 p-6 shadow-[0_30px_80px_rgba(249,115,22,0.12)]">
            <div className="absolute -right-10 top-8 h-24 w-24 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="relative z-10 grid gap-4 rounded-3xl bg-[#0e1728] p-6">
              <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-zinc-400">
                <span>EcoPost POS — Dashboard</span>
                <span className="rounded-full bg-orange-500/15 px-3 py-1 text-orange-300">Mesas</span>
              </div>
              <div className="grid gap-4 md:grid-cols-[1.3fr_0.9fr]">
                <div className="rounded-3xl border border-zinc-800 bg-[#111b2f] p-4">
                  <div className="grid gap-3">
                    {['1','2','3','4','5','6'].map((label) => (
                      <div key={label} className={`flex h-11 items-center justify-center rounded-2xl ${label === '2' || label === '5' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-[#111b2f] p-4">
                  <div className="mb-4 flex items-center justify-between rounded-2xl bg-zinc-950/80 px-4 py-3 text-sm text-zinc-300">
                    <span>24</span>
                    <span>Mesas</span>
                  </div>
                  <div className="rounded-3xl bg-[#0f1720] p-4">
                    <div className="mb-3 flex items-center justify-between text-sm text-zinc-400">
                      <span>Rating</span>
                      <span className="font-semibold text-white">4.9★</span>
                    </div>
                    <div className="grid gap-2">
                      {[...Array(6)].map((_, idx) => (
                        <div key={idx} className="h-2 rounded-full bg-orange-500/70" style={{ width: `${80 - idx * 10}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-zinc-800 bg-[#111b2f] p-6 text-sm text-zinc-300">
              <p className="font-semibold text-white">Arqueo de caja diario</p>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-[#111b2f] p-6 text-sm text-zinc-300">
              <p className="font-semibold text-white">Control de stock</p>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-[#111b2f] p-6 text-sm text-zinc-300">
              <p className="font-semibold text-white">Reportes en tiempo real</p>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-[#111b2f] p-6 text-sm text-zinc-300">
              <p className="font-semibold text-white">Gestión de mesas</p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-4xl border border-zinc-800 bg-[#111b2f]/90 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.25)]">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute left-0 bottom-0 h-36 w-36 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10 space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-[#0b1320] p-8">
              <h2 className="text-3xl font-bold text-white">Crear cuenta gratis</h2>
              <p className="mt-2 text-sm text-zinc-400">Comienza hoy, sin tarjeta de crédito</p>

              <form className="mt-8 grid gap-4">
                <label className="flex flex-col gap-2 text-sm text-zinc-400">
                  Nombre del negocio
                  <input
                    type="text"
                    placeholder="Nombre del negocio"
                    className="rounded-2xl border border-zinc-800 bg-[#0f1720] px-4 py-3 text-white outline-none focus:border-orange-500"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-zinc-400">
                  Nombre y apellido del encargado
                  <input
                    type="text"
                    placeholder="Nombre y apellido"
                    className="rounded-2xl border border-zinc-800 bg-[#0f1720] px-4 py-3 text-white outline-none focus:border-orange-500"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-zinc-400">
                  Teléfono de contacto
                  <div className="flex overflow-hidden rounded-2xl border border-zinc-800 bg-[#0f1720]">
                    <span className="inline-flex items-center px-4 text-sm text-zinc-300">+57</span>
                    <input
                      type="tel"
                      placeholder="Ejemplo: (123) 123 4567"
                      className="w-full bg-transparent px-4 py-3 text-white outline-none"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-2 text-sm text-zinc-400">
                  E-mail de contacto
                  <input
                    type="email"
                    placeholder="Ejemplo: nombre@gmail.com"
                    className="rounded-2xl border border-zinc-800 bg-[#0f1720] px-4 py-3 text-white outline-none focus:border-orange-500"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-zinc-400">
                  Contraseña para tu cuenta
                  <div className="relative rounded-2xl border border-zinc-800 bg-[#0f1720] focus-within:border-orange-500">
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
                  <span className="text-xs text-zinc-500">
                    Debe contener mínimo 8 caracteres, mayúsculas, minúsculas y un número.
                  </span>
                </label>

                <label className="flex flex-col gap-2 text-sm text-zinc-400">
                  Código promocional <span className="text-xs text-zinc-500">(opcional)</span>
                  <input
                    type="text"
                    placeholder="Código promocional"
                    className="rounded-2xl border border-zinc-800 bg-[#0f1720] px-4 py-3 text-white outline-none focus:border-orange-500"
                  />
                </label>

                <label className="flex items-start gap-3 text-sm text-zinc-400">
                  <input type="checkbox" className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-orange-500 focus:ring-orange-500" />
                  <span>
                    Acepto las <Link href="#" className="font-semibold text-orange-400 hover:text-orange-300">Condiciones del Servicio</Link> y las{' '}
                    <Link href="#" className="font-semibold text-orange-400 hover:text-orange-300">Políticas de Privacidad</Link> de EcoPost.
                  </span>
                </label>

                <button
                  type="button"
                  className="mt-2 rounded-3xl bg-orange-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Crear cuenta gratis
                </button>
              </form>

              <div className="mt-6 rounded-3xl border border-zinc-800 bg-[#0b1320] p-5 text-sm text-zinc-400">
                <p className="text-center">¿Ya tienes cuenta?{' '}
                  <Link href="/login" className="font-semibold text-orange-400 hover:text-orange-300">Inicia sesión</Link>
                </p>
              </div>

              <div className="mt-6 grid gap-3 rounded-3xl border border-zinc-800 bg-[#111b2f] p-4 text-xs text-zinc-400 sm:grid-cols-3">
                <span className="flex items-center justify-center rounded-2xl bg-zinc-950/70 px-3 py-2">Sin tarjeta</span>
                <span className="flex items-center justify-center rounded-2xl bg-zinc-950/70 px-3 py-2">Cancela cuando quieras</span>
                <span className="flex items-center justify-center rounded-2xl bg-zinc-950/70 px-3 py-2">Soporte gratis</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
