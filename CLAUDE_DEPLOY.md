# Guia de Deploy — GSN Sites Platform
## Para Claude: leia isso antes de qualquer deploy

---

## Arquitetura do projeto

- **Frontend + Backend serverless**: Next.js 15, hospedado na Vercel
- **Banco de dados + Storage**: Supabase (projeto: `mtvcayncpatwzvqqxebr`, região: São Paulo)
- **Pagamento**: PagSeguro/PagBank (sandbox ou produção via env var)
- **Domínio**: `getsitesninjas.com.br` → aponta para Vercel via DNS Hostinger
- **Repositório GitHub**: `nascimentorenatof-spec/gsn-sites-platform`
- **Projeto Vercel**: `gsn-sites-platform` (team: `nascimentorenatof-specs-projects`)

---

## Fluxo de deploy

### 1. Verificar TypeScript antes de qualquer push
```bash
cd /sessions/zen-nice-keller/mnt/renato-dev--GSN
node_modules/.bin/tsc --noEmit
```
Se houver erros de `\!` (bang escapado), rodar:
```bash
python3 /tmp/fix_bang.py
```
Se o script não existir, recriar:
```python
# salvar em /tmp/fix_bang.py
files = [
  '/sessions/zen-nice-keller/mnt/renato-dev--GSN/src/lib/payments.ts',
  '/sessions/zen-nice-keller/mnt/renato-dev--GSN/src/app/api/payment/webhook/route.ts',
]
for p in files:
  with open(p, 'rb') as f: c = f.read()
  c2 = c.replace(bytes([0x5c,0x21]), bytes([0x21]))
  if c2 != c:
    with open(p, 'wb') as f: f.write(c2)
    print('Fixed: ' + p.split('/')[-1])
```

Se houver null bytes (erro `TS1127: Invalid character`):
```bash
python3 -c "
path = 'CAMINHO_DO_ARQUIVO'
with open(path, 'rb') as f: c = f.read()
c2 = c.rstrip(b'\x00')
if c2 != c:
  with open(path, 'wb') as f: f.write(c2)
  print('Fixed null bytes')
"
```

### 2. Push para GitHub (executar no PowerShell do usuário)
```powershell
cd C:\Users\Elebbre\renato-dev\GSN
git add -A
git commit -m "descrição da mudança"
git push
```
**Atenção**: git push deve ser feito pelo usuário no terminal Windows.
O sandbox Linux não tem acesso de rede ao GitHub.

### 3. Verificar deploy na Vercel
URL: https://vercel.com/nascimentorenatof-specs-projects/gsn-sites-platform/deployments
- Aguardar status `Ready` (tipicamente 27–42s)
- Se falhar: ver build logs e corrigir TypeScript errors

---

## Variáveis de ambiente na Vercel
URL: https://vercel.com/nascimentorenatof-specs-projects/gsn-sites-platform/settings/environment-variables

| Variável | Valor atual | Notas |
|---|---|---|
| `SITE_BASE_URL` | `https://getsitesninjas.com.br` | Atualizar se domínio mudar |
| `SUPABASE_URL` | `https://mtvcayncpatwzvqqxebr.supabase.co` | Não alterar |
| `SUPABASE_ANON_KEY` | `eyJ...` | Não alterar |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Não alterar — nunca expor |
| `STORAGE_BUCKET_NAME` | `site-assets` | Não alterar |
| `OPENAI_API_KEY` | *(não configurado)* | Adicionar para IA real |
| `OPENAI_MODEL` | `gpt-4.1-mini` | Modelo padrão |
| `PAYMENT_PROVIDER` | `pagseguro` | Não alterar |
| `PAGSEGURO_TOKEN` | `eyJ...` (token sandbox) | Trocar por produção quando pronto |
| `PAGSEGURO_SANDBOX` | `true` | Mudar para `false` em produção |
| `PAYMENT_PRICE_CENTS` | `39000` | R$ 390,00 |

### Para ir para produção PagSeguro:
1. Vercel → `PAGSEGURO_SANDBOX` → editar → `false`
2. Vercel → `PAGSEGURO_TOKEN` → editar → token de produção (PagBank app → Venda online → Integrações → Gerar Token)
3. Redeploy

---

## Supabase
- **Dashboard**: https://supabase.com/dashboard/project/mtvcayncpatwzvqqxebr
- **SQL Editor**: https://supabase.com/dashboard/project/mtvcayncpatwzvqqxebr/sql/new
- **Tabela principal**: `public.site_projects`
- **Bucket storage**: `site-assets` (público)

