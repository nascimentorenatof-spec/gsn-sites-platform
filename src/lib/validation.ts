import { palettes, segments, visualStyles } from "@/lib/catalog";
import type { AdminScope, ContactPreference, GenerationRules, SiteFormInput, SiteObjective, SitePlan, StructuredSiteFormInput } from "@/lib/types";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const MAX_IMAGES = 5;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function cleanText(value: FormDataEntryValue | string | null, maxLength: number) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-") || "site";
}

function cleanObjectText(value: unknown, maxLength: number) {
  return cleanText(typeof value === "string" ? value : "", maxLength);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeChoice<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function firstDefined<T>(...values: T[]) {
  return values.find((value) => value !== undefined);
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (["true", "on", "1", "yes"].includes(value.toLowerCase())) return true;
    if (["false", "off", "0", "no"].includes(value.toLowerCase())) return false;
  }
  return fallback;
}

function normalizeAdminScope(value: unknown): AdminScope[] {
  const allowed: AdminScope[] = ["texts", "images", "services", "prices", "contact_info", "faq", "testimonials", "seo_basic"];
  const fallback: AdminScope[] = ["texts", "images", "services", "prices", "contact_info", "faq", "testimonials", "seo_basic"];
  if (!Array.isArray(value)) return fallback;

  const selected = value.filter((item): item is AdminScope => allowed.includes(item as AdminScope));
  return selected.length > 0 ? Array.from(new Set(selected)) : fallback;
}

function normalizeGenerationRules(value: Record<string, unknown>, domain: Record<string, unknown>): GenerationRules {
  return {
    generateAiTexts: normalizeBoolean(firstDefined(value.generateAiTexts, value.generate_ai_texts), true),
    allowAiCompletion: normalizeBoolean(firstDefined(value.allowAiCompletion, value.allow_ai_completion), true),
    createAdminArea: normalizeBoolean(firstDefined(value.createAdminArea, value.create_admin_area), true),
    adminScope: normalizeAdminScope(firstDefined(value.adminScope, value.admin_scope)),
    createClientPortal: normalizeBoolean(firstDefined(value.createClientPortal, value.create_client_portal), true),
    createLeadInbox: normalizeBoolean(firstDefined(value.createLeadInbox, value.create_lead_inbox), true),
    createMediaLibrary: normalizeBoolean(firstDefined(value.createMediaLibrary, value.create_media_library), true),
    createDomainEmailArea: normalizeBoolean(firstDefined(value.createDomainEmailArea, value.create_domain_email_area, domain.createDomainEmailArea, domain.create_domain_email_area), true),
    createWebmailShortcut: normalizeBoolean(firstDefined(value.createWebmailShortcut, value.create_webmail_shortcut, domain.createWebmailShortcut, domain.create_webmail_shortcut), true),
    allowLayoutEdit: normalizeBoolean(firstDefined(value.allowLayoutEdit, value.allow_layout_edit), false),
    allowBlockToggle: normalizeBoolean(firstDefined(value.allowBlockToggle, value.allow_block_toggle), true),
    createRevisionHistory: normalizeBoolean(firstDefined(value.createRevisionHistory, value.create_revision_history), true),
    createDraftAndPublishedVersions: normalizeBoolean(firstDefined(value.createDraftAndPublishedVersions, value.create_draft_and_published_versions), true),
    generateDefaultPrivacyPolicy: normalizeBoolean(firstDefined(value.generateDefaultPrivacyPolicy, value.generate_default_privacy_policy), true),
    generateDefaultSeo: normalizeBoolean(firstDefined(value.generateDefaultSeo, value.generate_default_seo), true),
    fallbackToAiForMissingFields: normalizeBoolean(firstDefined(value.fallbackToAiForMissingFields, value.fallback_to_ai_for_missing_fields), true),
  };
}

