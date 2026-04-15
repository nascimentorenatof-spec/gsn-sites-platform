"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { segments, visualStyles } from "@/lib/catalog";
import type { AdminScope, ContactPreference, SiteObjective, SitePlan, StructuredSiteFormInput } from "@/lib/types";

type FormState = {
  businessName: string;
  segment: string;
  region: string;
  whatsapp: string;
  email: string;
  instagram: string;
  offerSummary: string;
  offerItems: string;
  mainOffer: string;
  contactPreference: ContactPreference;
  customer: string;
  problem: string;
  differentiator: string;
  visualStyle: string;
  primaryColor: string;
  referenceSite: string;
  objective: SiteObjective;
  plan: SitePlan;
  pages: string[];
  desiredDomain: string;
  alreadyHasDomain: boolean;
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

type Step = {
  title: string;
  caption: string;
};

const steps: Step[] = [
  { title: "Sobre o negocio", caption: "Dados essenciais para identificar sua empresa." },
  { title: "Oferta", caption: "O que voce vende e como o cliente deve chamar." },
  { title: "Posicionamento", caption: "Contexto para a IA escrever melhor." },
  { title: "Estilo", caption: "Direcao visual da primeira versao." },
  { title: "Objetivo", caption: "O que esse site precisa fazer primeiro." },
  { title: "Estrutura", caption: "Plano e paginas do projeto." },
  { title: "Dominio", caption: "Endereco desejado para publicacao." },
  { title: "IA", caption: "Regras para completar e gerar textos." },
];

const contactOptions: Array<{ value: ContactPreference; label: string }> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "form", label: "Formulario" },
  { value: "both", label: "Ambos" },
];

const objectiveOptions: Array<{ value: SiteObjective; label: string }> = [
  { value: "generate_leads", label: "Gerar contatos" },
  { value: "receive_messages", label: "Receber mensagens" },
  { value: "present_company", label: "Apresentar empresa" },
  { value: "sell_services", label: "Vender servicos" },
];

const pageOptions = ["Home", "Sobre", "Servicos", "Contato"];
const defaultAdminScope: AdminScope[] = ["texts", "images", "services", "prices", "contact_info", "faq", "testimonials", "seo_basic"];

function getInitialPlan(plan: string | null): SitePlan {
  return plan === "basic" ? "basic" : "standard";
}

function buildPayload(state: FormState): StructuredSiteFormInput {
  return {
    business: {
      name: state.businessName.trim(),
      segment: state.segment,
      region: state.region.trim(),
    },
    contact: {
      whatsapp: state.whatsapp.trim(),
      email: state.email.trim() || undefined,
      instagram: state.instagram.trim() || undefined,
      preferred: state.contactPreference,
    },
    offer: {
      summary: state.offerSummary.trim(),
      items: state.offerItems.trim(),
      mainItem: state.mainOffer.trim(),
    },
    audience: {
      customer: state.customer.trim(),
      problem: state.problem.trim(),
      differentiator: state.differentiator.trim(),
    },
    branding: {
      visualStyle: state.visualStyle,
      primaryColor: state.primaryColor.trim() || "#16a34a",
      referenceSite: state.referenceSite.trim() || undefined,
    },
    structure: {
      plan: state.plan,
      pages: state.plan === "basic" ? ["Home"] : state.pages,
      objective: state.objective,
    },
    domain: {
      desiredDomain: state.desiredDomain.trim() || undefined,
      alreadyHasDomain: state.alreadyHasDomain,
      createDomainEmailArea: state.createDomainEmailArea,
      createWebmailShortcut: state.createWebmailShortcut,
    },
    generation_rules: {
      generateAiTexts: state.generateAiTexts,
      allowAiCompletion: state.allowAiCompletion,
      createAdminArea: state.createAdminArea,
      adminScope: state.adminScope,
      createClientPortal: state.createClientPortal,
      createLeadInbox: state.createLeadInbox,
      createMediaLibrary: state.createMediaLibrary,
      createDomainEmailArea: state.createDomainEmailArea,
      createWebmailShortcut: state.createWebmailShortcut,
      allowLayoutEdit: state.allowLayoutEdit,
      allowBlockToggle: state.allowBlockToggle,
      createRevisionHistory: state.createRevisionHistory,
      createDraftAndPublishedVersions: state.createDraftAndPublishedVersions,
      generateDefaultPrivacyPolicy: state.generateDefaultPrivacyPolicy,
      generateDefaultSeo: state.generateDefaultSeo,
      fallbackToAiForMissingFields: state.fallbackToAiForMissingFields,
    },
  };
}

