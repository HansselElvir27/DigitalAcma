import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Search, MessageCircle, MapPin } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plataforma Digital ACMA",
  description: "Gestión Marítima Institucional y Ciudadana",
};

import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-12">
            {children}
          </main>
          <footer className="mt-20">
            <div className="glass-card max-w-md mx-auto p-6 text-center border-t border-white/5">
              <p className="text-sm opacity-50">&copy; 2026 Plataforma Digital ACMA - Todos los derechos reservados.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
