import { NextResponse } from "next/server";
import { getProject } from "@/lib/projects";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return NextResponse.json({ ok: false, error: "Não encontrado." }, { status: 404 });

  // Retorna apenas os campos necessários para o client (sem expor chaves internas)
  return NextResponse.json({
    ok: true,
    project: {
      id: project.id,
      status: project.status,
      form_data: {
        businessName: project.form_data.businessName,
        segment: project.form_data.segment,
        contact: project.form_data.contact,
      },
      preview_html: project.preview_html,
      expires_at: project.expires_at ?? null,
    },
  });
}