function applyPlanPages(plan: SitePlan, pages: string[]) {
  return plan === "basic" ? ["Home"] : pages.length > 0 ? pages : ["Home", "Servicos", "Contato"];
}

export function CreateSiteForm() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<FileList | null>(null);
  const [state, setState] = useState<FormState>(() => {
    const plan = getInitialPlan(searchParams.get("plan"));

    return {
      businessName: "",
      segment: "",
      region: "",
      whatsapp: "",
      email: "",
      instagram: "",
      offerSummary: "",
      offerItems: "",
      mainOffer: "",
      contactPreference: "whatsapp",
      customer: "",
      problem: "",
      differentiator: "",
      visualStyle: "",
      primaryColor: "#16a34a",
      referenceSite: "",
      objective: "generate_leads",
      plan,
      pages: applyPlanPages(plan, []),
      desiredDomain: "",
      alreadyHasDomain: false,
      generateAiTexts: true,
      allowAiCompletion: true,
      createAdminArea: true,
      adminScope: defaultAdminScope,
      createClientPortal: true,
      createLeadInbox: true,
      createMediaLibrary: true,
      createDomainEmailArea: true,
      createWebmailShortcut: true,
      allowLayoutEdit: false,
      allowBlockToggle: true,
      createRevisionHistory: true,
      createDraftAndPublishedVersions: true,
      generateDefaultPrivacyPolicy: true,
      generateDefaultSeo: true,
      fallbackToAiForMissingFields: true,
    };
  });

  const progress = useMemo(() => Math.round(((currentStep + 1) / steps.length) * 100), [currentStep]);
  const payload = useMemo(() => buildPayload(state), [state]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function selectPlan(plan: SitePlan) {
    setState((current) => ({
      ...current,
      plan,
      pages: applyPlanPages(plan, current.pages),
    }));
  }

  function togglePage(page: string) {
    setState((current) => {
      const pages = current.pages.includes(page) ? current.pages.filter((item) => item !== page) : [...current.pages, page];
      return { ...current, pages };
    });
  }

  function nextStep() {
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    setStatus("");
  }

  function previousStep() {
    setCurrentStep((step) => Math.max(step - 1, 0));
    setStatus("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("Montando um preview vendavel com IA...");

    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      if (images) {
        Array.from(images).forEach((file) => {
          if (file.size > 0) formData.append("images", file);
        });
      }

      const response = await fetch("/api/generate-site", {
        method: "POST",
        body: formData,
      });
      const responsePayload = (await response.json()) as { ok: boolean; error?: string; previewUrl?: string; errors?: Record<string, string> };

      if (!response.ok || !responsePayload.ok) {
        const message = responsePayload.errors ? Object.values(responsePayload.errors).join(" ") : responsePayload.error || "Nao foi possivel gerar o site.";
        throw new Error(message);
      }

      window.location.href = responsePayload.previewUrl || "/";
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro inesperado.");
      setIsSubmitting(false);
    }
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <form className="site-form wizard-form" onSubmit={submit}>
      <div className="wizard-header wide">
        <div>
          <p className="eyebrow">Etapa {currentStep + 1} de {steps.length}</p>
          <h2>{step.title}</h2>
          <p>{step.caption}</p>
        </div>
        <div className="progress-summary">
          <strong>{progress}%</strong>
          <span>preenchido</span>
        </div>
      </div>

      <div className="progress-bar wide" aria-label={`Progresso: ${progress}%`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      {currentStep === 0 && (
        <div className="form-step wide">
          <label>
            Nome do negocio
            <input value={state.businessName} onChange={(event) => update("businessName", event.target.value)} maxLength={90} required placeholder="Ex: Studio Luna" />
          </label>
          <label>
            Segmento
            <select value={state.segment} onChange={(event) => update("segment", event.target.value)} required>
              <option value="" disabled>
                Selecione
              </option>
              {segments.map((segment) => (
                <option key={segment} value={segment}>
                  {segment}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cidade/regiao
            <input value={state.region} onChange={(event) => update("region", event.target.value)} maxLength={120} required placeholder="Ex: Sao Paulo e regiao" />
          </label>
          <label>
            WhatsApp
            <input value={state.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} maxLength={40} required inputMode="tel" placeholder="Ex: 11 99999-9999" />
          </label>
          <label>
            Email opcional
            <input value={state.email} onChange={(event) => update("email", event.target.value)} maxLength={120} type="email" placeholder="contato@empresa.com.br" />
          </label>
          <label>
            Instagram opcional
            <input value={state.instagram} onChange={(event) => update("instagram", event.target.value)} maxLength={80} placeholder="@suaempresa" />
          </label>
        </div>
      )}

      {currentStep === 1 && (
        <div className="form-step wide">
          <label className="wide">
            O que voce vende?
            <input value={state.offerSummary} onChange={(event) => update("offerSummary", event.target.value)} maxLength={220} required placeholder="Ex: Tratamentos esteticos faciais e corporais" />
          </label>
          <label className="wide">
            Lista de servicos/produtos
            <textarea value={state.offerItems} onChange={(event) => update("offerItems", event.target.value)} minLength={5} maxLength={700} required placeholder="Liste os principais servicos, separados por virgula ou linha." />
          </label>
          <label>
            Principal servico/produto
            <input value={state.mainOffer} onChange={(event) => update("mainOffer", event.target.value)} maxLength={120} required placeholder="Ex: Limpeza de pele premium" />
          </label>
          <label>
            Tipo de contato desejado
            <select value={state.contactPreference} onChange={(event) => update("contactPreference", event.target.value as ContactPreference)} required>
              {contactOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {currentStep === 2 && (
        <div className="form-step wide">
          <label className="wide">
            Quem e seu cliente?
            <input value={state.customer} onChange={(event) => update("customer", event.target.value)} maxLength={160} required placeholder="Ex: Mulheres de 25 a 45 anos que querem cuidar da pele" />
          </label>
          <label className="wide">
            Qual problema voce resolve?
            <textarea value={state.problem} onChange={(event) => update("problem", event.target.value)} minLength={10} maxLength={500} required placeholder="Ex: Ajudo clientes que querem melhorar a autoestima com atendimento seguro e personalizado." />
          </label>
          <label className="wide">
            Diferencial do negocio
            <textarea value={state.differentiator} onChange={(event) => update("differentiator", event.target.value)} minLength={10} maxLength={500} required placeholder="Ex: Atendimento individual, equipamentos modernos e avaliacao antes de qualquer procedimento." />
          </label>
        </div>
      )}

      {currentStep === 3 && (
        <div className="form-step wide">
          <label>
            Estilo visual
            <select value={state.visualStyle} onChange={(event) => update("visualStyle", event.target.value)} required>
              <option value="" disabled>
                Selecione
              </option>
              {visualStyles.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cor principal
            <input className="color-input" value={state.primaryColor} onChange={(event) => update("primaryColor", event.target.value)} type="color" required />
          </label>
          <label className="wide">
            Referencia de site opcional
            <input value={state.referenceSite} onChange={(event) => update("referenceSite", event.target.value)} maxLength={160} placeholder="https://sitequevocegosta.com.br" />
          </label>
          <label className="wide">
            Imagens opcionais
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => setImages(event.target.files)} />
          </label>
        </div>
      )}

      {currentStep === 4 && (
        <div className="form-step wide compact-step">
          <label>
            Qual objetivo do site?
            <select value={state.objective} onChange={(event) => update("objective", event.target.value as SiteObjective)} required>
              {objectiveOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="helper-panel">
            <h3>Por que isso importa?</h3>
            <p>A IA usa esse objetivo para escolher chamada principal, botoes, ordem das secoes e tom da copy.</p>
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <div className="form-step wide">
          <div className="choice-grid wide">
            <button className={`choice-card ${state.plan === "basic" ? "selected" : ""}`} type="button" onClick={() => selectPlan("basic")}>
              <span>Basico</span>
              <strong>1 pagina automatica</strong>
              <small>Mais rapido para validar presenca online.</small>
            </button>
            <button className={`choice-card ${state.plan === "standard" ? "selected" : ""}`} type="button" onClick={() => selectPlan("standard")}>
              <span>Padrao</span>
              <strong>Paginas separadas</strong>
              <small>Melhor para apresentar empresa, servicos e contato.</small>
            </button>
          </div>

          {state.plan === "standard" && (
            <fieldset className="checkbox-panel wide">
              <legend>Escolha as paginas</legend>
              {pageOptions.map((page) => (
                <label className="check" key={page}>
                  <input type="checkbox" checked={state.pages.includes(page)} onChange={() => togglePage(page)} />
                  {page}
                </label>
              ))}
            </fieldset>
          )}

          {state.plan === "basic" && (
            <div className="helper-panel wide">
              <h3>Estrutura automatica</h3>
              <p>O plano basico usa uma unica pagina com apresentacao, servicos e contato na mesma experiencia.</p>
            </div>
          )}
        </div>
      )}

      {currentStep === 6 && (
        <div className="form-step wide compact-step">
          <label>
            Dominio desejado
            <input value={state.desiredDomain} onChange={(event) => update("desiredDomain", event.target.value)} maxLength={120} placeholder="meunegocio.com.br" />
          </label>
          <label>
            Ja possui dominio?
            <select value={state.alreadyHasDomain ? "yes" : "no"} onChange={(event) => update("alreadyHasDomain", event.target.value === "yes")}>
              <option value="no">Nao</option>
              <option value="yes">Sim</option>
            </select>
          </label>
        </div>
      )}

      {currentStep === 7 && (
        <div className="form-step wide">
          <fieldset className="checkbox-panel wide">
            <legend>Regras de IA</legend>
            <label className="check">
              <input type="checkbox" checked={state.generateAiTexts} onChange={(event) => update("generateAiTexts", event.target.checked)} />
              Gerar textos automaticamente com IA
            </label>
            <label className="check">
              <input type="checkbox" checked={state.allowAiCompletion} onChange={(event) => update("allowAiCompletion", event.target.checked)} />
              Permitir IA completar informacoes faltantes
            </label>
          </fieldset>
          <div className="payload-preview wide">
            <h3>Dados preparados para API</h3>
            <p>O envio sera organizado em business, contact, offer, audience, branding, structure, domain e generation_rules.</p>
            <p>Todo projeto nasce preparado para admin, portal do cliente, leads, midia, dominio/email, historico e versao rascunho/publicada.</p>
          </div>
        </div>
      )}

      <div className="wizard-actions wide">
        <button className="button outline" type="button" onClick={previousStep} disabled={currentStep === 0 || isSubmitting}>
          Voltar
        </button>
        {!isLastStep ? (
          <button className="button primary" type="button" onClick={nextStep}>
            Continuar
          </button>
        ) : (
          <button className="button primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Gerando preview..." : "Gerar preview para comprar"}
          </button>
        )}
      </div>

      <p className="status-text wide" role="status">
        {status}
      </p>
    </form>
  );
}
