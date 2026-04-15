import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GetSitesNinjas | Sites rapidos para pequenos negocios",
  description: "Site profissional com preview gerado por IA, checkout direto e entrega organizada para pequenos negocios.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="topbar">
          <a className="brand" href="/">
            <span className="brand-mark">GSN</span>
            <span>GetSitesNinjas</span>
          </a>
          <nav>
            <a href="/#beneficios">Beneficios</a>
            <a href="/#pacotes">Pacotes</a>
            <a href="/create-site">Comprar meu site agora</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
