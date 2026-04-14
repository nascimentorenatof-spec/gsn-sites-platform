import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GSN Sites",
  description: "Crie, visualize e publique landing pages simples com IA.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="topbar">
          <a className="brand" href="/">
            GSN Sites
          </a>
          <nav>
            <a href="/create-site">Crie seu site em segundos</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
