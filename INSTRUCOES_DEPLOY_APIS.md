# Instrucoes de deploy, APIs e operacao

## Secao 1 - Visao da arquitetura

A arquitetura final escolhida e:

- Frontend e rotas em Next.js App Router.
- Backend minimo em Next.js Route Handlers, executando como funcoes serverless.
- Banco de dados e storage no Supabase.
- Geracao de conteudo via OpenAI Responses API.
- Checkout por provedor externo, com suporte implementado para mock, Mercado Pago e Stripe.
- Hostinger usada para dominio e DNS, nao para executar backend.
- Deploy recomendado na Vercel, porque ela publica Next.js e funcoes serverless com custo baixo e sem VPS.

Essa arquitetura substitui a primeira versao em Flask porque hospedagem compartilhada da Hostinger nao executa de forma confiavel um processo Python/Flask continuo. Sem VPS, a melhor solucao e tirar a execucao do backend da Hostinger e usar funcoes serverless sob demanda.

Papel de cada parte:

- Hostinger: manter o dominio comprado e configurar DNS.
- Vercel: hospedar o Next.js, servir frontend, executar funcoes `/api/*` e rotas dinamicas.
- Supabase: armazenar projetos gerados, dados do formulario, HTML do preview e imagens.
- OpenAI: gerar textos estruturados da landing page.
- Provedor de pagamento: criar checkout e confirmar pagamento via webhook.

Arquivos principais:

- `src/app/page.tsx`: pagina inicial.
- `src/app/create-site/page.tsx`: pagina do formulario.
- `src/components/CreateSiteForm.tsx`: formulario interativo.
- `src/app/api/generate-site/route.ts`: endpoint de geracao do site.
- `src/app/preview/[id]/page.tsx`: preview do site gerado.
- `src/app/api/checkout/route.ts`: criacao do checkout.
- `src/app/api/payment/webhook/route.ts`: confirmacao de pagamento.
- `src/app/api/payment/mock/route.ts`: simulacao local de pagamento.
- `src/lib/ai.ts`: chamada para IA.
- `src/lib/storage.ts`: upload de imagens para Supabase Storage.
- `src/lib/projects.ts`: leitura e gravacao no Supabase.
- `src/lib/site-renderer.ts`: geracao do HTML final da landing page.
- `supabase/schema.sql`: tabela e bucket necessarios no Supabase.

## Secao 2 - Variaveis de ambiente

Cadastre as variaveis na Vercel em:

`Project Settings > Environment Variables`

Cadastre tambem no `.env.local` para desenvolvimento local. Use `.env.example` como base.

Variaveis obrigatorias:

```bash
SITE_BASE_URL=
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STORAGE_BUCKET_NAME=
PAYMENT_PROVIDER=
```

Variaveis opcionais:

```bash
OPENAI_MODEL=
PAYMENT_PRICE_BRL=
PAYMENT_PRICE_CENTS=
PAYMENT_SUCCESS_URL=
PAYMENT_CANCEL_URL=
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
DOMAIN_PROVIDER_API_KEY=
```

Descricao exata:

