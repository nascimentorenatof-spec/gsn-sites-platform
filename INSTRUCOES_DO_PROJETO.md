# 🥷 Instruções do Projeto — GetSitesNinjas

> **Pra quem está lendo isso:** seja você o dono daqui a 6 meses, um dev contratado ou Claude voltando pra mexer no código — esse arquivo te coloca a par de TUDO em 15 min de leitura.

---

## 📌 1. Visão geral do negócio

**GetSitesNinjas** é um SaaS brasileiro que vende landing pages prontas pra MEIs e pequenos negócios (salões, dentistas, eletricistas, hamburguerias, coaches, etc).

**Modelo:**
- Cliente entra no site, preenche briefing curto (5 perguntas)
- IA (Claude) gera o site DELE personalizado em ~40 segundos
- Cliente vê preview no navegador
- Aprovou? Paga via PagSeguro (Pix/cartão/boleto) ou WhatsApp
- Dono baixa o HTML do painel admin, ajusta detalhes finais (fotos reais, cor exata) e publica

**Preços fixos:**
- Pacote Básico: **R$ 297** (1 página) + R$ 97/mês
- Pacote Padrão: **R$ 690** (até 4 páginas) + R$ 97/mês
- Manutenção mensal: **R$ 97/mês** (hospedagem + suporte)

**Tom de voz da marca:**
Direto, confiante, amigável, "ninja" (rápido, esperto, sem enrolação).
Linguagem brasileira popular, jeito paulista. Evitar termos corporativos ou em inglês.

**Cliente final típico:**
MEI ou pequeno empresário, ~35-55 anos, acessa 90% pelo celular, tem pouca paciência, tem pouco dinheiro, já tentou fazer site antes e não foi. Pergunta-chave a cada decisão de UX: *"Será que minha mãe conseguiria usar isso?"*

---

## 🏗️ 2. Stack & Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (cliente)                                           │
│  ─ index.html       (vitrine institucional)                  │
│  ─ criar.html       (jornada de criação: briefing → preview) │
│  ─ admin.html       (painel do dono)                         │
└──────────────┬──────────────────────────────────────────────┘
               │ fetch JSON
               ▼
