export type SiteStatus = "draft" | "preview" | "checkout_pending" | "paid" | "in_progress" | "delivered" | "failed" | "expired";

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
