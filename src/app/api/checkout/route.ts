import { NextResponse } from "next/server";
import { createCheckout } from "@/lib/payments";
import { getProject, updateProject } from "@/lib/projects";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { projectId?: string; customerNotes?: string };
    if (!body.projectId) return NextResponse.json({ ok: false, error: "projectId obrigatorio." }, { status: 400 });

    const project = await getProject(body.projectId);
    if (!project) return NextResponse.json({ ok: false, error: "Projeto nao encontrado." }, { status: 404 });
    if (!["preview", "checkout_pending"].includes(project.status)) {
      return NextResponse.json({ ok: false, error: "Projeto nao esta disponivel para checkout." }, { status: 409 });
    }

    const checkout = await createCheckout(project);
    await updateProject(project.id, {
      status: "checkout_pending",
      payment_provider: checkout.provider,
      payment_reference: checkout.reference,
      checkout_url: checkout.checkoutUrl,
      // Salva as notas do cliente para o designer humano
      customer_notes: body.customerNotes?.trim() || null,
    });

    return NextResponse.json({ ok: true, checkoutUrl: checkout.checkoutUrl, provider: checkout.provider });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar checkout.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
