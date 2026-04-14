import type { GeneratedSiteContent, SiteFormInput } from "@/lib/types";
import { buildFallbackContent } from "@/lib/site-renderer";

const generationSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "heroTitle",
    "heroSubtitle",
    "primaryCta",
    "aboutTitle",
    "aboutText",
    "benefits",
    "services",
    "proofTitle",
    "proofText",
    "contactTitle",
    "contactText",
    "seoTitle",
    "seoDescription",
  ],
  properties: {
    heroTitle: { type: "string" },
    heroSubtitle: { type: "string" },
    primaryCta: { type: "string" },
    aboutTitle: { type: "string" },
    aboutText: { type: "string" },
    benefits: { type: "array", minItems: 3, maxItems: 4, items: { type: "string" } },
    services: { type: "array", minItems: 3, maxItems: 6, items: { type: "string" } },
    proofTitle: { type: "string" },
    proofText: { type: "string" },
    contactTitle: { type: "string" },
    contactText: { type: "string" },
    seoTitle: { type: "string" },
    seoDescription: { type: "string" },
  },
};

function extractOutputText(response: unknown) {
  const result = response as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (typeof result.output_text === "string") return result.output_text;

  return (
    result.output
      ?.flatMap((item) => item.content || [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") || ""
  );
}

function normalizeGeneratedContent(value: GeneratedSiteContent, fallback: GeneratedSiteContent): GeneratedSiteContent {
  return {
    heroTitle: value.heroTitle || fallback.heroTitle,
    heroSubtitle: value.heroSubtitle || fallback.heroSubtitle,
    primaryCta: value.primaryCta || fallback.primaryCta,
    aboutTitle: value.aboutTitle || fallback.aboutTitle,
    aboutText: value.aboutText || fallback.aboutText,
    benefits: Array.isArray(value.benefits) && value.benefits.length >= 3 ? value.benefits.slice(0, 4) : fallback.benefits,
    services: Array.isArray(value.services) && value.services.length >= 3 ? value.services.slice(0, 6) : fallback.services,
    proofTitle: value.proofTitle || fallback.proofTitle,
    proofText: value.proofText || fallback.proofText,
    contactTitle: value.contactTitle || fallback.contactTitle,
    contactText: value.contactText || fallback.contactText,
    seoTitle: value.seoTitle || fallback.seoTitle,
    seoDescription: (value.seoDescription || fallback.seoDescription).slice(0, 160),
  };
}

export async function generateSiteContent(form: SiteFormInput) {
  const fallback = buildFallbackContent(form);

  if (!form.generateAiTexts || !process.env.OPENAI_API_KEY) {
    return { content: fallback, usedAi: false, log: "fallback_without_ai" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        max_output_tokens: 1200,
        temperature: 0.4,
        text: {
          format: {
            type: "json_schema",
            name: "landing_page_content",
            strict: true,
            schema: generationSchema,
          },
        },
        input: [
          {
            role: "system",
            content:
              "Voce cria copy para landing pages simples em portugues do Brasil. Responda somente com JSON valido seguindo o schema. Seja claro, comercial e especifico, sem promessas falsas.",
          },
          {
            role: "user",
            content: JSON.stringify({
              nomeDoNegocio: form.businessName,
              segmento: form.segment,
              estiloVisual: form.visualStyle,
              descricao: form.description,
              servicos: form.services,
              regiao: form.region,
              contato: form.contact,
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      return { content: fallback, usedAi: false, log: `openai_http_${response.status}` };
    }

    const payload = await response.json();
    const text = extractOutputText(payload);
    if (!text) return { content: fallback, usedAi: false, log: "openai_empty_response" };

    const parsed = JSON.parse(text) as GeneratedSiteContent;
    return { content: normalizeGeneratedContent(parsed, fallback), usedAi: true, log: "openai_success" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return { content: fallback, usedAi: false, log: `openai_error_${message.slice(0, 60)}` };
  } finally {
    clearTimeout(timeout);
  }
}
