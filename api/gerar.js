// =====================================================================
// API/GERAR.JS — Função serverless da Vercel
// Recebe o briefing do cliente, chama o Claude (Anthropic) e devolve
// um HTML completo de landing page brasileira já pronto pra renderizar.
//
// 🔧 IMPORTANTE: a chave da Anthropic NUNCA fica no front. Ela vai numa
// variável de ambiente da Vercel chamada ANTHROPIC_API_KEY.
// =====================================================================

import Anthropic from '@anthropic-ai/sdk';
import { salvarLead, incrementar, dbConfigurado, STATUS } from './_lib/db.js';

// Modelo da Anthropic (Sonnet 4.6 — bom equilíbrio entre qualidade e velocidade)
const MODELO = 'claude-sonnet-4-6';

// Prompt mestre — ensina o Claude a gerar landing page brasileira que vende
const SYSTEM_PROMPT = `Você é um especialista em criar landing pages que vendem para pequenos negócios brasileiros (MEIs, salões, dentistas, eletricistas, coaches, hamburguerias, prestadores de serviço).

Sua tarefa: gerar UMA página HTML completa, em português brasileiro com TODOS OS ACENTOS CORRETOS, baseada no briefing do cliente.

REGRAS OBRIGATÓRIAS:
0. CONCISO: máximo 3500 tokens de saída. Sem comentários no HTML. Sem espaços e quebras desnecessárias. Use atributos curtos do Tailwind (ex: "p-4" em vez de "padding: 16px").
1. Saída: APENAS o código HTML completo, do <!DOCTYPE html> até </html>. NADA antes ou depois. Sem markdown, sem \`\`\`html, sem explicações.
2. Use Tailwind CSS oficial via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Mobile-first (90% dos visitantes vêm de celular).
4. Tudo num único arquivo — CSS inline ou via Tailwind, JS inline se necessário.
5. Português correto com acentuação completa (ex: "rápido", "negócio", "serviço", "São Paulo", "manutenção").
6. Botão flutuante de WhatsApp no canto inferior direito é OBRIGATÓRIO. Use o número do briefing no formato wa.me/55DDDNUMERO.

ESTRUTURA OBRIGATÓRIA (nessa ordem):
- <head> com title, meta description, meta viewport, Tailwind CDN.
- HEADER fixo com nome do negócio + botão "WhatsApp" verde.
- HERO grande com headline forte (foque no benefício pro cliente, não na empresa), subtítulo, 2 CTAs (1 verde grande "Falar no WhatsApp", 1 secundário).
- SEÇÃO SERVIÇOS/OFERTAS — cards com os serviços listados no briefing.
- SEÇÃO "POR QUE NÓS" / DIFERENCIAIS — 3 a 4 motivos curtos com ícones (use emoji).
- SEÇÃO DEPOIMENTOS — 2 ou 3 depoimentos curtos (gere depoimentos plausíveis para o nicho, com nome + bairro/cidade).
- SEÇÃO CONTATO — telefone, e-mail, cidade + botão grande verde de WhatsApp.
- FOOTER simples com nome do negócio + cidade + ano 2026.
- BOTÃO FLUTUANTE WHATSAPP fixo no canto inferior direito (z-50, animação pulse).

ESTILO VISUAL:
- Use Tailwind utilities. Nada de CSS complicado.
- Cores: paleta sóbria com 1 cor primária forte (de acordo com o estilo pedido) + 1 cor secundária + cinza/branco. Evite excesso de cores.
- Tipografia: font-bold ou font-black para títulos, leading-tight, text-3xl ou text-5xl em mobile/desktop.
- Botões: rounded-xl, padding generoso (px-6 py-4), shadow leve, hover state.
- Espaçamento: py-16 ou py-24 entre seções. max-w-6xl mx-auto px-4 nos containers.

COPYWRITING (português BR popular):
- Linguagem simples, direta, brasileira. Sem termos corporativos. Sem inglês.
- Títulos curtos e fortes. Foque no que o cliente GANHA, não no que você FAZ.
- Use gatilhos: urgência ("hoje mesmo"), prova social ("+100 clientes"), simplicidade ("rápido", "fácil"), garantia.
- Inclua de 2 a 4 CTAs ao longo da página, todos puxando pra WhatsApp.

ESTILOS POR PREFERÊNCIA:
- "Moderno e clean" → fundo branco, primária verde-esmeralda (#10b981) ou azul (#3b82f6), bastante respiro.
- "Sério e profissional" → fundo branco/cinza claro, primária azul-marinho (#1e3a8a) ou cinza-escuro, formal.
- "Colorido e divertido" → fundos com gradientes vibrantes, primárias rosa/laranja/roxo, ícones grandes.
- "Elegante e luxo" → fundo preto ou bege, primária dourada (#d4af37) ou bordô, fontes serif via Google Fonts.

Se o cliente pedir uma cor específica, USE ESSA COR como primária.

NÃO INCLUA:
- localStorage / sessionStorage
- Imagens externas (use emoji ou placeholders coloridos)
- Bibliotecas além do Tailwind CDN
- Comentários explicativos no código

Lembre: o objetivo é uma página que faça o visitante clicar no WhatsApp e fechar negócio.`;