┌─────────────────────────────────────────────────────────────┐
│  Vercel Serverless Functions  (Node.js, ESM)                 │
│  ─ /api/gerar.js              → Anthropic Claude (gera HTML) │
│  ─ /api/pagamento.js          → PagSeguro v4 (cria order)    │
│  ─ /api/webhook-pagseguro.js  → recebe notif de pagamento   │
│  ─ /api/admin/login.js        → autentica dono               │
│  ─ /api/admin/logout.js                                       │
│  ─ /api/admin/leads.js        → lista/atualiza leads         │
│  ─ /api/admin/lead-html.js    → serve HTML do site gerado    │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│  Upstash Redis (KV via REST)  — banco de dados              │
│  ─ leads:zset                  (índice de leads por data)    │
│  ─ lead:{id}                   (JSON do lead + html)         │
│  ─ stats:visitas / gerados / pagos                           │
└─────────────────────────────────────────────────────────────┘
```

**Stack escolhida e POR QUÊ:**

| Camada | Tecnologia | Por quê |
|---|---|---|
| Frontend | HTML + Tailwind CDN + Vanilla JS | Zero build, zero framework, carregamento instantâneo, qualquer dev mexe |
| Backend | Vercel Serverless (Node ESM) | Deploy automático no push, free tier generoso, sem servidor pra manter |
| IA | Anthropic Claude Sonnet 4.6 | Melhor pra HTML+texto em PT-BR, ~$0.05 por preview gerado |
| Banco | Upstash Redis (REST API) | 1 clique no Marketplace Vercel, 10k req/dia grátis, schema simples |
| Pagamento | PagSeguro/PagBank v4 (Orders API) | Pix nativo, padrão BR, sem precisar de Stripe |
| Hospedagem | Vercel | CDN global, SSL auto, deploy via `git push`, custom domain fácil |
| Repo | GitHub `nascimentorenatof-spec/gsn-sites-platform` | Branch `main` é produção |

---

## 📂 3. Estrutura de arquivos

```
getsitesninjas/
├── index.html                 # Vitrine (página inicial)
├── criar.html                 # Jornada do cliente: briefing → preview → pagamento
├── admin.html                 # Painel admin (login + dashboard)
│
├── api/
│   ├── gerar.js               # Proxy Anthropic + salva lead no banco
│   ├── pagamento.js           # Cria order no PagSeguro
│   ├── webhook-pagseguro.js   # Recebe notificação de pagamento confirmado
│   ├── _lib/
│   │   ├── db.js              # Helper Upstash Redis (REST)
│   │   └── auth.js            # Cookie HttpOnly + senha admin
│   └── admin/
│       ├── login.js           # POST { senha } → set cookie
│       ├── logout.js          # Limpa cookie
│       ├── leads.js           # GET lista / POST atualiza
│       └── lead-html.js       # GET HTML do site (renderiza ou baixa)
│
├── package.json               # Dependência: @anthropic-ai/sdk
├── vercel.json                # framework: null (não é Next.js)
├── .env.example               # Modelo das env vars
├── .gitignore
│
├── LEIA-ME.md                 # Setup geral (deploy, domínio)
├── COMO-PUBLICAR.md           # Fluxo operacional dono → cliente
└── INSTRUCOES_DO_PROJETO.md   # ESTE arquivo
```

> **Importante:** o repo do GitHub também tem a branch `backup-projeto-antigo` com a versão Python/Supabase anterior. Não deletar.

---

## 🔧 4. Variáveis de ambiente

Configurar todas em **Vercel → Settings → Environment Variables**.

| Variável | Obrigatória | O que é |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Sim | Chave da API Anthropic. Sem ela, /api/gerar quebra. |
| `ADMIN_SENHA` | ✅ Sim | Senha do painel admin (qualquer string forte). |
| `KV_REST_API_URL` | ✅ Sim* | URL do Upstash Redis. *Injetada automaticamente quando conecta o database via Marketplace. |
| `KV_REST_API_TOKEN` | ✅ Sim* | Token Bearer do Upstash. Idem acima. |
| `PAGSEGURO_TOKEN` | 🟡 Opcional | Token de produção do PagBank. Sem ele, fluxo cai no fallback do WhatsApp. |
| `PAGSEGURO_SANDBOX` | 🟡 Opcional | `"true"` (sandbox) ou `"false"` (produção). Default: sandbox. |
| `PAGSEGURO_ENV` | 🟡 Opcional | Alternativa: `"sandbox"` ou `"production"` (mesmo efeito que PAGSEGURO_SANDBOX). |

> **Nota PagSeguro:** contas novas precisam pedir pro suporte ativar acesso à **API Orders v4** em produção (whitelist). Mensagem padrão pra suporte está no `LEIA-ME.md`.

Local: copia `.env.example` pra `.env.local` (gitignored).

---

## 🚀 5. Deploy

**O fluxo é automático via Git:**

```bash
git add .
git commit -m "feat: descrição da mudança"
git push                        # → branch main
                                # → Vercel detecta → build em ~30s → live
