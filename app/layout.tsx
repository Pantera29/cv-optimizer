import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Optimizer - Mejora tu CV con IA",
  description: "Optimiza tu currículum vitae con inteligencia artificial y destaca en el mercado laboral",
  metadataBase: new URL("https://cv-optimizer-blue.vercel.app"),
  openGraph: {
    title: "CV Optimizer - Mejora tu CV con IA",
    description: "Optimiza tu currículum vitae con inteligencia artificial y destaca en el mercado laboral",
    url: "https://cv-optimizer-blue.vercel.app",
    siteName: "CV Optimizer",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CV Optimizer - Mejora tu CV con IA",
    description: "Optimiza tu currículum vitae con inteligencia artificial y destaca en el mercado laboral",
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
      </body>
    </html>
  );
} 