export default async function handler(req, res) {
  // só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // valida chave de API
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada na Vercel' });
  }

  try {
    const briefing = req.body || {};

    // valida campos mínimos
    if (!briefing.nome || !briefing.segmento) {
      return res.status(400).json({ error: 'Briefing incompleto: faltam nome e/ou segmento.' });
    }

    // monta prompt do usuário com o briefing
    const userPrompt = `Crie a landing page para esse cliente:

NOME DO NEGÓCIO: ${briefing.nome}
RAMO/O QUE VENDE: ${briefing.segmento}
CIDADE: ${briefing.cidade || 'São Paulo - SP'}
WHATSAPP: ${briefing.whatsapp || ''}
E-MAIL: ${briefing.email || ''}
OBJETIVO PRINCIPAL: ${briefing.objetivo || 'Receber clientes pelo WhatsApp'}
ESTILO: ${briefing.estilo || 'Moderno e clean'}
COR PREFERIDA: ${briefing.cor || 'à sua escolha (combine com o ramo)'}
SERVIÇOS OFERECIDOS:
${briefing.servicos || 'Use sua criatividade baseado no ramo.'}
DIFERENCIAL: ${briefing.diferencial || 'qualidade e atendimento'}

Gere o HTML completo agora. Lembre: APENAS o código, do <!DOCTYPE html> ao </html>.`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // 🔧 max_tokens 4096 = ~30s na Vercel (cabe na maxDuration de 60s mesmo com cold start)
    //    Se quiser HTML maior, suba pra 6000 mas pode dar timeout em primeira chamada do dia.
    const message = await client.messages.create({
      model: MODELO,
      max_tokens: 4096,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    });

    // pega o texto da resposta
    let html = message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    // remove cercas de código markdown se o modelo escorregar
    html = html.trim()
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '');

    // segurança: garante que começa com <!DOCTYPE ou <html
    if (!/^<!DOCTYPE|^<html/i.test(html)) {
      const idx = html.search(/<!DOCTYPE|<html/i);
      if (idx >= 0) html = html.slice(idx);
    }

    // === SALVA O LEAD NO BANCO (não bloqueia se DB falhar) ===
    let leadId = null;
    if (dbConfigurado()) {
      try {
        const lead = await salvarLead({
          status: STATUS.PREVIEW_GERADO,
          briefing,
          html_preview: html,                  // 🔧 salva o HTML completo pra você baixar depois
          html_preview_chars: html.length
        });
        leadId = lead.id;
        await incrementar('gerados');
      } catch (dbErr) {
        console.error('Erro ao salvar lead:', dbErr.message);
      }
    }

    return res.status(200).json({ html, leadId });

  } catch (err) {
    console.error('Erro ao gerar site:', err);
    return res.status(500).json({
      error: 'Erro ao gerar o site',
      detalhe: err.message
    });
  }
}
