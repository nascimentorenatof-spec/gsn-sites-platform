import { Suspense } from "react";
import { CreateSiteForm } from "@/components/CreateSiteForm";

export default function CreateSitePage() {
  return (
    <section className="form-band">
      <div className="form-intro">
        <p className="pill">Compra com preview</p>
        <h1>Gere a primeira versao do seu site e compre sem perder tempo.</h1>
        <p>Preencha o essencial. A Getsites Ninjas monta um preview com IA para voce decidir e seguir para checkout.</p>
      </div>
      <Suspense fallback={<div className="form-loading">Carregando formulario...</div>}>
        <CreateSiteForm />
      </Suspense>
    </section>
  );
}