function parsePayload(formData: FormData) {
  const rawPayload = formData.get("payload");
  if (typeof rawPayload !== "string" || !rawPayload.trim()) return null;

  try {
    const parsed = JSON.parse(rawPayload) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function parseStructuredSiteForm(formData: FormData): StructuredSiteFormInput | null {
  const payload = parsePayload(formData);
  if (!payload) return null;

  const business = isRecord(payload.business) ? payload.business : {};
  const contact = isRecord(payload.contact) ? payload.contact : {};
  const offer = isRecord(payload.offer) ? payload.offer : {};
  const audience = isRecord(payload.audience) ? payload.audience : {};
  const branding = isRecord(payload.branding) ? payload.branding : {};
  const structure = isRecord(payload.structure) ? payload.structure : {};
  const domain = isRecord(payload.domain) ? payload.domain : {};
  const generationRules = isRecord(payload.generation_rules) ? payload.generation_rules : {};
  const normalizedGenerationRules = normalizeGenerationRules(generationRules, domain);

  const plan = normalizeChoice<SitePlan>(firstDefined(structure.plan, generationRules.plan), ["basic", "standard"], "standard");
  const pages =
    plan === "basic"
      ? ["Home"]
      : Array.isArray(structure.pages)
        ? structure.pages.map((page) => cleanObjectText(page, 40)).filter(Boolean).slice(0, 4)
        : [];

  return {
    business: {
      name: cleanObjectText(business.name, 90),
      segment: cleanObjectText(business.segment, 40),
      region: cleanObjectText(business.region, 120),
    },
    contact: {
      whatsapp: cleanObjectText(contact.whatsapp, 40),
      email: cleanObjectText(contact.email, 120),
      instagram: cleanObjectText(contact.instagram, 80),
      preferred: normalizeChoice<ContactPreference>(contact.preferred, ["whatsapp", "form", "both"], "whatsapp"),
    },
    offer: {
      summary: cleanObjectText(offer.summary, 220),
      items: cleanObjectText(offer.items, 700),
      mainItem: cleanObjectText(offer.mainItem, 120),
    },
    audience: {
      customer: cleanObjectText(audience.customer, 160),
      problem: cleanObjectText(audience.problem, 500),
      differentiator: cleanObjectText(audience.differentiator, 500),
    },
    branding: {
      visualStyle: cleanObjectText(branding.visualStyle, 30),
      primaryColor: cleanObjectText(branding.primaryColor, 40) || "#16a34a",
      referenceSite: cleanObjectText(branding.referenceSite, 160),
    },
    structure: {
      plan,
      pages,
      objective: normalizeChoice<SiteObjective>(
        structure.objective,
        ["generate_leads", "receive_messages", "present_company", "sell_services"],
        "generate_leads",
      ),
    },
    domain: {
      desiredDomain: cleanObjectText(domain.desiredDomain, 120),
      alreadyHasDomain: normalizeBoolean(firstDefined(domain.alreadyHasDomain, domain.already_has_domain), false),
      createDomainEmailArea: normalizedGenerationRules.createDomainEmailArea,
      createWebmailShortcut: normalizedGenerationRules.createWebmailShortcut,
    },
    generation_rules: normalizedGenerationRules,
  };
}

function structuredToLegacyData(structured: StructuredSiteFormInput): SiteFormInput {
  const descriptionParts = [
    structured.offer.summary,
    structured.audience.customer ? `Cliente ideal: ${structured.audience.customer}.` : "",
    structured.audience.problem ? `Problema resolvido: ${structured.audience.problem}.` : "",
    structured.audience.differentiator ? `Diferencial: ${structured.audience.differentiator}.` : "",
  ].filter(Boolean);

  const contactParts = [
    structured.contact.whatsapp ? `WhatsApp: ${structured.contact.whatsapp}` : "",
    structured.contact.email ? `Email: ${structured.contact.email}` : "",
    structured.contact.instagram ? `Instagram: ${structured.contact.instagram}` : "",
  ].filter(Boolean);

  return {
    businessName: structured.business.name,
    segment: structured.business.segment,
    palette: "verde",
    visualStyle: structured.branding.visualStyle,
    description: descriptionParts.join(" "),
    services: structured.offer.items || structured.offer.mainItem,
    region: structured.business.region,
    contact: contactParts.join(" | "),
    desiredDomain: structured.domain.desiredDomain,
    generateAiTexts: structured.generation_rules.generateAiTexts,
    structuredData: structured,
  };
}

export function parseSiteForm(formData: FormData): { data?: SiteFormInput; errors?: Record<string, string> } {
  const structured = parseStructuredSiteForm(formData);
  const data: SiteFormInput = structured ? structuredToLegacyData(structured) : {
    businessName: cleanText(formData.get("businessName"), 90),
    segment: cleanText(formData.get("segment"), 40),
    palette: cleanText(formData.get("palette"), 30),
    visualStyle: cleanText(formData.get("visualStyle"), 30),
    description: cleanText(formData.get("description"), 900),
    services: cleanText(formData.get("services"), 700),
    region: cleanText(formData.get("region"), 120),
    contact: cleanText(formData.get("contact"), 120),
    desiredDomain: cleanText(formData.get("desiredDomain"), 120),
    generateAiTexts: formData.get("generateAiTexts") === "on" || formData.get("generateAiTexts") === "true",
  };

  const errors: Record<string, string> = {};
  if (data.businessName.length < 2) errors.businessName = "Informe o nome do negocio.";
  if (!segments.includes(data.segment)) errors.segment = "Escolha um segmento valido.";
  if (!(data.palette in palettes)) errors.palette = "Escolha uma paleta valida.";
  if (!visualStyles.includes(data.visualStyle)) errors.visualStyle = "Escolha um estilo valido.";
  if (data.description.length < 30) errors.description = "Descreva o negocio com pelo menos 30 caracteres.";
  if (data.services.length < 5) errors.services = "Informe pelo menos um servico.";
  if (data.region.length < 2) errors.region = "Informe a cidade ou regiao.";
  if (data.contact.length < 6) errors.contact = "Informe um contato valido.";
  if (structured) {
    if (structured.contact.whatsapp.length < 8) errors.whatsapp = "Informe um WhatsApp valido.";
    if (structured.offer.summary.length < 8) errors.offer = "Informe o que voce vende.";
    if (structured.offer.mainItem.length < 2) errors.mainItem = "Informe o principal servico ou produto.";
    if (structured.audience.customer.length < 3) errors.customer = "Informe quem e seu cliente.";
    if (structured.audience.problem.length < 10) errors.problem = "Informe qual problema voce resolve.";
    if (structured.audience.differentiator.length < 10) errors.differentiator = "Informe o diferencial do negocio.";
    if (structured.structure.plan === "standard" && structured.structure.pages.length === 0) {
      errors.pages = "Escolha pelo menos uma pagina para o plano padrao.";
    }
  }

  return Object.keys(errors).length > 0 ? { errors } : { data };
}

export function validateImages(files: File[]) {
  const selected = files.filter((file) => file.size > 0).slice(0, MAX_IMAGES);
  const errors: string[] = [];

  for (const file of selected) {
    if (!allowedImageTypes.has(file.type)) errors.push(`${file.name}: formato nao permitido.`);
    if (file.size > MAX_IMAGE_SIZE) errors.push(`${file.name}: imagem acima de 4 MB.`);
  }

  return { files: selected, errors };
}
