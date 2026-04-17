import type { GeneratedSiteContent, SiteFormInput } from "@/lib/types";
import { buildFallbackContent } from "@/lib/site-renderer";
import { envValue } from "@/lib/env";

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
    "faq",
    "testimonials",
    "privacyPolicy",
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
    faq: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "answer"],
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
      },
    },
    testimonials: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "quote"],
        properties: {
          name: { type: "string" },
          quote: { type: "string" },
        },
      },
    },
    privacyPolicy: { type: "string" },
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

function compactDiagnostic(value: string) {
  return value
    .replace(envValue("OPENAI_API_KEY") || "", "[redacted]")
    .replace(/sk-[A-Za-z0-9_*.-]+/g, "[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
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
    faq: Array.isArray(value.faq) && value.faq.length >= 3 ? value.faq.slice(0, 5) : fallback.faq,
    testimonials: Array.isArray(value.testimonials) && value.testimonials.length >= 2 ? value.testimonials.slice(0, 3) : fallback.testimonials,
    privacyPolicy: value.privacyPolicy || fallback.privacyPolicy,
  };
}

export async function generateSiteContent(form: SiteFormInput) {
  const fallback = buildFallbackContent(form);
  const openAiApiKey = envValue("OPENAI_API_KEY");
  const openAiModel = envValue("OPENAI_MODEL") || "gpt-4.1-mini";

  if (!form.generateAiTexts || !openAiApiKey) {
    return { content: fallback, usedAi: false, log: "fallback_without_ai" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 26000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openAiModel,
        max_output_tokens: 1800,
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
              "Voce cria conteudo editavel para sites simples em portugues do Brasil com foco forte em conversao. Responda somente com JSON valido seguindo o schema. Seja direto, especifico, moderno e persuasivo. Use CTAs claros e urgentes, sem promessas falsas, sem exageros ilegais e sem linguagem generica. Gere textos prontos para uma area administrativa onde o cliente possa editar textos, imagens, servicos, precos, contato, FAQ, depoimentos e SEO basico. Nunca invente credenciais, acessos, dominios registrados ou dados tecnicos de webmail.",
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
              dadosEstruturados: form.structuredData,
              requisitosDeConteudo: {
                areasEditaveis: form.structuredData?.generation_rules.adminScope,
                gerarPoliticaDePrivacidade: form.structuredData?.generation_rules.generateDefaultPrivacyPolicy,
                gerarSeoPadrao: form.structuredData?.generation_rules.generateDefaultSeo,
                portalCliente: form.structuredData?.generation_rules.createClientPortal,
                caixaDeLeads: form.structuredData?.generation_rules.createLeadInbox,
                bibliotecaDeMidia: form.structuredData?.generation_rules.createMediaLibrary,
                dominioEmail: form.structuredData?.generation_rules.createDomainEmailArea,
                atalhoWebmail: form.structuredData?.generation_rules.createWebmailShortcut,
              },
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      const diagnostic = compactDiagnostic(await response.text());
      console.warn("OpenAI generation failed", { status: response.status, diagnostic });
      return { content: fallback, usedAi: false, log: `openai_http_${response.status}_${diagnostic}` };
    }

    const payload = await response.json();
    const text = extractOutputText(payload);
    if (!text) {
      const diagnostic = compactDiagnostic(JSON.stringify(payload));
      console.warn("OpenAI returned no output text", { diagnostic });
      return { content: fallback, usedAi: false, log: `openai_empty_response_${diagnostic}` };
    }

    const parsed = JSON.parse(text) as GeneratedSiteContent;
    return { content: normalizeGeneratedContent(parsed, fallback), usedAi: true, log: "openai_success" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    console.warn("OpenAI generation error", { message: compactDiagnostic(message) });
    return { content: fallback, usedAi: false, log: `openai_error_${message.slice(0, 60)}` };
  } finally {
    clearTimeout(timeout);
  }
}
