import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Optimizador de CV con IA",
  description: "Mejora tu currículum para destacar en el mercado laboral utilizando inteligencia artificial",
  metadataBase: new URL("https://cv-optimizer-blue.vercel.app"),
  openGraph: {
    title: "Optimizador de CV con IA",
    description: "Mejora tu currículum para destacar en el mercado laboral utilizando inteligencia artificial",
    url: "https://cv-optimizer-blue.vercel.app",
    siteName: "Optimizador de CV",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Optimizador de CV con IA",
    description: "Mejora tu currículum para destacar en el mercado laboral utilizando inteligencia artificial",
  },
}

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