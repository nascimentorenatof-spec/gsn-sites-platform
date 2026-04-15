import { fallbackImage, palettes } from "@/lib/catalog";
import type { GeneratedSiteContent, SiteFormInput, UploadedAsset } from "@/lib/types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildFallbackContent(form: SiteFormInput): GeneratedSiteContent {
  const structured = form.structuredData;
  const services = form.services
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);

  return {
    heroTitle: structured?.offer.mainItem ? `${structured.offer.mainItem} com ${form.businessName}` : `${form.businessName}: resolva isso hoje em ${form.region}`,
    heroSubtitle: structured?.audience.problem ? `${structured.audience.problem} ${structured.audience.differentiator}` : `${form.description} Veja a oferta, tire a duvida e chame agora para dar o proximo passo.`,
    primaryCta: structured?.contact.preferred === "form" ? "Enviar mensagem" : "Chamar agora",
    aboutTitle: `Sobre ${form.businessName}`,
    aboutText: structured?.audience.customer
      ? `${form.businessName} atende ${structured.audience.customer} em ${form.region}, com uma oferta clara e um caminho simples para pedir atendimento.`
      : `${form.businessName} atende ${form.region} com foco em resposta rapida, oferta clara e um caminho simples para o cliente tomar decisao sem enrolacao.`,
    benefits: structured?.audience.differentiator
      ? ["Atendimento claro", structured.audience.differentiator, "Contato em destaque"]
      : ["Resposta mais rapida", "Oferta sem confusao", "Contato em destaque"],
    services: services.length > 0 ? services : ["Atendimento personalizado", "Orcamento rapido", "Proxima etapa guiada"],
    proofTitle: "Uma pagina feita para transformar interesse em contato",
    proofText: "O visitante entende o que voce oferece, por que vale falar com voce e qual botao precisa apertar agora.",
    contactTitle: "Pronto para avancar?",
    contactText: `Chame por ${form.contact} e garanta atendimento para ${form.segment.toLowerCase()} em ${form.region}.`,
    seoTitle: `${form.businessName} em ${form.region}`,
    seoDescription: form.description.slice(0, 155),
    faq: [
      {
        question: `Como funciona o atendimento da ${form.businessName}?`,
        answer: `Voce chama pelo contato indicado, explica o que precisa e recebe a orientacao para o proximo passo em ${form.region}.`,
      },
      {
        question: "Posso pedir um orcamento antes de contratar?",
        answer: "Sim. O primeiro contato serve para entender sua necessidade, alinhar detalhes e indicar a melhor opcao.",
      },
      {
        question: "Quais informacoes devo enviar?",
        answer: "Envie seu objetivo, prazo desejado e qualquer detalhe importante sobre o servico ou produto que procura.",
      },
    ],
    testimonials: [
      {
        name: "Cliente satisfeito",
        quote: "Atendimento claro, resposta rapida e uma experiencia simples desde o primeiro contato.",
      },
      {
        name: "Cliente da regiao",
        quote: "Foi facil entender os servicos e escolher o melhor caminho para avancar.",
      },
    ],
    privacyPolicy: `${form.businessName} utiliza os dados enviados pelo formulario apenas para responder contatos, preparar atendimentos e manter a comunicacao solicitada. As informacoes nao devem ser vendidas ou compartilhadas com terceiros sem necessidade operacional ou obrigacao legal.`,
  };
}

