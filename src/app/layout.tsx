import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get Sites Ninjas | Sites prontos para vender",
  description: "Compre uma landing page gerada com IA, preview imediato e entrega organizada.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="topbar">
          <a className="brand" href="/">
            getsitesninjas.com.br
          </a>
          <nav>
            <a href="/create-site">Comprar meu site agora</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
