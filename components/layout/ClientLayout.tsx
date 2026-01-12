"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReactNode } from "react";

export function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    // Landing page has its own header/footer
    return <>{children}</>;
  }

  // Other pages use the standard layout
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
