import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects";

export default async function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <section className="checkout-page">
      <div className="checkout-box">
        <p className="eyebrow">Pagamento registrado</p>
        <h1>Projeto recebido</h1>
        <p>
          Status atual: <strong>{project.status}</strong>
        </p>
        <p>Seu site foi salvo com preview, imagens e dados do formulario. A proxima etapa operacional e publicar a versao final conforme o fluxo de entrega configurado.</p>
        <a className="button primary" href={`/preview/${project.id}`}>
          Abrir preview
        </a>
      </div>
    </section>
  );
}
