import { palettes, segments, visualStyles } from "@/lib/catalog";
import type { SiteFormInput } from "@/lib/types";

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

export function parseSiteForm(formData: FormData): { data?: SiteFormInput; errors?: Record<string, string> } {
  const data: SiteFormInput = {
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
