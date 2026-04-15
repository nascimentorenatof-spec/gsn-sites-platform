export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Getsites Ninjas | landing pages sob demanda</p>
          <h1>Compre um site pronto para vender antes que seu concorrente pareca maior que voce.</h1>
          <p>
            Preencha o briefing, gere um preview com IA e avance para o checkout. Sem reuniao infinita, sem espera vaga, sem site parado no "vamos ver".
          </p>
          <a className="button primary" href="/create-site">
            Quero meu site pronto agora
          </a>
        </div>
      </section>
      <section className="sales-strip">
        <p className="eyebrow">Compra direta</p>
        <h2>Seu negocio precisa parecer confiavel hoje, nao depois de 14 mensagens no WhatsApp.</h2>
        <a className="button secondary" href="/create-site">
          Gerar preview e comprar
        </a>
      </section>
      <section className="steps">
        <article>
          <strong>1</strong>
          <h2>Briefing rapido</h2>
          <p>Voce informa negocio, servicos, cidade, contato, cores e imagens essenciais.</p>
        </article>
        <article>
          <strong>2</strong>
          <h2>Preview imediato</h2>
          <p>A IA monta uma primeira versao clara, direta e pronta para decisao.</p>
        </article>
        <article>
          <strong>3</strong>
          <h2>Compra sem enrolacao</h2>
          <p>Gostou do caminho? Pague e o projeto fica registrado para entrega operacional.</p>
        </article>
      </section>
      <section className="feature-grid">
        <article className="panel">
          <p className="eyebrow">Para quem vende</p>
          <h2>Uma landing page para tirar o cliente da duvida.</h2>
          <p>Oferta organizada, chamada forte e contato em destaque para quem precisa vender servico, agenda ou orcamento.</p>
        </article>
        <article className="panel">
          <p className="eyebrow">Sem projeto eterno</p>
          <h2>Preview primeiro. Conversa depois.</h2>
          <p>Voce ve uma versao antes de ficar preso em briefing subjetivo. A decisao fica mais rapida.</p>
        </article>
        <article className="panel cta-panel">
          <p className="eyebrow">Acao agora</p>
          <h2>Se voce ja sabe que precisa de site, pare de adiar.</h2>
          <a className="button primary" href="/create-site">
            Comprar minha landing page
          </a>
        </article>
      </section>
    </>
  );
}
