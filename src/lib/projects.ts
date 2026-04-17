import { createLocalProject, getLocalProject, updateLocalProject } from "@/lib/local-projects";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { GeneratedSiteContent, SiteFormInput, SiteProject, SiteStatus, UploadedAsset } from "@/lib/types";

const table = "site_projects";

function buildProvisioningNotes(formData: SiteFormInput) {
  const rules = formData.structuredData?.generation_rules;
  if (!rules) return null;

  return JSON.stringify({
    ownerEmail: formData.structuredData?.contact.email || null,
    createAdminArea: rules.createAdminArea,
    adminScope: rules.adminScope,
    createClientPortal: rules.createClientPortal,
    createLeadInbox: rules.createLeadInbox,
    createMediaLibrary: rules.createMediaLibrary,
    createDomainEmailArea: rules.createDomainEmailArea,
    createWebmailShortcut: rules.createWebmailShortcut,
    allowLayoutEdit: rules.allowLayoutEdit,
    allowBlockToggle: rules.allowBlockToggle,
    createRevisionHistory: rules.createRevisionHistory,
    createDraftAndPublishedVersions: rules.createDraftAndPublishedVersions,
  });
}

export async function createProject(input: {
  id: string;
  formData: SiteFormInput;
  generatedContent: GeneratedSiteContent;
  previewHtml: string;
  assets: UploadedAsset[];
  aiLog: string;
  usedAi: boolean;
}) {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();
  const provisioningNotes = buildProvisioningNotes(input.formData);
  const payload = {
    id: input.id,
    status: "preview",
    form_data: input.formData,
    generated_content: input.generatedContent,
    preview_html: input.previewHtml,
    assets: input.assets,
    ai_log: input.aiLog,
    used_ai: input.usedAi,
    expires_at: expiresAt,
    customer_email: input.formData.structuredData?.contact.email || null,
    internal_notes: provisioningNotes,
  };

  if (!isSupabaseConfigured()) {
    return createLocalProject({
      id: input.id,
      status: "preview",
      form_data: input.formData,
      generated_content: input.generatedContent,
      preview_html: input.previewHtml,
      assets: input.assets,
      expires_at: expiresAt,
      internal_notes: provisioningNotes,
      created_at: now,
      updated_at: now,
    } as SiteProject);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(table).insert(payload).select("*").single();

  if (error) throw new Error(`Falha ao salvar projeto: ${error.message}`);
  return data as SiteProject;
}

export async function getProject(id: string) {
  if (!isSupabaseConfigured()) return getLocalProject(id);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
  if (error) return null;
  return data as SiteProject;
}

export async function updateProject(id: string, values: Partial<SiteProject> & Record<string, unknown>) {
  if (!isSupabaseConfigured()) {
    const updated = await updateLocalProject(id, values);
    if (!updated) throw new Error("Projeto local nao encontrado.");
    return updated;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(table)
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(`Falha ao atualizar projeto: ${error.message}`);
  return data as SiteProject;
}

export async function updateProjectStatus(id: string, status: SiteStatus, extra: Record<string, unknown> = {}) {
  return updateProject(id, { status, ...extra });
}