export function renderLandingPage(form: SiteFormInput, content: GeneratedSiteContent, assets: UploadedAsset[]) {
  const palette = palettes[form.palette as keyof typeof palettes] || palettes.verde;
  const structured = form.structuredData;
  const primaryColor = structured?.branding.primaryColor || palette.primary;
  const contactHref = structured?.contact.whatsapp
    ? `https://wa.me/${structured.contact.whatsapp.replace(/\D/g, "")}`
    : `mailto:${form.contact}`;
  const heroImage = assets[0]?.publicUrl || fallbackImage;
  const secondImage = assets[1]?.publicUrl || heroImage;
  const services = content.services.slice(0, 6);
  const benefits = content.benefits.slice(0, 4);
  const faq = content.faq.slice(0, 5);
  const testimonials = content.testimonials.slice(0, 3);

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(content.seoTitle)}</title>
  <meta name="description" content="${escapeHtml(content.seoDescription)}">
  <style>
    :root{--primary:${primaryColor};--secondary:${palette.secondary};--ink:${palette.ink};--surface:${palette.surface}}
    *{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:var(--ink);background:#fff}a{color:inherit}
    .hero{min-height:78vh;display:grid;align-items:end;padding:44px;background:linear-gradient(90deg,rgba(0,0,0,.7),rgba(0,0,0,.18)),url("${heroImage}") center/cover;color:#fff}
    .hero>div{max-width:780px}.eyebrow{text-transform:uppercase;letter-spacing:0;font-size:13px;font-weight:800;color:var(--secondary)}
    h1{font-size:clamp(38px,7vw,78px);line-height:.98;margin:10px 0 18px}h2{font-size:clamp(28px,4vw,48px);line-height:1.05;margin:0 0 16px}
    p{font-size:18px;line-height:1.55}.button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 20px;border-radius:8px;background:var(--secondary);color:#111;font-weight:800;text-decoration:none}
    section{padding:72px 44px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.card{border:1px solid #dfe5e1;border-radius:8px;padding:24px;background:#fff}
    .about{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center;background:var(--surface)}.about img{width:100%;height:440px;object-fit:cover;border-radius:8px}
    .contact{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;background:var(--primary);color:#fff}footer{padding:28px 44px;background:#111;color:#fff}
    @media(max-width:760px){.hero,section{padding:28px 18px}.grid,.about,.contact{grid-template-columns:1fr}.about img{height:280px}}
  </style>
</head>
<body>
  <main>
    <section class="hero"><div><p class="eyebrow">${escapeHtml(form.segment)} | ${escapeHtml(form.visualStyle)}</p><h1>${escapeHtml(content.heroTitle)}</h1><p>${escapeHtml(content.heroSubtitle)}</p><a class="button" href="#contato">${escapeHtml(content.primaryCta)}</a></div></section>
    <section><p class="eyebrow">Diferenciais</p><h2>${escapeHtml(content.proofTitle)}</h2><p>${escapeHtml(content.proofText)}</p><div class="grid">${benefits.map((benefit) => `<article class="card"><h3>${escapeHtml(benefit)}</h3><p>Informacao direta para ajudar o visitante a decidir com seguranca.</p></article>`).join("")}</div></section>
    <section class="about"><div><p class="eyebrow">Sobre</p><h2>${escapeHtml(content.aboutTitle)}</h2><p>${escapeHtml(content.aboutText)}</p></div><img src="${secondImage}" alt="${escapeHtml(form.businessName)}"></section>
    <section><p class="eyebrow">Servicos</p><h2>O que voce encontra aqui</h2><div class="grid">${services.map((service) => `<article class="card"><h3>${escapeHtml(service)}</h3><p>Atendimento pensado para resolver com clareza e agilidade.</p></article>`).join("")}</div></section>
    <section><p class="eyebrow">Depoimentos</p><h2>Confiança para dar o proximo passo</h2><div class="grid">${testimonials.map((testimonial) => `<article class="card"><h3>${escapeHtml(testimonial.name)}</h3><p>${escapeHtml(testimonial.quote)}</p></article>`).join("")}</div></section>
    <section><p class="eyebrow">Duvidas frequentes</p><h2>Perguntas comuns</h2><div class="grid">${faq.map((item) => `<article class="card"><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></article>`).join("")}</div></section>
    <section id="contato" class="contact"><div><p class="eyebrow">Contato</p><h2>${escapeHtml(content.contactTitle)}</h2><p>${escapeHtml(content.contactText)}</p></div><a class="button" href="${escapeHtml(contactHref)}">${escapeHtml(form.contact)}</a></section>
  </main>
  <footer>${escapeHtml(form.businessName)}. Atendimento em ${escapeHtml(form.region)}.<br><small>${escapeHtml(content.privacyPolicy)}</small></footer>
</body>
</html>`;
}