```

**Pra rodar local:**

```bash
npm install
npx vercel dev                  # roda em http://localhost:3000
```

> Precisa do CLI da Vercel: `npm i -g vercel` (uma vez).

**Pra rollback rápido:**

Vercel → Deployments → escolhe um deploy anterior → ⋯ → **Promote to Production**.

---

## 🧠 6. Como cada componente funciona

### 6.1 Vitrine (`index.html`)

Site institucional puro. Sem JS pesado, sem APIs. Tem:
- Header sticky + WhatsApp button
- Hero com CTA principal pra `/criar.html`
- Seções: Como funciona, Exemplos, Pacotes, Depoimentos, Garantia, FAQ, CTA final
- Footer + botão flutuante WhatsApp (mandatório por regra de marca)

**Edição rápida:** procura por `🔧 EDITAR AQUI` no código pra achar todos os pontos editáveis (preços, depoimentos, FAQ, número WhatsApp).

### 6.2 Jornada de criação (`criar.html`)

State machine vanilla JS com 5 estados:

1. **BRIEFING** — 5 etapas (nome → cidade/zap → objetivo → estilo → serviços)
2. **GERANDO** — loading enquanto chama `/api/gerar`
3. **PREVIEW** — iframe com `srcdoc` mostrando HTML gerado pela IA + botões "Aprovar" / "Refazer"
4. **PAGAMENTO** — escolhe pacote → POST `/api/pagamento` → redirect pro PagSeguro
5. **OBRIGADO** — confirmação

**Retry automático:** se `/api/gerar` der 504/502 (cold start), tenta de novo até 3 vezes. Se tudo falhar, manda lead pelo WhatsApp.

### 6.3 Painel admin (`admin.html`)

Login + dashboard num único arquivo. Auto-detecta se cookie do admin é válido (faz GET `/api/admin/leads` ao carregar).

**Funcionalidades:**
- Cards de stats (previews gerados, pagamentos, em produção, R$ recebido)
- Filtros por status (cores) + busca textual
- Tabela com WhatsApp clicável
- Modal de detalhe: briefing completo + observações editáveis + botões de ação:
  - 👁️ Ver site gerado / 📥 Baixar HTML
  - ▶️ Em produção / ✅ Entregue / 💰 Pago manualmente / ❌ Cancelar / 💾 Salvar obs

### 6.4 `/api/gerar.js`

1. Recebe briefing JSON
2. Monta prompt pro Claude Sonnet 4.6 com system prompt afinado pra MEI brasileiro
3. `max_tokens: 4096`, `temperature: 0.7` (rápido o suficiente pra caber em 60s)
4. Limpa cercas de markdown caso a IA escorregue
5. Salva lead + HTML completo no Redis (`html_preview`)
6. Incrementa contador `stats:gerados`
7. Retorna `{ html, leadId }`

**Custo:** ~$0.02-$0.05 por preview gerado.

### 6.5 `/api/pagamento.js`

1. Recebe `{ pacote, briefing, leadId }`
2. Atualiza lead pra status `pagamento_iniciado`
3. **Se PAGSEGURO_TOKEN não configurado:** monta msg WhatsApp com tudo, retorna `wa.me/...`
4. **Senão:** chama `POST /orders` da API PagBank v4 com customer + items
5. Retorna `{ checkout_url }` que o front usa pra `window.location = checkout_url`

**Fallback inteligente:** se PagSeguro retornar erro (token bloqueado, whitelist), também cai no WhatsApp. **Zero venda perdida.**

### 6.6 `/api/webhook-pagseguro.js`

1. PagBank chama essa URL quando pagamento muda de status
2. Lê `reference_id` do payload
3. Busca lead pelo reference no Redis
4. Mapeia status PagBank → status interno:
   - `PAID` → `pagamento_confirmado` + incrementa `stats:pagos`
   - `CANCELED`/`DECLINED` → `cancelado`
5. Sempre retorna 200 (PagBank reentrega se receber não-200)

> Cadastrar URL `https://getsitesninjas.com.br/api/webhook-pagseguro` no painel PagBank → Integrações → Gestão de preferências. **Bug do PagBank:** o validador da regex no painel deles rejeita `.com.br` — workaround documentado no LEIA-ME.

### 6.7 `/api/admin/*`

Tudo protegido por `exigirAdmin(req, res)` que checa cookie `gsn_admin` (HSA-256 da senha). Retorna 401 se inválido.

**Endpoints:**
- `POST /login` body `{senha}` → set-cookie + 200
- `POST /logout` → clear cookie
- `GET /leads` → lista (sem html_preview pra economizar bandwidth)
- `POST /leads` body `{id, ...campos}` → atualiza lead (status, observações)
- `GET /lead-html?id=xxx` → renderiza HTML do site
- `GET /lead-html?id=xxx&download=1` → força download como `.html`

---

## 💾 7. Estrutura do banco (Redis)

```
leads:zset            ZSET   member=leadId, score=timestamp
                             → ZREVRANGE retorna mais novos primeiro

lead:{id}             STRING JSON do lead:
                       {
                         id: "moqmjuk...",
                         status: "preview_gerado" | "pagamento_iniciado" | ...,
                         briefing: { nome, segmento, cidade, whatsapp, email,
                                     objetivo, estilo, cor, servicos, diferencial },
                         html_preview: "<!DOCTYPE html>...",
                         html_preview_chars: 9747,
                         pacote: "basico" | "padrao",
                         pacote_nome: "GetSitesNinjas — Pacote Básico",
                         valor_centavos: 29700,
                         pagseguro_reference: "gsn-...",
                         pagseguro_order_id: "...",
                         pagseguro_status_cobranca: "PAID",
                         pagseguro_pago_em: 1714832...,
                         observacoes: "anotações internas do dono",
                         criado_em: 1714832...,
                         atualizado_em: 1714832...
                       }

stats:visitas          INT    contador
stats:gerados          INT    incrementado a cada preview
stats:pagos            INT    incrementado a cada PAID via webhook
```

