# Alteracoes de conteudo - getsitesninjas.com.br

## Objetivo da alteracao

Trocar o tom generico da plataforma por uma comunicacao moderna, direta e orientada a compra para o dominio `getsitesninjas.com.br`.

## Arquivos alterados

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/create-site/page.tsx`
- `src/components/CreateSiteForm.tsx`
- `src/components/CheckoutButton.tsx`
- `src/app/globals.css`
- `src/lib/ai.ts`
- `src/lib/site-renderer.ts`

## Mudancas principais

1. Marca exibida no topo alterada para `getsitesninjas.com.br`.
2. Metadata ajustada para `Get Sites Ninjas | Sites prontos para vender`.
3. CTA principal da home alterado para `Quero meu site pronto agora`.
4. CTA de navegacao alterado para `Comprar meu site agora`.
5. Home recebeu uma faixa de compra direta com chamada mais agressiva.
6. Home recebeu bloco final com CTA `Comprar minha landing page`.
7. Formulario passou a comunicar `preview para comprar`, nao apenas geracao.
8. Botao do formulario virou `Gerar preview para comprar`.
9. Botao do preview virou `Comprar este site agora`.
10. Prompt da IA foi ajustado para copy moderna, especifica e focada em conversao.
11. Fallback sem IA ficou mais persuasivo e menos generico.
12. CSS recebeu ajustes visuais para faixa escura, CTA forte e contraste melhor.

## Como publicar

Rodar:

```bash
npm run typecheck
npm run build
```

Depois fazer redeploy na Vercel.

Se o projeto estiver conectado ao GitHub, basta commitar e enviar para a branch de producao.

## Validacao visual

Conferir:

1. Topo mostra `getsitesninjas.com.br`.
2. Hero mostra chamada agressiva de compra.
3. Botao principal mostra `Quero meu site pronto agora`.
4. Pagina `/create-site` mostra copy de compra com preview.
5. Botao do formulario mostra `Gerar preview para comprar`.
6. Preview mostra botao `Comprar este site agora`.
7. Mobile nao quebra texto nem esconde CTA.
