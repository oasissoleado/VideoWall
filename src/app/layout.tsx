import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VideoWall Admin",
  description: "Panel de control del video wall",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
