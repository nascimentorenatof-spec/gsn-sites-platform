import { NextResponse } from "next/server";
import { getProject, updateProject } from "@/lib/projects";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { projectId?: string; domain?: string };
    if (!body.projectId) return NextResponse.json({ ok: false, error: "projectId obrigatório." }, { status: 400 });

    const project = await getProject(body.projectId);
    if (!project) return NextResponse.json({ ok: false, error: "Projeto não encontrado." }, { status: 404 });

    // Só permite atualizar domínio para projetos pagos
    if (!["paid", "in_progress", "delivered"].includes(project.status)) {
      return NextResponse.json({ ok: false, error: "Projeto ainda não está pago." }, { status: 409 });
    }

    await updateProject(project.id, {
      delivery_domain: body.domain?.trim() || null,
      internal_notes: `Domínio solicitado: ${body.domain?.trim() || "(a definir)"}. ${project.internal_notes || ""}`.trim(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar domínio.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
