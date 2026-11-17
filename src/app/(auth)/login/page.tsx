"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Store,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Usuario o contraseña incorrectos");
        return;
      }

      const role = data?.user?.role || "USER";
      if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/client/mesas");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#090a0f] text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center relative z-10 animate-fade-in">
        {/* Left Card: Form */}
        <section className="bg-[#12151e] border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                E
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                EcoPost
              </span>
            </Link>
            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-400">
              Terminal POS
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Iniciar Sesión</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Ingresa tus credenciales para acceder a la gestión de tu negocio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Correo o Usuario
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  required
                  placeholder="ejemplo@negocio.com o usuario"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/80 pl-9 pr-4 py-3 text-xs sm:text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 transition"
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/80 pl-9 pr-12 py-3 text-xs sm:text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold animate-fade-in flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 text-sm transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>{loading ? "Verificando..." : "Entrar al Sistema"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-xs text-zinc-400">
              ¿No tienes una cuenta aún?{" "}
              <Link href="/register" className="font-bold text-orange-400 hover:text-orange-300 transition">
                Registra tu negocio gratis
              </Link>
            </p>
          </div>
        </section>

        {/* Right Card: Feature Highlights */}
        <section className="hidden lg:flex flex-col gap-6 bg-gradient-to-br from-[#12151e] to-zinc-950 border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Sparkles size={24} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
              Gestión Inteligente
            </span>
            <h3 className="text-2xl font-black text-white leading-tight">
              Control total de mesas, pedidos y facturación en tiempo real.
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed pt-1">
              Diseñado para restaurantes, bares, cafeterías y discotecas que buscan rapidez, claridad y estabilidad operativa.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              "Plano interactivo de mesas con estado libre y ocupado",
              "Facturación instantánea con cálculo automático de propinas y cambio",
              "Jukebox interactivo por código QR para que los clientes elijan música",
              "Sincronización multi-dispositivo y persistencia garantizada",
            ].map((feat, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3 mt-2">
            <ShieldCheck size={20} className="text-orange-400 shrink-0" />
            <div className="text-[11px] text-zinc-400 leading-tight">
              Tus datos están protegidos con cifrado seguro y arquitectura PostgreSQL multi-inquilino.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
