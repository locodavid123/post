import type { Metadata } from "next";
import { Inter, Fira_Mono } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "@/components/ui/ConditionalHeader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const mono = Fira_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoPost — Sistema POS y Rockola para Restaurantes, Bares y Cafés",
  description:
    "El sistema POS y Rockola digital más completo para restaurantes, bares y cafés. Gestiona mesas, pedidos QR, comandas de cocina, inventario, facturación y música en vivo.",
  keywords: [
    "EcoPost",
    "sistema POS",
    "software restaurante",
    "rockola interactiva",
    "jukebox restaurante",
    "gestión de mesas",
    "pedidos QR",
    "punto de venta Colombia",
  ],
  openGraph: {
    title: "EcoPost — Sistema POS y Rockola para Restaurantes",
    description:
      "Gestiona mesas, comandas, pedidos QR, ventas y rockola interactiva en tiempo real.",
    siteName: "EcoPost",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#090a0f] text-zinc-100">
        <ConditionalHeader />
        {children}
      </body>
    </html>
  );
}
