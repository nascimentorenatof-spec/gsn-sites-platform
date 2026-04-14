import { CreateSiteForm } from "@/components/CreateSiteForm";

export default function CreateSitePage() {
  return (
    <section className="form-band">
      <div className="form-intro">
        <p className="eyebrow">Gerador automatizado</p>
        <h1>Crie seu site em segundos</h1>
        <p>Envie as informacoes principais, gere textos com IA e receba uma primeira versao pronta para preview.</p>
      </div>
      <CreateSiteForm />
    </section>
  );
}
