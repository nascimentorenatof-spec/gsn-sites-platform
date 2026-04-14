export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Sites simples, publicados rapido</p>
          <h1>Seu site no ar com IA, preview e checkout no mesmo fluxo.</h1>
          <p>
            Preencha os dados, envie imagens, gere uma landing page, veja o preview e avance para pagamento sem depender de atendimento manual.
          </p>
          <a className="button primary" href="/create-site">
            Crie seu site em segundos
          </a>
        </div>
      </section>
      <section className="steps">
        <article>
          <strong>1</strong>
          <h2>Informe seu negocio</h2>
          <p>Nome, segmento, cores, estilo, cidade, contato, servicos e imagens.</p>
        </article>
        <article>
          <strong>2</strong>
          <h2>Gere com IA</h2>
          <p>O backend serverless monta o prompt, chama a IA e salva o resultado.</p>
        </article>
        <article>
          <strong>3</strong>
          <h2>Checkout e entrega</h2>
          <p>O pagamento fica associado ao projeto para organizar a publicacao final.</p>
        </article>
      </section>
    </>
  );
}