### Consulta útil para ver fila de trabalho (projetos pagos):
```sql
SELECT id, status, form_data->>'businessName' as negocio,
       customer_notes, internal_notes, payment_reference, updated_at
FROM public.site_projects
WHERE status = 'in_progress'
ORDER BY updated_at DESC;
```

### Se precisar rodar SQL novo:
Usar a Management API diretamente do browser Supabase (via JS na aba):
```javascript
(async () => {
  const session = JSON.parse(localStorage.getItem('supabase.dashboard.auth.token'));
  const resp = await fetch('https://api.supabase.com/v1/projects/mtvcayncpatwzvqqxebr/database/query', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'SEU SQL AQUI' })
  });
  return await resp.json();
})();
```

---

## DNS / Domínio
- **Hostinger**: https://hpanel.hostinger.com/domain/getsitesninjas.com.br/dns
- **Vercel Domains**: https://vercel.com/nascimentorenatof-specs-projects/gsn-sites-platform/settings/domains

Registros DNS configurados:
```
A     @    216.198.79.1                          TTL 300
CNAME www  a8bfffd5f88e8147.vercel-dns-017.com.  TTL 300
```

---

## Estrutura de arquivos críticos

```
src/
  app/
    page.tsx                    — Homepage (copy de venda)
    layout.tsx                  — Header, branding, metadata
    create-site/page.tsx        — Formulário do cliente
    preview/[id]/page.tsx       — Preview com countdown + checkout (CLIENT component)
    success/[id]/page.tsx       — Pós-pagamento + coleta de domínio
    api/
      generate-site/route.ts    — Gera site com IA e salva no Supabase
      checkout/route.ts         — Cria checkout PagSeguro
      payment/
        webhook/route.ts        — Confirma pagamento (webhook PagSeguro/MP/Stripe)
        mock/route.ts           — Simulação local de pagamento
      project/
        [id]/route.ts           — GET projeto para o client-side preview
        domain/route.ts         — POST domínio desejado após pagamento
  lib/
    ai.ts                       — Integração OpenAI (com fallback)
    payments.ts                 — PagSeguro + MP + Stripe
    projects.ts                 — CRUD Supabase (createProject, getProject, updateProject)
    site-renderer.ts            — Gera HTML da landing page
    types.ts                    — Todos os tipos TypeScript
    validation.ts               — Validação do formulário e imagens
    env.ts                      — siteBaseUrl()
    supabase.ts                 — getSupabaseAdmin()
    storage.ts                  — Upload de imagens para Supabase Storage
  components/
    CreateSiteForm.tsx           — Formulário interativo (react-hook-form)
    CheckoutButton.tsx           — Botão de checkout
```

---

## Problemas comuns e soluções

### Build falha com `TS1127: Invalid character`
Null bytes nos arquivos `.ts`. Solução: rodar o script de remoção de null bytes (ver seção 1).

### Build falha com `\!token` ou `\!response.ok`
Bash escapou `!` ao escrever arquivos via heredoc. Solução: rodar `fix_bang.py`.

### Vercel não detecta push automático
Fazer redeploy manual: Vercel → Deployments → `...` no último deploy → Redeploy.

### PagSeguro retorna `401 invalid_authorization_header`
Token expirado ou placeholder. Atualizar `PAGSEGURO_TOKEN` na Vercel.

### Preview abre mas checkout falha
Verificar `PAGSEGURO_SANDBOX` (deve ser `true` para sandbox, `false` para produção) e `PAYMENT_PRICE_CENTS`.

### Domínio não abre
DNS ainda propagando (até 24h). Verificar Vercel Domains — aguardar ícone azul "Valid Configuration".

---

## Checklist pré-deploy
- [ ] `tsc --noEmit` sem erros
- [ ] Mudanças testadas localmente (se possível)
- [ ] `git add -A && git commit -m "..." && git push`
- [ ] Aguardar `Ready` na Vercel
- [ ] Verificar `https://getsitesninjas.com.br` no browser

## Checklist para ir a produção
- [ ] `PAGSEGURO_SANDBOX=false`
- [ ] `PAGSEGURO_TOKEN` = token de produção PagBank
- [ ] `OPENAI_API_KEY` configurada
- [ ] Webhook PagSeguro configurado: `https://getsitesninjas.com.br/api/payment/webhook`
- [ ] Teste de pagamento real com valor mínimo
