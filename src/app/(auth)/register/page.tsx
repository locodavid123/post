import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-16 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-orange-500/10">
        <div className="mb-8 flex flex-col gap-2">
          <span className="w-fit rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400">
            EcoPost
          </span>
          <h1 className="text-3xl font-bold">Registra tu comercio</h1>
          <p className="text-sm text-zinc-400">Crea tu cuenta y empieza a gestionar pedidos, mesas y ventas.</p>
        </div>

        <form className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-zinc-300 md:col-span-2">
            Nombre del comercio
            <input className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none ring-0" placeholder="Restaurante Verde" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Correo
            <input type="email" className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none ring-0" placeholder="admin@verde.com" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            Teléfono
            <input className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none ring-0" placeholder="555-1234" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-300 md:col-span-2">
            Contraseña
            <input type="password" className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none ring-0" placeholder="••••••••" />
          </label>
          <Link href="/client" className="md:col-span-2 rounded-full bg-orange-500 px-4 py-3 text-center font-semibold text-white transition hover:bg-orange-600">
            Crear cuenta
          </Link>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-orange-400">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
