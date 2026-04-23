import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gerador de Newsletter | DCP — Hotmart",
  description: "Ferramenta interna para geração automatizada de newsletters da Data & Commerce Platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#f5f3ef]">{children}</body>
    </html>
  );
}
