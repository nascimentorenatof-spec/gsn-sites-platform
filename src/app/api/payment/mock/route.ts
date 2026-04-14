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

  await updateProjectStatus(project.id, "paid", {
    payment_provider: project.payment_provider || "mock",
    payment_reference: project.payment_reference || `mock_${project.id}`,
    internal_notes: "Pagamento simulado aprovado no ambiente de teste.",
  });

  return NextResponse.redirect(`${siteBaseUrl()}/success/${project.id}`, { status: 303 });
}