- `SITE_BASE_URL`: URL publica do app. Em local, `http://localhost:3000`. Em producao, `https://seudominio.com.br`.
- `OPENAI_API_KEY`: chave da OpenAI usada em `src/lib/ai.ts`.
- `OPENAI_MODEL`: modelo usado para gerar textos. Padrao atual do projeto: `gpt-4.1-mini`.
- `SUPABASE_URL`: URL do projeto Supabase, usada em `src/lib/supabase.ts`.
- `SUPABASE_ANON_KEY`: chave publica anon do Supabase. Reservada para uso client-side futuro.
- `SUPABASE_SERVICE_ROLE_KEY`: chave privada usada somente nas funcoes serverless para inserir projetos e subir imagens. Nunca expor no browser.
- `STORAGE_BUCKET_NAME`: nome do bucket de imagens. Padrao: `site-assets`.
- `PAYMENT_PROVIDER`: `mock`, `mercadopago` ou `stripe`.
- `PAYMENT_PRICE_BRL`: preco em reais para Mercado Pago. Exemplo: `497`.
- `PAYMENT_PRICE_CENTS`: preco em centavos para Stripe. Exemplo: `49700`.
- `PAYMENT_SUCCESS_URL`: URL de retorno apos pagamento aprovado. Se vazio, usa `/success/<id>`.
- `PAYMENT_CANCEL_URL`: URL de retorno apos cancelamento. Se vazio, usa `/preview/<id>`.
- `MERCADOPAGO_ACCESS_TOKEN`: token privado para criar preferencias de checkout no Mercado Pago.
- `MERCADOPAGO_WEBHOOK_SECRET`: segredo para validar webhook. A validacao criptografica ainda deve ser endurecida antes de producao de alto volume.
- `STRIPE_SECRET_KEY`: chave secreta Stripe para criar Checkout Sessions.
- `STRIPE_WEBHOOK_SECRET`: segredo do webhook Stripe. A validacao bruta por assinatura deve ser adicionada se Stripe for o provedor escolhido.
- `DOMAIN_PROVIDER_API_KEY`: reservado para futura integracao com provedor de dominio/DNS. Nao usado no codigo atual.

Obrigatorias por ambiente:

- Desenvolvimento sem IA real: Supabase envs + `PAYMENT_PROVIDER=mock`. Sem `OPENAI_API_KEY`, o app usa fallback sem quebrar.
- Producao com IA: Supabase envs + `OPENAI_API_KEY` + `SITE_BASE_URL` + provedor de pagamento.
- Producao com Mercado Pago: adicionar `PAYMENT_PROVIDER=mercadopago` e `MERCADOPAGO_ACCESS_TOKEN`.
- Producao com Stripe: adicionar `PAYMENT_PROVIDER=stripe` e `STRIPE_SECRET_KEY`.

## Secao 3 - Conexao com APIs de IA

A conexao com IA acontece em:

`src/lib/ai.ts`

Funcao principal:

`generateSiteContent(form)`

Endpoint que usa a funcao:

`src/app/api/generate-site/route.ts`

Fluxo:

1. O usuario envia o formulario.
2. `/api/generate-site` valida os campos.
3. As imagens sao enviadas ao Supabase Storage.
4. `generateSiteContent` monta um prompt estruturado.
5. A funcao chama `https://api.openai.com/v1/responses`.
6. A resposta JSON e normalizada.
7. `renderLandingPage` monta o HTML.
8. O projeto e salvo em `site_projects`.

Payload enviado para a OpenAI:

- Modelo: `OPENAI_MODEL` ou `gpt-4.1-mini`.
- `max_output_tokens`: `1200`.
- `temperature`: `0.4`.
- Formato: `json_schema` estrito.
- Campos do formulario:
  - nome do negocio
  - segmento
  - estilo visual
  - descricao
  - servicos
  - regiao
  - contato

Resposta esperada:

```json
{
  "heroTitle": "string",
  "heroSubtitle": "string",
  "primaryCta": "string",
  "aboutTitle": "string",
  "aboutText": "string",
  "benefits": ["string", "string", "string"],
  "services": ["string", "string", "string"],
  "proofTitle": "string",
  "proofText": "string",
  "contactTitle": "string",
  "contactText": "string",
  "seoTitle": "string",
  "seoDescription": "string"
}
```

Tratamento de erro:

- Sem `OPENAI_API_KEY`: usa conteudo fallback.
- Timeout de 18 segundos: usa fallback.
- HTTP diferente de 200: usa fallback e registra `ai_log`.
- Resposta vazia: usa fallback.
- JSON invalido: usa fallback.

Como limitar custo:

- Manter `max_output_tokens` baixo.
- Usar modelo economico em `OPENAI_MODEL`.
- Gerar somente uma vez por envio de formulario.
- Salvar o resultado em `generated_content` para nao chamar a IA ao abrir preview.
- Nao chamar IA no preview.
- Nao chamar IA no checkout.
- Adicionar captcha ou rate limit se houver abuso.

Como evitar chamadas duplicadas:

- O botao do formulario fica desabilitado durante envio.
- O backend salva cada projeto por ID unico.
- Para producao de maior volume, adicionar uma tabela `generation_requests` com hash do formulario e bloquear reenvios identicos em janela curta.

Logs minimos:

- Campo `ai_log` em `site_projects`.
- Campo `used_ai` em `site_projects`.
- Logs serverless da Vercel para erro bruto.

## Secao 4 - Banco e storage

Banco escolhido:

Supabase Postgres.

Motivo:

- Plano gratuito ou barato.
- Combina banco e storage.
- Funciona bem com serverless.
- Nao exige VPS.

Arquivo SQL:

`supabase/schema.sql`

Tabela principal:

`public.site_projects`

Campos:

- `id`: UUID do projeto.
- `status`: `draft`, `preview`, `checkout_pending`, `paid`, `delivered` ou `failed`.
- `form_data`: JSON do formulario.
- `generated_content`: JSON gerado pela IA.
- `preview_html`: HTML completo da landing page.
- `assets`: lista JSON das imagens enviadas.
- `used_ai`: booleano indicando se a IA foi usada.
- `ai_log`: log minimo da geracao.
- `payment_provider`: `mock`, `mercadopago` ou `stripe`.
- `payment_reference`: ID externo do checkout.
- `checkout_url`: URL criada pelo provedor.
- `domain`: dominio desejado ou definido futuramente.
- `customer_email`: reservado para pos-venda.
- `internal_notes`: observacoes operacionais.
- `created_at`: data de criacao.
- `updated_at`: data de atualizacao.

Storage:

