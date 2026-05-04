# GetSitesNinjas — SaaS que gera sites com IA

Site de venda de sites prontos. Cliente entra, faz briefing rápido, **a IA Claude gera um preview na hora**, ele aprova e paga via PagSeguro. Você só finaliza e entrega.

## Estrutura dos arquivos

```
getsitesninjas/
├── index.html              ← vitrine (página inicial)
├── criar.html              ← jornada do cliente (briefing → preview → pagamento)
├── api/
│   ├── gerar.js            ← chama Claude pra gerar o site (chave segura no servidor)
│   └── pagamento.js        ← cria checkout no PagSeguro
├── package.json            ← dependências (Anthropic SDK)
├── vercel.json             ← config de deploy
├── .env.example            ← modelo das variáveis de ambiente
└── .gitignore
```

---

## Deploy na Vercel — passo a passo (15 minutos)

### 1) Crie a conta e instale a CLI

- Vá em https://vercel.com/signup e crie conta com GitHub (mais fácil).
- Instale a CLI no seu computador (uma vez só):

```bash
npm i -g vercel
```

### 2) Pegue suas chaves

**Anthropic (obrigatório — sem isso a IA não roda):**
1. Vá em https://console.anthropic.com/settings/keys
2. Crie uma chave (começa com `sk-ant-api03-...`)
3. Coloque créditos na conta (US$ 5 já dão pra muitos previews)

**PagSeguro (pode deixar pra depois — funciona em modo WhatsApp por enquanto):**
1. Vá em https://acesso.pagseguro.uol.com.br/integration
2. Pegue o **token Bearer** (não confunda com chave de API antiga)
3. Comece com **sandbox** (testes) até funcionar tudo

### 3) Faça o deploy

Dentro da pasta do projeto, no terminal:

```bash
vercel
```

Responda as perguntas:
- *Set up and deploy?* → **Y**
- *Which scope?* → escolha sua conta
- *Link to existing project?* → **N**
- *Project name?* → `getsitesninjas`
- *Directory?* → **.** (ponto, pasta atual)
- *Override settings?* → **N**

Espera ~1 min. Vai te dar uma URL tipo `getsitesninjas.vercel.app`.

### 4) Configure as variáveis de ambiente

Na Vercel:
1. Abre o projeto → **Settings** → **Environment Variables**
2. Adiciona:
   - `ANTHROPIC_API_KEY` = sua chave da Anthropic
   - `PAGSEGURO_TOKEN` = seu token (deixa em branco se ainda não tem)
   - `PAGSEGURO_ENV` = `sandbox` (depois muda pra `production`)
3. Clica em **Save**.
4. Vai em **Deployments** → o último → **⋯** → **Redeploy** (pra ele ler as variáveis novas).

### 5) Conecte seu domínio `getsitesninjas.com.br`

1. Vercel → **Settings** → **Domains** → **Add**
2. Coloca `getsitesninjas.com.br`
3. Ele te mostra os DNS. Vai onde você comprou o domínio (Registro.br ou outro) e:
   - Aponta o registro **A** pra IP da Vercel (ele te dá), OU
   - Adiciona um registro **CNAME** apontando pra `cname.vercel-dns.com`
4. Em até 1h o domínio já tá funcionando com SSL grátis.

### 6) Testa

- Abre `seu-dominio.com.br/criar.html`
- Preenche o briefing
- A IA gera o preview
- Tenta o pagamento (vai pro WhatsApp se PagSeguro ainda não estiver configurado)

---

## Como rodar localmente (dev)

```bash
npm install
vercel dev
```

Acesse http://localhost:3000

> **Importante:** crie um arquivo `.env.local` (NÃO comite) com as suas variáveis pra testar o /api/gerar.

---

## Onde editar as coisas mais comuns

| O que | Onde | Linha aproximada |
|---|---|---|
| Número WhatsApp | `index.html` + `criar.html` + `api/pagamento.js` | busca por `WHATSAPP_NUMERO` |
| Preço dos pacotes | `api/pagamento.js` (objeto `PACOTES`) + `index.html` | linha ~13 |
| Cores da marca | `index.html` e `criar.html` (no `tailwind.config`) | topo |
| Prompt da IA | `api/gerar.js` (constante `SYSTEM_PROMPT`) | linha ~14 |
| Modelo da IA | `api/gerar.js` (constante `MODELO`) | linha ~10 |
| Textos da home | `index.html` (busca por 🔧 EDITAR AQUI) | espalhado |
| Depoimentos | `index.html` (seção DEPOIMENTOS) | meio do arquivo |

---

## Custo estimado por site gerado

- **Vercel:** grátis até 100GB de banda/mês.
- **Anthropic Claude Sonnet 4.5:** ~US$ 0,02 a US$ 0,05 por preview gerado.
- **PagSeguro:** taxa de ~3% a 5% sobre o valor pago, só quando vende.
- **Domínio:** ~R$ 40/ano (Registro.br).

> Conclusão: cada cliente que paga R$ 297 te custa uns R$ 0,30 de IA. Margem absurda.

---

## Painel admin (/admin.html) e banco de dados

O sistema agora tem painel admin que mostra todos os leads, status, valores e detalhes do briefing. Pra funcionar precisa de 2 coisas:

### 1) Definir senha do admin

No Vercel → Settings → Environment Variables, adiciona:
- `ADMIN_SENHA` = uma senha forte só sua

Depois faz Redeploy (Deployments → último → ⋯ → Redeploy).

### 2) Conectar Upstash Redis (banco de dados grátis)

1. Vercel → Project `gsn-sites-platform` → **Storage** → **Create Database**
2. Escolhe **Upstash** → **Redis** (free tier 10k requests/dia, sobra)
3. Conecta ao projeto. As env vars `KV_REST_API_URL` e `KV_REST_API_TOKEN` são adicionadas sozinhas.
4. Redeploy.
5. Acessa `getsitesninjas.com.br/admin.html` e usa sua `ADMIN_SENHA`.

### O que o painel mostra

- **Cards no topo:** total de visitas no /criar, previews gerados, pagamentos, em produção, R$ recebido
- **Tabela:** todos os leads ordenados do mais novo pro mais velho
- **Filtros por status:** só preview, iniciou pagto, pago/falta entregar, em produção, entregue, cancelado
- **Busca:** por nome, segmento, cidade
- **Detalhe do lead:** todo o briefing + observações internas + ações (marcar entregue, cancelar, abrir WhatsApp)

### Webhook do PagSeguro (pra marcar pago automaticamente)

Quando ativar o PagSeguro real (token configurado), cadastra essa URL como notificação:
```
https://getsitesninjas.com.br/api/webhook-pagseguro
```
Em: PagBank → Integrações → URLs de notificação. Aí toda vez que um cliente paga, o lead vira "PAGO" no painel automaticamente.

---

## Próximos passos (quando estiver escalando)

1. **Cobrança recorrente** dos R$ 97/mês — PagSeguro tem assinaturas, Mercado Pago também.
2. **Notificação no zap** quando lead pagar (cron + Twilio ou n8n).
3. **Cron de cobrança mensal** dos clientes ativos.
4. **Histórico de previews gerados** (salvar HTML pra refazer rápido).

Mas isso tudo vem depois. Por enquanto, foca em vender.

---

## Suporte

Qualquer dúvida ou bug, me chama. 🥷
