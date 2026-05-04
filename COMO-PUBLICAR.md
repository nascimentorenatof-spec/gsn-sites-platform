# 🥷 Como transformar o preview em site definitivo do cliente

Esse é o **fluxo operacional** do dono (você). Quando um cliente paga, segue esses passos.

> **Tempo médio:** 30 a 60 minutos por cliente, contando ajustes finos.

---

## 1️⃣ Pega o HTML que a IA gerou

1. Abre `getsitesninjas.com.br/admin.html` → faz login
2. Acha o lead do cliente que pagou (filtra por **"PAGO! Falta entregar"**)
3. Clica em **"Ver"** pra abrir o detalhe
4. Vai até a seção **"Site gerado pela IA"**:
   - **👁️ Ver site gerado** → abre o HTML em nova aba (pra confirmar como tá)
   - **📥 Baixar HTML (.html)** → baixa o arquivo `nome-do-cliente.html`

> O nome do arquivo já vem com slug do negócio (ex: `salao-da-mari.html`).

---

## 2️⃣ Abre o HTML pra editar

Renomeia o arquivo baixado pra **`index.html`** e cria uma pasta com o nome do cliente. Ex:

```
clientes/
  └── salao-da-mari/
        └── index.html
```

Abre o `index.html` no editor que você preferir:

- **VS Code** (recomendado, grátis): `code index.html`
- **Notepad++**, **Sublime**, ou qualquer outro
- Pra cliente leigo: até no Bloco de Notas funciona pra ajustes simples

---

## 3️⃣ Faz os ajustes que o cliente pediu

A IA já entrega o site com texto e estrutura prontos. O que você normalmente precisa ajustar:

| Ajuste | Como fazer |
|---|---|
| 📷 Trocar fotos placeholder pelas fotos do cliente | Sobe as fotos numa pasta `imgs/` e troca os emojis/divs por `<img src="imgs/foto1.jpg">` |
| 🎨 Cor exata da marca | Busca no CSS por hex tipo `#22c55e` e substitui pelo hex do cliente |
| 📞 Telefones, endereço, horários | Busca pelo conteúdo (Ctrl+F) e substitui |
| 🔗 Links de redes sociais (Instagram, Facebook) | Adiciona os ícones e os links no rodapé |
| 📝 Textos extras que o cliente quis acrescentar | Cola no lugar apropriado |
| ⚡ SEO específico | Ajusta o `<title>` e `<meta description>` no `<head>` |

> **Dica ninja:** O HTML já vem com Tailwind via CDN, então você muda classes (ex: `bg-blue-500` → `bg-amber-500`) sem precisar mexer em CSS bruto.

---

## 4️⃣ Publica no domínio do cliente

Tem 3 caminhos. Escolhe baseado no que o cliente quer:

### Opção A — Cliente quer domínio próprio (`negociodocliente.com.br`)

**Recomendado pro pacote Padrão (R$ 690).**

1. Cria projeto novo na **Vercel**:
   - Vai em https://vercel.com/new
   - Clica em **"Import Third-Party Git Repository"** OU faz drag-and-drop da pasta do cliente
   - **Project name:** o slug do negócio (ex: `salao-da-mari`)
   - **Framework:** Other
   - Deploy

2. Conecta o domínio do cliente:
   - Vercel → Settings → **Domains** → Add → `salaodamari.com.br`
   - Vercel mostra os registros DNS (tipo A ou CNAME)
   - Cliente vai onde comprou o domínio (Registro.br, GoDaddy, etc) e adiciona os registros
   - Em ~1h o domínio tá no ar com SSL grátis

3. Deploy futuros: edita o arquivo, joga via drag-and-drop na Vercel → atualiza em segundos.

> **Custo pra você:** R$ 0 (Vercel free aguenta dezenas de sites simples).

### Opção B — Cliente NÃO tem domínio próprio

**Recomendado pro pacote Básico (R$ 297) ou cliente que tá começando.**

Sobe o site num **subdomínio seu**:

```
salao-da-mari.getsitesninjas.com.br
```

1. Coloca o `index.html` numa pasta dentro do projeto principal: `clientes/salao-da-mari/index.html`
2. Faz `git push` no projeto principal
3. Acessível em `getsitesninjas.com.br/clientes/salao-da-mari`

OU mais profissional: cria projeto Vercel separado e usa subdomínio:
- Vercel → projeto `salao-da-mari` → Settings → Domains → Add → `salao-da-mari.getsitesninjas.com.br`
- Configura CNAME no DNS do `getsitesninjas.com.br` apontando esse subdomínio pra Vercel

### Opção C — Cliente tem hospedagem própria (Hostinger, GoDaddy, etc)

1. Manda o arquivo `index.html` (e pasta `imgs/`) pelo zap pro cliente
2. Ele sobe no painel da hospedagem dele (cPanel / FTP)
3. Você cobra o setup mas a hospedagem é por conta dele

> **Não recomendo** essa opção porque você perde o controle da R$ 97/mês de manutenção. Use só se o cliente insistir.

---

## 5️⃣ Marca como entregue no painel admin

Volta em `/admin.html` → abre o lead → clica **"✅ Marcar entregue"**.

Status vira `Entregue` (verde) e some dos filtros de "falta entregar". 🎉

---

## 6️⃣ Manutenção mensal (R$ 97)

Pra cada cliente ativo, todo mês:

1. **Cobrança automática** (se você ativou recorrência no PagSeguro): nada a fazer
2. **Cobrança manual** (mais comum no início): manda Pix de cobrança no zap dia 5 de cada mês
3. **Pequenos ajustes** quando o cliente pedir (~5 min cada): edita o HTML, redeploy na Vercel
4. **Renovação de domínio** (1x ao ano): renova no Registro.br/GoDaddy e cobra do cliente

---

## 🚀 Otimizações pro futuro (quando ter 10+ clientes)

- **Script de deploy automático:** comando único que cria projeto Vercel + conecta domínio + deploy
- **Painel pro cliente:** ele entra com login dele e vê o site no ar + pode pedir ajustes via formulário
- **Versionamento dos sites:** salvar HTMLs antigos pra rollback
- **Editor visual no painel admin:** trocar foto/texto sem mexer em código
- **Cron de cobrança:** dispara Pix automaticamente todo dia 5

Mas isso é trabalho de **fase 2**. Por enquanto, foca em VENDER e ENTREGAR no manual.

---

## 🆘 Problemas comuns

**HTML não tá baixando:**
- Você precisa estar logado no `/admin.html` (cookie do admin)
- Lead foi gerado **antes** do feature de salvar HTML? Esses não tem HTML salvo. Pede pro cliente refazer o briefing.

**Site quebrado depois de editar:**
- Provavelmente fechou uma `<tag>` errada. Usa o VS Code com extensão **"Auto Close Tag"** + **"Live Server"** pra ver erros em tempo real.

**Vercel não conecta domínio:**
- Geralmente erro de DNS. Espera 1h depois de configurar. Se passar de 24h, abre suporte na Vercel.

**Cliente quer mudança grande depois de entregue:**
- Cobra extra (ex: R$ 100 pra refazer páginas inteiras). Avisa antes de começar.

Pronto, ninja! Esse é o fluxo do início ao fim. 🥷
