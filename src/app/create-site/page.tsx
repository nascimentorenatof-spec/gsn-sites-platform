import { CreateSiteForm } from "@/components/CreateSiteForm";

export default function CreateSitePage() {
  return (
    <section className="form-band">
      <div className="form-intro">
        <p className="eyebrow">Compra com preview</p>
        <h1>Gere a primeira versao do seu site e compre sem perder tempo.</h1>
        <p>Preencha o essencial. A Getsites Ninjas monta um preview com IA para voce decidir e seguir para checkout.</p>
      </div>
      <CreateSiteForm />
    </section>
  );
}
