import { NextResponse } from "next/server";
import { getProject, updateProjectStatus } from "@/lib/projects";

export const runtime = "nodejs";

async function resolveMercadoPagoPayment(payload: Record<string, unknown>) {
  const data = payload.data as { id?: string } | undefined;
  const paymentId = String(data?.id || payload["data.id"] || payload.id || "").trim();
  if (!paymentId || !process.env.MERCADOPAGO_ACCESS_TOKEN) return null;

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  });
  if (!response.ok) return null;

  const payment = (await response.json()) as { status?: string; external_reference?: string; id?: string };
  return {
    projectId: payment.external_reference || "",
    status: payment.status || "",
    reference: String(payment.id || paymentId),
  };
}

function resolveStripeEvent(payload: Record<string, unknown>) {
  const data = payload.data as { object?: { metadata?: { project_id?: string; projectId?: string }; payment_status?: string; id?: string } } | undefined;
  const object = data?.object;
  if (!object) return null;

  return {
    projectId: object.metadata?.project_id || object.metadata?.projectId || "",
    status: object.payment_status === "paid" ? "paid" : String(payload.type || ""),
    reference: object.id || "",
  };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? ((await request.json()) as Record<string, unknown>)
      : Object.fromEntries((await request.formData()).entries());

    const mercadoPagoPayment = String(payload.type || "").toLowerCase() === "payment" ? await resolveMercadoPagoPayment(payload) : null;
    const stripeEvent = String(payload.type || "").startsWith("checkout.") || String(payload.type || "").startsWith("payment_") ? resolveStripeEvent(payload) : null;

    const projectId = String(
      mercadoPagoPayment?.projectId ||
        stripeEvent?.projectId ||
        payload.project_id ||
        payload.projectId ||
        payload.external_reference ||
        "",
    ).trim();
    const status = String(mercadoPagoPayment?.status || stripeEvent?.status || payload.status || payload.type || payload.action || "").toLowerCase();
    const reference = mercadoPagoPayment?.reference || stripeEvent?.reference || String(payload.payment_reference || payload.id || "");
    const paidStatuses = new Set(["paid", "pago", "approved", "payment.created", "payment_intent.succeeded", "checkout.session.completed"]);

    if (!projectId) return NextResponse.json({ ok: false, error: "Projeto nao informado." }, { status: 400 });
    if (!paidStatuses.has(status)) return NextResponse.json({ ok: true, ignored: true });

    const project = await getProject(projectId);
    if (!project) return NextResponse.json({ ok: false, error: "Projeto nao encontrado." }, { status: 404 });

    await updateProjectStatus(project.id, "paid", {
      payment_reference: reference || project.payment_reference,
      internal_notes: "Pagamento confirmado por webhook. A entrega final pode seguir para publicacao/dominio conforme operacao configurada.",
    });

    return NextResponse.json({ ok: true, status: "paid", projectId: project.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no webhook.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
