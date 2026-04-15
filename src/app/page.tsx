export default function HomePage() {
  const customPlanUrl = "https://wa.me/5511999999999?text=Quero%20um%20site%20personalizado%20sob%20consulta";

  return (
    <>
      <section className="hero">
        <div className="hero-copy section-inner">
          <p className="pill">Preview com IA + acabamento humano</p>
          <h1>Site profissional rapido, claro e pronto para vender.</h1>
          <p>
            Preencha o briefing, veja uma primeira versao do site e avance para a compra sem reuniao infinita. Ideal para MEIs, prestadores de servico e pequenos negocios que precisam parecer confiaveis agora.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="/create-site">
              Gerar preview agora
            </a>
            <a className="button dark" href="#pacotes">
              Ver pacotes
            </a>
          </div>
          <p className="microcopy">Pix aceito. Sem contrato longo. Revisoes inclusas.</p>
        </div>
      </section>

      <section className="proof-strip" aria-label="Diferenciais">
        <span>Entrega em ate 5 dias</span>
        <span>Preview antes da compra</span>
        <span>Responsivo no celular</span>
        <span>Dominio e hospedagem orientados</span>
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

      <section id="beneficios" className="benefits-section">
        <div className="section-heading">
          <p className="eyebrow">Beneficios</p>
          <h2>Rapidez, preco justo e zero complicacao.</h2>
          <p>Uma estrutura direta para transformar seu servico em uma pagina comercial bonita e objetiva.</p>
        </div>
        <div className="benefit-grid">
          <article className="benefit-card">
            <span>01</span>
            <h3>Em ate 5 dias</h3>
            <p>O fluxo foi pensado para sair do briefing e chegar na decisao sem semanas de espera.</p>
          </article>
          <article className="benefit-card">
            <span>02</span>
            <h3>A partir de R$ 390</h3>
            <p>Uma entrada acessivel para quem precisa vender com mais credibilidade.</p>
          </article>
          <article className="benefit-card">
            <span>03</span>
            <h3>Feito para celular</h3>
            <p>Layout responsivo para o cliente abrir pelo WhatsApp, Instagram ou Google.</p>
          </article>
          <article className="benefit-card">
            <span>04</span>
            <h3>Texto com IA</h3>
            <p>Voce informa o essencial e o sistema ajuda a organizar a primeira versao.</p>
          </article>
        </div>
      </section>

      <section className="image-band" aria-label="Mesa de trabalho com notebook">
        <div>
          <p className="eyebrow">Visual profissional</p>
          <h2>Seu negocio com presenca de empresa grande, sem processo pesado.</h2>
        </div>
      </section>

      <section id="pacotes" className="pricing-section">
        <div className="section-heading">
          <p className="pill">Pacotes</p>
          <h2>Escolha o tamanho certo para comecar.</h2>
          <p>Sem letra miuda. Sem mensalidade obrigatoria nos pacotes principais.</p>
        </div>
        <div className="pricing-grid three-plans">
          <article className="price-card">
            <p className="eyebrow">Basico</p>
            <h3>R$ 390</h3>
            <p>Pagamento unico</p>
            <ul>
              <li>1 pagina profissional</li>
              <li>Botao de contato</li>
              <li>Layout responsivo</li>
              <li>Entrega em ate 5 dias</li>
            </ul>
            <a className="button outline" href="/create-site?plan=basic">Comecar pelo basico</a>
          </article>
          <article className="price-card featured">
            <p className="popular-badge">Mais escolhido</p>
            <p className="eyebrow">Padrao</p>
            <h3>R$ 690</h3>
            <p>Pagamento unico</p>
            <ul>
              <li>3 paginas profissionais</li>
              <li>Formulario de contato</li>
              <li>SEO basico configurado</li>
              <li>Dominio e hospedagem orientados</li>
            </ul>
            <a className="button primary" href="/create-site?plan=standard">Quero o pacote padrao</a>
          </article>
          <article className="price-card premium">
            <p className="popular-badge">Mais completo</p>
            <p className="eyebrow">Personalizado</p>
            <h3>Sob consulta</h3>
            <p>Atendimento manual</p>
            <ul>
              <li>Desenvolvimento sob medida</li>
              <li>Layout exclusivo</li>
              <li>Funcionalidades avancadas</li>
              <li>Integracoes personalizadas</li>
              <li>Atendimento dedicado</li>
            </ul>
            <a className="button dark" href={customPlanUrl} target="_blank" rel="noreferrer">
              Falar com especialista
            </a>
          </article>
        </div>
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
