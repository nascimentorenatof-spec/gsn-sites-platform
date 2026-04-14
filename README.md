# GSN Sites Platform

Plataforma Next.js para criacao automatizada de landing pages simples com formulario, upload de imagens, geracao com IA, preview e checkout.

## Arquitetura

- Next.js App Router
- API routes serverless
- Supabase Postgres
- Supabase Storage
- OpenAI Responses API
- Checkout mock, Mercado Pago ou Stripe
- Deploy recomendado na Vercel
- Dominio gerenciado pela Hostinger via DNS

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Antes de gerar sites reais, execute `supabase/schema.sql` no Supabase e configure as envs.

## Validar

```bash
npm run typecheck
npm run build
```

## Documentacao operacional

Leia `INSTRUCOES_DEPLOY_APIS.md` para configurar APIs, banco, storage, pagamentos, deploy e DNS.