- Bucket: `site-assets`.
- Publico: sim.
- Limite por arquivo: 4 MB.
- Tipos permitidos:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`

Fluxo de upload:

1. Usuario seleciona ate 5 imagens.
2. `src/lib/validation.ts` valida tipo e tamanho.
3. `src/lib/storage.ts` envia ao Supabase Storage com service role.
4. URLs publicas sao salvas em `assets`.
5. `src/lib/site-renderer.ts` usa essas URLs no HTML do preview.

Politicas:

- Leitura publica dos assets.
- Inserts e updates da tabela devem ocorrer somente via service role nas funcoes serverless.
- A policy atual permite leitura publica de previews por ID. Para privacidade maior, adicionar token publico aleatorio por projeto.

## Secao 5 - Deploy do frontend

Hospedagem recomendada:

Vercel.

Motivo:

- Publica Next.js sem configuracao pesada.
- Executa `/api/*` como serverless.
- Tem plano gratuito ou barato.
- Conecta dominio externo comprado na Hostinger.

Build local:

```bash
npm install
npm run typecheck
npm run build
```

Deploy pela Vercel:

1. Subir o projeto para GitHub.
2. Entrar na Vercel.
3. Criar novo projeto.
4. Importar o repositorio.
5. Framework detectado: Next.js.
6. Build command: `npm run build`.
7. Output: padrao do Next.js.
8. Cadastrar envs.
9. Deploy.

Conectar dominio da Hostinger:

1. Na Vercel, abrir `Project Settings > Domains`.
2. Adicionar `seudominio.com.br`.
3. Adicionar tambem `www.seudominio.com.br` se quiser usar www.
4. A Vercel mostrara os DNS records.
5. Na Hostinger, abrir DNS Zone Editor.
6. Para dominio raiz, criar/alterar:
   - Tipo: `A`
   - Nome: `@`
   - Valor: IP indicado pela Vercel
7. Para www, criar/alterar:
   - Tipo: `CNAME`
   - Nome: `www`
   - Valor: cname indicado pela Vercel
8. Aguardar propagacao.
9. Validar na Vercel ate aparecer como `Valid Configuration`.

Como validar:

- Abrir `https://seudominio.com.br`.
- Abrir `https://seudominio.com.br/create-site`.
- Conferir certificado HTTPS.
- Rodar formulario com `PAYMENT_PROVIDER=mock`.
- Confirmar preview.

## Secao 6 - Deploy das funcoes / backend serverless

As funcoes ficam em:

- `src/app/api/generate-site/route.ts`
- `src/app/api/checkout/route.ts`
- `src/app/api/payment/webhook/route.ts`
- `src/app/api/payment/mock/route.ts`

Na Vercel, elas sao publicadas automaticamente junto com o Next.js.

Como testar:

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000/create-site
```

Autenticacao entre frontend e backend:

- O formulario publico pode chamar `/api/generate-site`.
- Chaves privadas ficam somente no serverless.
- `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, tokens de pagamento e webhooks nunca entram em componente client.

Protecao de endpoints:

- `/api/generate-site`: validar campos, imagens e tamanho.
- `/api/checkout`: aceitar somente projeto existente.
- `/api/payment/webhook`: validar assinatura do provedor escolhido antes de usar em producao real.
- Para reduzir spam: adicionar Turnstile, reCAPTCHA ou rate limit por IP.

CORS:

- Como frontend e API ficam no mesmo dominio, CORS nao e necessario.
- Se separar frontend e backend no futuro, limitar origem a `SITE_BASE_URL`.

## Secao 7 - Integracao com pagamento

Arquivo:

`src/lib/payments.ts`

Endpoint:

`src/app/api/checkout/route.ts`

Providers:

- `mock`: teste local.
- `mercadopago`: cria preferencia via API REST.
- `stripe`: cria Checkout Session via API REST.

Mercado Pago:

1. Definir `PAYMENT_PROVIDER=mercadopago`.
2. Definir `MERCADOPAGO_ACCESS_TOKEN`.
3. Definir `PAYMENT_PRICE_BRL`.
4. Configurar webhook no painel Mercado Pago:
   - URL: `https://seudominio.com.br/api/payment/webhook`
5. Garantir que o retorno contenha referencia ao projeto.

Stripe:

1. Definir `PAYMENT_PROVIDER=stripe`.
2. Definir `STRIPE_SECRET_KEY`.
3. Definir `PAYMENT_PRICE_CENTS`.
4. Configurar webhook:
   - URL: `https://seudominio.com.br/api/payment/webhook`
5. Eventos minimos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`

Validacao de retorno:

- O projeto recebe `status=checkout_pending` ao criar checkout.
- O webhook muda para `status=paid`.
- A tela `/success/<id>` mostra o status atual.

Evitar falsa confirmacao:

- Em producao, nao confiar somente no payload bruto.
- Validar assinatura do webhook do provedor.
- Para Mercado Pago, consultar a API do pagamento recebido e comparar `external_reference`.
- Para Stripe, validar `stripe-signature` com `STRIPE_WEBHOOK_SECRET`.
- Manter `mock` apenas em desenvolvimento.

Implementacao atual do webhook:

- Mercado Pago: quando recebe evento `payment`, consulta `https://api.mercadopago.com/v1/payments/<id>` usando `MERCADOPAGO_ACCESS_TOKEN` e usa `external_reference` como ID do projeto.
- Stripe: tenta ler `data.object.metadata.project_id` ou `data.object.metadata.projectId`.
- Antes de volume real, adicionar validacao criptografica de assinatura do provedor escolhido.

## Secao 8 - Fluxo completo de operacao

1. Usuario acessa `/`.
2. Usuario clica em `Crie seu site em segundos`.
3. Usuario preenche `/create-site`.
4. Browser envia `FormData` para `/api/generate-site`.
5. Backend valida campos obrigatorios.
6. Backend valida imagens.
7. Imagens sobem para Supabase Storage.
8. Backend monta prompt estruturado.
9. Backend chama OpenAI Responses API.
10. Backend recebe JSON estruturado.
11. Backend gera HTML da landing page.
12. Backend salva dados em `site_projects`.
13. Usuario e redirecionado para `/preview/<id>`.
14. Preview le `preview_html` do Supabase.
15. Usuario clica em checkout.
16. `/api/checkout` cria checkout no provedor configurado.
17. Projeto muda para `checkout_pending`.
18. Usuario paga.
19. Provedor chama `/api/payment/webhook`.
20. Projeto muda para `paid`.
21. Usuario ve `/success/<id>`.
22. Equipe ou automacao publica a entrega final conforme o dominio e plano operacional.

## Secao 9 - Testes

Checklist local:

- `npm install` conclui sem vulnerabilidades criticas.
- `npm run typecheck` passa.
- `npm run build` passa.
- `/` abre.
- `/create-site` abre.
- Formulario bloqueia campos vazios.
- Upload rejeita arquivo acima de 4 MB.
- Upload rejeita tipo nao permitido.
- Com `OPENAI_API_KEY`, `used_ai` fica true.
- Sem `OPENAI_API_KEY`, fallback funciona.
- Projeto e salvo em `site_projects`.
- Imagens aparecem no bucket `site-assets`.
- Preview abre em `/preview/<id>`.
- Checkout mock abre em `/checkout/<id>`.
- Pagamento mock muda status para `paid`.
- `/success/<id>` abre.

Checklist producao:

- Env vars cadastradas na Vercel.
- SQL executado no Supabase.
- Bucket criado.
- Dominio validado na Vercel.
- DNS configurado na Hostinger.
- HTTPS ativo.
- Webhook configurado no provedor de pagamento.
- Pagamento sandbox confirma status.
- Pagamento falso sem assinatura nao deve ser aceito depois da validacao final do provedor.
- Layout responsivo em celular.
- Preview carrega imagens reais.
- Logs da Vercel nao mostram chaves ou dados sensiveis.

Falhas comuns:

- `SUPABASE_SERVICE_ROLE_KEY ausente`: env nao cadastrada na Vercel.
- `Falha ao enviar imagem`: bucket nao existe ou policy/storage incorreto.
- IA nao gera: `OPENAI_API_KEY` ausente ou sem saldo.
- Preview 404: projeto nao salvo ou ID errado.
- Checkout nao abre: provider configurado sem credencial.
- Dominio nao abre: DNS ainda propagando ou record incorreto.

## Secao 10 - Manutencao e evolucao

Trocar provedor de IA:

- Editar `src/lib/ai.ts`.
- Manter a saida no mesmo formato `GeneratedSiteContent`.
- Nao alterar `site-renderer` se o schema continuar igual.

Aumentar volume:

- Adicionar rate limit.
- Adicionar captcha.
- Criar tabela de logs de geracao.
- Adicionar fila gerenciada se a geracao ficar lenta, por exemplo Supabase Queue, Inngest ou QStash.
- Separar plano gratuito/pago por limites.

Gargalos atuais:

- Tempo de resposta da IA.
- Upload de imagens grandes.
- Confirmacao de webhook sem validacao criptografica final.
- Preview armazenado como HTML no banco. Para alto volume, salvar HTML em storage.

O que exigiria VPS no futuro:

- Editor visual em tempo real com WebSocket persistente.
- Worker proprio de filas longas.
- Crawlers ou automacoes pesadas.
- Renderizacao massiva de sites com builds independentes.
- DNS/SSL customizado em escala com controle total.

Como evoluir sem reconstruir:

- Manter `site_projects` como entidade central.
- Criar tabela `customers` quando houver login.
- Criar tabela `orders` para separar pagamento de projeto.
- Criar tabela `deployments` para historico de publicacao.
- Trocar `renderLandingPage` por sistema de templates versionados.
- Adicionar painel administrativo para revisar projetos pagos.
- Adicionar publicacao automatica para storage/CDN quando a operacao de dominio estiver definida.
