import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Optimizador de CV con IA",
  description: "Optimiza tu CV para destacar en el mercado laboral",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={GeistSans.className}>
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
} 