"use client";

import { useState } from "react";

export default function ContactoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<null | string>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Enviando...");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) setStatus("Mensaje enviado. Te contactamos pronto.");
      else setStatus("Error al enviar. Intenta nuevamente.");
    } catch (err) {
      setStatus("Error de red. Intenta más tarde.");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-4xl font-bold text-orange-400">Contacto</h1>
        <p className="mt-4 text-zinc-300">Escríbenos y te contactamos para una demo o consultas comerciales.</p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nombre" className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-white" required />
          <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="Correo electrónico" className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-white" required />
          <textarea value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Mensaje" className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-white min-h-[120px]" required />
          <div className="flex items-center gap-4">
            <button className="w-max rounded-full bg-orange-500 px-6 py-3 font-semibold text-white" type="submit">Enviar</button>
            {status && <p className="text-sm text-zinc-300">{status}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