**Status possíveis (constante `STATUS` em `db.js`):**

```
briefing_iniciado     → cliente começou (raro chegar nesse, geralmente já cria como preview_gerado)
preview_gerado        → IA gerou, cliente vendo
pagamento_iniciado    → cliente clicou em pagar
pagamento_confirmado  → PagBank confirmou via webhook
em_producao           → você começou os ajustes finais
entregue              → site no ar
cancelado             → desistiu / reembolso
```

---

## ✅ 8. Convenções de código

**Geral:**
- Português brasileiro **com acentos corretos** em TODA UI (rápido, negócio, serviço, são, não, etc). É regra de marca.
- Comentários em português, claros e curtos
- `🔧 EDITAR AQUI` marca pontos que o dono pode editar sem mexer em lógica

**HTML:**
- Tailwind CDN apenas, sem CSS bruto desnecessário
- Mobile-first sempre (90% dos visitantes são celular)
- Botão flutuante WhatsApp **OBRIGATÓRIO** em todas as páginas públicas

**JS:**
- Vanilla, sem framework
- ESM nas funções serverless (`import`/`export`)
- `async/await`, sem Promise chains complexas
- Tratamento de erro: nunca quebrar o fluxo de venda. Se DB cai, segue. Se IA cai, retry. Se PagSeguro cai, fallback WhatsApp.

**Cores da marca (Tailwind config):**
```js
ninja.dark   = '#0f172a'  // azul escuro
ninja.green  = '#22c55e'  // verde principal
ninja.green2 = '#16a34a'  // verde hover
ninja.orange = '#f59e0b'  // laranja accent
ninja.soft   = '#f1f5f9'  // cinza claro de fundo
```

**Naming:**
- Endpoints REST: `/api/{recurso}` no plural
- Funções helper: `verbo` + `subjeito` (`salvarLead`, `buscarLead`)
- IDs gerados: timestamp em base36 + random (`novoLeadId()`)

---

## 🛠️ 9. Como adicionar novas features (exemplos)

### Exemplo A: adicionar campo "logo do cliente" no briefing

1. **`criar.html`** — adicionar `<input type="file" id="campo_logo">` na etapa 5
2. **`criar.html` (JS)** — em `coletarBriefing()`, ler arquivo como base64
3. **`api/gerar.js`** — passar logo no prompt: `LOGO (base64): ${briefing.logo}`
4. **`api/_lib/db.js`** — campo já é parte do `briefing`, salva automático
5. **`admin.html`** — no modal de detalhe, mostrar `<img src="${b.logo}">`

### Exemplo B: nova métrica "% conversão"

1. **`api/admin/leads.js`** — calcular `pagos / gerados` no GET
2. **`admin.html`** — adicionar card novo na seção de stats

### Exemplo C: notificar você no WhatsApp quando alguém paga

1. Cria `/api/_lib/notificar.js` com função que chama API do WhatsApp Business (ou Twilio, ou n8n webhook)
2. Em `webhook-pagseguro.js`, depois de marcar como `pagamento_confirmado`, chama `notificar(lead)`

### Exemplo D: galeria de templates pré-definidos

1. Criar `templates/{slug}.html` com 5-10 templates fixos
2. Em `criar.html`, no início, mostrar grid pra cliente escolher
3. Em `api/gerar.js`, se vier `template`, usar como `system` prompt secundário ("baseie-se nesse layout: ...")

---

## ⚠️ 10. Limites conhecidos / TODO

**Limitações atuais:**
- Vercel Hobby plan: 60s max por função → max_tokens limitado a 4096
- Upstash free: 10k requests/dia (~300 leads/dia)
- HTML do site fica todo no banco (cada lead pesa ~10kb) → considerar S3/Blob se passar de 1000 leads
- Sem cobrança recorrente automatizada — você cobra manualmente todo mês
- Sem editor visual no admin — você baixa e edita HTML manualmente
- Sem auto-deploy do site do cliente — você cria projeto Vercel separado manualmente

**Roadmap sugerido (em ordem de impacto):**

