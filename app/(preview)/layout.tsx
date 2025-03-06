import { GeistSans } from "geist/font/sans";
import "../globals.css";

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={GeistSans.className}>
      <body className="min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
} 