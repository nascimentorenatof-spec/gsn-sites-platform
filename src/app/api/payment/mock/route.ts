import { NextResponse } from "next/server";
import { siteBaseUrl } from "@/lib/env";
import { getProject, updateProjectStatus } from "@/lib/projects";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const projectId = String(formData.get("projectId") || "");
  const project = projectId ? await getProject(projectId) : null;

  if (!project) {
    return NextResponse.redirect(`${siteBaseUrl()}/create-site?erro=projeto-nao-encontrado`, { status: 303 });
  }

  await updateProjectStatus(project.id, "in_progress", {
    payment_provider: project.payment_provider || "mock",
    payment_reference: project.payment_reference || `mock_${project.id}`,
    expires_at: null, // remove expiração após pagamento
    internal_notes: [
      "✅ Pagamento MOCK aprovado.",
      project.customer_notes ? `📝 Notas do cliente: ${project.customer_notes}` : "",
      "⏳ Aguardando finalização pelo designer.",
    ].filter(Boolean).join(" | "),
  });

  return NextResponse.redirect(`${siteBaseUrl()}/success/${project.id}`, { status: 303 });
}
