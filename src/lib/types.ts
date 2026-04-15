export type SiteStatus = "draft" | "preview" | "checkout_pending" | "paid" | "in_progress" | "delivered" | "failed" | "expired";

export type SitePlan = "basic" | "standard";

export type ContactPreference = "whatsapp" | "form" | "both";

export type SiteObjective = "generate_leads" | "receive_messages" | "present_company" | "sell_services";

export type AdminScope =
  | "texts"
  | "images"
  | "services"
  | "prices"
  | "contact_info"
  | "faq"
  | "testimonials"
  | "seo_basic";

export type GenerationRules = {
  generateAiTexts: boolean;
  allowAiCompletion: boolean;
  createAdminArea: boolean;
  adminScope: AdminScope[];
  createClientPortal: boolean;
  createLeadInbox: boolean;
  createMediaLibrary: boolean;
  createDomainEmailArea: boolean;
  createWebmailShortcut: boolean;
  allowLayoutEdit: boolean;
  allowBlockToggle: boolean;
  createRevisionHistory: boolean;
  createDraftAndPublishedVersions: boolean;
  generateDefaultPrivacyPolicy: boolean;
  generateDefaultSeo: boolean;
  fallbackToAiForMissingFields: boolean;
};

export type StructuredSiteFormInput = {
  business: {
    name: string;
    segment: string;
    region: string;
  };
  contact: {
    whatsapp: string;
    email?: string;
    instagram?: string;
    preferred: ContactPreference;
  };
  offer: {
    summary: string;
    items: string;
    mainItem: string;
  };
  audience: {
    customer: string;
    problem: string;
    differentiator: string;
  };
  branding: {
    visualStyle: string;
    primaryColor: string;
    referenceSite?: string;
  };
  structure: {
    plan: SitePlan;
    pages: string[];
    objective: SiteObjective;
  };
  domain: {
    desiredDomain?: string;
    alreadyHasDomain: boolean;
    createDomainEmailArea: boolean;
    createWebmailShortcut: boolean;
  };
  generation_rules: GenerationRules;
};

export type SiteFormInput = {
  businessName: string;
  segment: string;
  palette: string;
  visualStyle: string;
  description: string;
  services: string;
  region: string;
  contact: string;
  desiredDomain?: string;
  generateAiTexts: boolean;
  structuredData?: StructuredSiteFormInput;
};

export type UploadedAsset = {
  path: string;
  publicUrl: string;
  name: string;
  size: number;
  contentType: string;
};

export type GeneratedSiteContent = {
  heroTitle: string;
  heroSubtitle: string;
  primaryCta: string;
  aboutTitle: string;
  aboutText: string;
  benefits: string[];
  services: string[];
  proofTitle: string;
  proofText: string;
  contactTitle: string;
  contactText: string;
  seoTitle: string;
  seoDescription: string;
  faq: Array<{ question: string; answer: string }>;
  testimonials: Array<{ name: string; quote: string }>;
  privacyPolicy: string;
};

export type SiteProject = {
  id: string;
  status: SiteStatus;
  form_data: SiteFormInput;
  generated_content: GeneratedSiteContent;
  preview_html: string;
  assets: UploadedAsset[];
  payment_provider?: string | null;
  payment_reference?: string | null;
  checkout_url?: string | null;
  domain?: string | null;
  expires_at?: string | null;
  customer_notes?: string | null;
  requested_changes?: string | null;
  delivery_domain?: string | null;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type CheckoutResult = {
  provider: string;
  checkoutUrl: string;
  reference: string;
};
