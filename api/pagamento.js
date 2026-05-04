// =====================================================================
// API/PAGAMENTO.JS — Função serverless da Vercel
// Recebe { pacote, briefing }, cria uma "order" na API v4 do PagSeguro
// e devolve a URL de checkout pra redirecionar o cliente.
//
// Variáveis de ambiente esperadas (configurar na Vercel):
//   PAGSEGURO_TOKEN  — token Bearer da sua conta PagBank/PagSeguro
//   PAGSEGURO_ENV    — "sandbox" (testes) ou "production" (real)
//
// Se as variáveis não estiverem configuradas, devolve uma URL de
// fallback que abre o WhatsApp com o resumo do pedido (pra você não
// perder vendas enquanto configura o PagSeguro).
// =====================================================================

// 🔧 EDITAR AQUI: preços (em centavos) e descrição dos pacotes
const PACOTES = {
  basico: {
    nome: 'GetSitesNinjas — Pacote Básico',
    descricao: 'Site profissional de 1 página com entrega em até 5 dias',
    valor_centavos: 29700  // R$ 297,00
  },
  padrao: {
    nome: 'GetSitesNinjas — Pacote Padrão',
    descricao: 'Site profissional de até 4 páginas com SEO e entrega em até 5 dias',
    valor_centavos: 69000  // R$ 690,00
  }
};

// 🔧 EDITAR AQUI: número do WhatsApp (fallback se PagSeguro não estiver configurado)
const WHATSAPP_NUMERO = '5511939344180';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pacote, briefing } = req.body || {};
    const pacoteInfo = PACOTES[pacote];

    if (!pacoteInfo) {
      return res.status(400).json({ error: 'Pacote inválido. Use "basico" ou "padrao".' });
    }

    // === FALLBACK: se PagSeguro não está configurado, manda pro WhatsApp ===
    if (!process.env.PAGSEGURO_TOKEN) {
      const msg = montarMensagemWhatsApp(pacote, pacoteInfo, briefing);
      const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;
      return res.status(200).json({
        checkout_url: url,
        modo: 'whatsapp_fallback',
        aviso: 'PagSeguro ainda não configurado — redirecionando pro WhatsApp.'
      });
    }

    // === CRIA ORDER NO PAGSEGURO ===
    const baseUrl = process.env.PAGSEGURO_ENV === 'production'
      ? 'https://api.pagseguro.com'
      : 'https://sandbox.api.pagseguro.com';

    const orderId = `gsn-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const origem = req.headers.origin || `https://${req.headers.host}`;

    const orderBody = {
      reference_id: orderId,
      customer: {
        name:  briefing?.nome  || 'Cliente Getsitesninjas',
        email: briefing?.email || 'cliente@exemplo.com',
        phones: briefing?.whatsapp ? [{
          country: '55',
          area: briefing.whatsapp.replace(/\D/g,'').slice(0,2) || '11',
          number: briefing.whatsapp.replace(/\D/g,'').slice(2) || '999999999',
          type: 'MOBILE'
        }] : undefined
      },
      items: [{
        reference_id: pacote,
        name: pacoteInfo.nome,
        quantity: 1,
        unit_amount: pacoteInfo.valor_centavos
      }],
      redirect_url: `${origem}/criar.html?status=ok`,
      notification_urls: [`${origem}/api/webhook-pagseguro`]  // opcional, crie se quiser webhook
    };

    const resposta = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAGSEGURO_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderBody)
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      console.error('PagSeguro retornou erro:', data);
      // se der erro no PagSeguro, ainda assim cai no fallback do WhatsApp
      const msg = montarMensagemWhatsApp(pacote, pacoteInfo, briefing);
      return res.status(200).json({
        checkout_url: `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`,
        modo: 'erro_fallback',
        erro_pagseguro: data
      });
    }

    // procura o link de pagamento na resposta
    const linkPay = (data.links || []).find(l => l.rel === 'PAY' || l.rel === 'CHECKOUT');
    if (!linkPay) {
      return res.status(500).json({ error: 'PagSeguro não devolveu link de pagamento.', resposta: data });
    }

    return res.status(200).json({
      checkout_url: linkPay.href,
      order_id: data.id,
      modo: 'pagseguro'
    });

  } catch (err) {
    console.error('Erro no pagamento:', err);
    return res.status(500).json({ error: 'Erro ao gerar pagamento', detalhe: err.message });
  }
}

// monta a mensagem que vai pro WhatsApp como fallback
function montarMensagemWhatsApp(pacote, pacoteInfo, b = {}){
  const valor = (pacoteInfo.valor_centavos / 100).toFixed(2).replace('.', ',');
  return `Oi! Acabei de pedir meu site na Getsitesninjas 🥷

📦 Pacote: ${pacoteInfo.nome}
💰 Valor: R$ ${valor} + R$ 97/mês

▪️ Negócio: ${b.nome || '-'}
▪️ Segmento: ${b.segmento || '-'}
▪️ Cidade: ${b.cidade || '-'}
▪️ WhatsApp: ${b.whatsapp || '-'}
▪️ E-mail: ${b.email || '-'}
▪️ Objetivo: ${b.objetivo || '-'}
▪️ Estilo: ${b.estilo || '-'}
▪️ Cor: ${b.cor || '-'}
▪️ Serviços: ${b.servicos || '-'}
▪️ Diferencial: ${b.diferencial || '-'}

Bora finalizar o pagamento!`;
}