1. **Notificação no WhatsApp do dono** quando alguém paga (ganha tempo de resposta)
2. **Cobrança recorrente automática** dos R$ 97/mês via PagSeguro Subscription
3. **Editor visual no admin** — trocar foto/texto sem código (TipTap ou similar)
4. **Auto-publicar site do cliente** — botão "🚀 Publicar" cria projeto Vercel via API
5. **"Refazer com IA"** no admin — mais 1 botão pra gerar variação
6. **Galeria de templates** — cliente escolhe layout antes de personalizar
7. **Painel pro cliente final** — login dele pra ver site no ar e pedir ajustes
8. **Logs estruturados** — Vercel Analytics ou Logtail pra debugar produção

---

## 🆘 11. Troubleshooting comum

| Problema | Causa provável | Solução |
|---|---|---|
| `/api/gerar` retorna 504 | Cold start + IA demorada | Front já faz retry. Se persistir, reduzir `max_tokens` |
| `/api/gerar` retorna 500 "ANTHROPIC_API_KEY não configurada" | Env var não setada na Vercel | Configurar e fazer Redeploy |
| Painel admin: "Banco de dados não configurado" | Upstash não conectado | Storage → Connect → prefix `KV` |
| `/api/admin/login` sempre 401 | `ADMIN_SENHA` não setada | Setar env var + Redeploy |
| Build Vercel falha "No Next.js version detected" | Framework Preset errado | Settings → Build → Framework: **Other** + `vercel.json` com `framework: null` |
| PagSeguro: "ACCESS_DENIED whitelist" | Conta nova sem permissão na API v4 | Pedir liberação pro suporte PagBank |
| Lead antigo sem botão "Baixar HTML" funcionando | Foi gerado antes de salvar HTML | Cliente refaz briefing |
| Cliente reclama que site sumiu | Mensalidade vencida (futuro) | Hoje: nada acontece. TODO: implementar bloqueio. |

**Pra debugar:**
- Logs em **Vercel → Logs** (filtrar por `/api/gerar` ou erro)
- DevTools do browser → Network → ver request/response da API
- Console do navegador → ver erros JS

---

## 📞 12. Contatos & links importantes

- **Domínio:** getsitesninjas.com.br (Registro.br)
- **Subdomínio Vercel:** gsn-sites-platform.vercel.app
- **Repo GitHub:** https://github.com/nascimentorenatof-spec/gsn-sites-platform
- **Vercel:** https://vercel.com/nascimentorenatof-specs-projects/gsn-sites-platform
- **Anthropic Console:** https://console.anthropic.com (chave + créditos)
- **Upstash Console:** abre via Vercel → Storage → upstash-kv-indigo-ridge → Open in Upstash
- **PagBank/PagSeguro:** https://minhaconta.pagbank.com.br
- **WhatsApp oficial:** (11) 93934-4180 → `5511939344180` no formato wa.me

**Documentações úteis:**
- Anthropic API: https://docs.claude.com
- Vercel Functions: https://vercel.com/docs/functions
- Upstash REST: https://docs.upstash.com/redis/features/restapi
- PagSeguro Orders v4: https://dev.pagbank.com.br/reference

---

## 🥷 13. Filosofia do projeto (a regra mais importante)

> **Mantenha tudo extremamente simples, leve e fácil de manter.**

Esse projeto **não é uma startup com 10 devs**. É uma fonte de renda extra do Renato, que trabalha à noite e fim de semana. Cada feature nova precisa passar pelo filtro:

1. **Posso entregar isso em 1 noite?** Se não, divide em pedaços menores.
2. **Vai aumentar conversão ou diminuir trabalho operacional?** Se não, deixa pra depois.
3. **Adiciona dependência nova?** Pensa 3 vezes. Cada lib é mais 1 coisa que pode quebrar.
4. **Posso explicar pra um leigo em 30 segundos?** Se não, simplifica.

**Anti-padrões a evitar:**
- ❌ Frameworks pesados (Next.js, React em SSR, Vue) → vanilla JS resolve
- ❌ Microserviços → uma única pasta `api/` cabe tudo
- ❌ ORM → Redis com chaves simples basta
- ❌ Auth complexo (OAuth, JWT) → cookie HttpOnly com hash da senha resolve
- ❌ Build steps → Tailwind CDN, sem webpack/vite/etc
- ❌ Testes automatizados pra MVP → testar manualmente é mais rápido nessa escala

Quando duvidar entre 2 caminhos, **escolhe o mais simples**.

---

**Fim. Bora vender, ninja.** 🥷
