import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-16 text-white">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-orange-500/10">
        <div className="mb-8 flex flex-col gap-2">
          <span className="w-fit rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400">
            EcoPost
          </span>
          <h1 className="text-3xl font-bold">Inicia sesión</h1>
          <p className="text-sm text-zinc-400">Accede al panel de tu comercio o administración global.</p>
        </div>

        <form className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Correo electrónico
            <input
              type="email"
              placeholder="tu@comercio.com"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none ring-0"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Contraseña
            <input
              type="password"
              placeholder="••••••••"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none ring-0"
            />
          </label>
          <Link
            href="/client"
            className="mt-2 rounded-full bg-orange-500 px-4 py-3 text-center font-semibold text-white transition hover:bg-orange-600"
          >
            Entrar
          </Link>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="font-semibold text-orange-400">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  );
}
