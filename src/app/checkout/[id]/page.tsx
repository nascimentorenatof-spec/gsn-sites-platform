import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects";

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <section className="checkout-page">
      <div className="checkout-box">
        <p className="eyebrow">Checkout de teste</p>
        <h1>Confirmar pagamento</h1>
        <p>Projeto: {project.form_data.businessName}</p>
        <p>Use esta tela somente enquanto o provedor real de pagamento nao estiver conectado.</p>
        <form method="post" action="/api/payment/mock">
          <input type="hidden" name="projectId" value={project.id} />
          <button className="button primary" type="submit">
            Simular pagamento aprovado
          </button>
        </form>
      </div>
    </section>
  );
}
