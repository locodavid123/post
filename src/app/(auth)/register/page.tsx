"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  User,
  Phone,
  Mail,
  Lock,
  Gift,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    businessName: "",
    managerName: "",
    phone: "",
    email: "",
    password: "",
    promoCode: "",
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.acceptTerms) {
      setErrorMessage("Debes aceptar los Términos del Servicio y Políticas de Privacidad.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: formData.businessName,
          managerName: formData.managerName,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          promoCode: formData.promoCode,
          acceptTerms: formData.acceptTerms,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...");
        setTimeout(() => {
          router.push("/login");
        }, 1200);
      } else {
        setErrorMessage(data?.message || "Ocurrió un error al registrar la cuenta.");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Error de conexión con el servidor. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090a0f] text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl grid gap-8 lg:grid-cols-[1fr_1.1fr] items-center relative z-10 animate-fade-in">
        {/* Left Card: Value Proposition */}
        <section className="hidden lg:flex flex-col gap-6 bg-gradient-to-br from-[#12151e] to-zinc-950 border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-orange-500/25">
              E
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              EcoPost
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
              Registra tu Comercio
            </span>
            <h1 className="text-3xl font-black text-white leading-tight">
              Potencia la operación de tu negocio con la tecnología de EcoPost.
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Empieza en minutos. Gestiona mesas, productos, ventas e interacción musical con tus clientes desde cualquier dispositivo.
            </p>
          </div>

          <div className="space-y-3.5 pt-4">
            {[
              "Configuración ágil y catálogo de productos personalizable",
              "Control de ventas y cierres de caja detallados",
              "Acceso multiusuario para administradores y meseros",
              "Soporte y actualizaciones continuas sin costo adicional",
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.06] flex items-center gap-3 mt-4">
            <ShieldCheck size={22} className="text-orange-400 shrink-0" />
            <div className="text-[11px] text-zinc-400 leading-tight">
              Garantía de privacidad. Tus datos y ventas pertenecen exclusivamente a tu comercio.
            </div>
          </div>
        </section>

        {/* Right Card: Register Form */}
        <section className="bg-[#12151e] border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight text-white">Crea tu Cuenta</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Completa los datos de tu negocio para comenzar hoy mismo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Nombre del Negocio
                </label>
                <div className="relative">
                  <Store size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="Ej: Burger House"
                    className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/80 pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Nombre del Encargado
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    name="managerName"
                    value={formData.managerName}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/80 pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Teléfono / WhatsApp
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    type="tel"
                    required
                    placeholder="+54 9 11 1234-5678"
                    className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/80 pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    required
                    placeholder="contacto@negocio.com"
                    className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/80 pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/80 pl-9 pr-10 py-2.5 text-xs sm:text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Código Promocional <span className="text-[10px] text-zinc-500 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <Gift size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    name="promoCode"
                    value={formData.promoCode}
                    onChange={handleChange}
                    type="text"
                    placeholder="Ej: PROMO-2026"
                    className="w-full rounded-xl border border-white/[0.08] bg-zinc-950/80 pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-zinc-600 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Checkbox Términos */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-400">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-orange-500 accent-orange-500 cursor-pointer"
                />
                <span>
                  He leído y acepto los{" "}
                  <Link href="/terms" className="text-orange-400 underline hover:text-orange-300">
                    Términos de Servicio
                  </Link>{" "}
                  y las{" "}
                  <Link href="/privacy" className="text-orange-400 underline hover:text-orange-300">
                    Políticas de Privacidad
                  </Link>
                  .
                </span>
              </label>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold animate-fade-in flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold animate-fade-in flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 text-sm transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
            >
              <span>{loading ? "Creando cuenta..." : "Completar Registro"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-xs text-zinc-400">
              ¿Ya tienes una cuenta registrada?{" "}
              <Link href="/login" className="font-bold text-orange-400 hover:text-orange-300 transition">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
