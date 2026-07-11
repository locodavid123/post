"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/ui/Header";

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (!pathname) return null;

  if (pathname.startsWith("/admin") || pathname.startsWith("/client")) {
    return null;
  }

  return <Header />;
}
