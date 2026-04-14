import { siteBaseUrl } from "@/lib/env";
import type { CheckoutResult, SiteProject } from "@/lib/types";

export async function createCheckout(project: SiteProject): Promise<CheckoutResult> {
  const provider = process.env.PAYMENT_PROVIDER || "mock";
  if (provider === "pagseguro") return createPagSeguroCheckout(project);
  if (provider === "mercadopago") return createMercadoPagoCheckout(project);
  if (provider === "stripe") return createStripeCheckout(project);
  return {
    provider: "mock",
    reference: "mock_" + project.id,
    checkoutUrl: siteBaseUrl() + "/checkout/" + project.id + "?mock=1",
  };
}

async function createPagSeguroCheckout(project: SiteProject): Promise<CheckoutResult> {
  const token = process.env.PAGSEGURO_TOKEN;
  if (!token) throw new Error("PAGSEGURO_TOKEN ausente.");
  const sandbox = process.env.PAGSEGURO_SANDBOX === "true";
  const baseUrl = sandbox ? "https://sandbox.api.pagseguro.com" : "https://api.pagseguro.com";
  const amountCents = Number(process.env.PAYMENT_PRICE_CENTS || "39000");
  const successUrl = process.env.PAYMENT_SUCCESS_URL || (siteBaseUrl() + "/success/" + project.id);
  const cancelUrl = process.env.PAYMENT_CANCEL_URL || (siteBaseUrl() + "/preview/" + project.id);
  const body = {
    reference_id: project.id,
    customer_modifiable: true,
    items: [{
      reference_id: project.id,
      name: "Site Profissional - " + project.form_data.businessName,
      quantity: 1,
      unit_amount: amountCents,
    }],
    payment_methods: [
      { type: "CREDIT_CARD" },
      { type: "DEBIT_CARD" },
      { type: "PIX" },
      { type: "BOLETO" },
    ],
    redirect_url: successUrl,
    return_url: cancelUrl,
    notification_urls: [siteBaseUrl() + "/api/payment/webhook"],
    soft_descriptor: "GETSITESNINJAS",
  };
  const response = await fetch(baseUrl + "/checkouts", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error("Falha ao criar checkout PagSeguro: " + response.status + " " + errText);
  }
  const payload = (await response.json()) as {
    id?: string;
    links?: { rel: string; href: string }[];
  };
  const checkoutId = payload.id || "";
  // Busca link PAY (tela de pagamento hosted), nunca SELF (e o endpoint da API)
  const payLink = payload.links?.find((l) => l.rel.toUpperCase() === "PAY")?.href;
  const hostedUrl = payLink || (sandbox
    ? "https://sandbox.pagbank.com.br/pagamento?checkout_id=" + checkoutId
    : "https://pagbank.com.br/pagamento?checkout_id=" + checkoutId);
  if (!hostedUrl || !checkoutId) {
    throw new Error("PagSeguro: link de pagamento ausente. Links: " + JSON.stringify(payload.links));
  }
  return { provider: "pagseguro", checkoutUrl: hostedUrl, reference: checkoutId };
}

async function createMercadoPagoCheckout(project: SiteProject): Promise<CheckoutResult> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN ausente.");
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({
      external_reference: project.id,
      notification_url: siteBaseUrl() + "/api/payment/webhook",
      back_urls: {
        success: process.env.PAYMENT_SUCCESS_URL || (siteBaseUrl() + "/success/" + project.id),
        failure: process.env.PAYMENT_CANCEL_URL || (siteBaseUrl() + "/preview/" + project.id),
        pending: siteBaseUrl() + "/preview/" + project.id,
      },
      auto_return: "approved",
      items: [{
        title: "Landing page - " + project.form_data.businessName,
        quantity: 1,
        currency_id: "BRL",
        unit_price: Number(process.env.PAYMENT_PRICE_BRL || "390"),
      }],
    }),
  });
  if (!response.ok) throw new Error("Falha ao criar checkout Mercado Pago: " + response.status);
  const payload = (await response.json()) as { init_point?: string; id?: string };
  if (!payload.init_point || !payload.id) throw new Error("Mercado Pago nao retornou checkout valido.");
  return { provider: "mercadopago", checkoutUrl: payload.init_point, reference: payload.id };
}

async function createStripeCheckout(project: SiteProject): Promise<CheckoutResult> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY ausente.");
  const params = new URLSearchParams({
    mode: "payment",
    success_url: process.env.PAYMENT_SUCCESS_URL || (siteBaseUrl() + "/success/" + project.id),
    cancel_url: process.env.PAYMENT_CANCEL_URL || (siteBaseUrl() + "/preview/" + project.id),
    "metadata[project_id]": project.id,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "brl",
    "line_items[0][price_data][unit_amount]": String(Number(process.env.PAYMENT_PRICE_CENTS || "39000")),
    "line_items[0][price_data][product_data][name]": "Landing page - " + project.form_data.businessName,
  });
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: "Bearer " + secret, "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!response.ok) throw new Error("Falha ao criar checkout Stripe: " + response.status);
  const payload = (await response.json()) as { url?: string; id?: string };
  if (!payload.url || !payload.id) throw new Error("Stripe nao retornou checkout valido.");
  return { provider: "stripe", checkoutUrl: payload.url, reference: payload.id };
}
