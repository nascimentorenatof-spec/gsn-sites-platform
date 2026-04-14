import { notFound } from "next/navigation";
import { CheckoutButton } from "@/components/CheckoutButton";
import { getProject } from "@/lib/projects";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <section className="preview-page">
      <div className="preview-header">
        <div>
          <p className="eyebrow">Preview do site</p>
          <h1>{project.form_data.businessName}</h1>
          <p>
            Status: <strong>{project.status}</strong>. Revise a primeira versao antes de iniciar o checkout.
          </p>
        </div>
        <CheckoutButton projectId={project.id} />
      </div>
      <iframe className="preview-frame" title={`Preview de ${project.form_data.businessName}`} srcDoc={project.preview_html} />
    </section>
  );
}
