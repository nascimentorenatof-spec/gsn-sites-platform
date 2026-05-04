// =====================================================================
// API/WEBHOOK-PAGSEGURO.JS
// PagSeguro chama essa URL quando um pagamento muda de status.
// A gente busca o lead pelo reference_id e atualiza pra "pagamento_confirmado".
//
// Configurar essa URL em: PagBank > Integrações > URLs de notificação
//   https://getsitesninjas.com.br/api/webhook-pagseguro
// =====================================================================

import { buscarLeadPorReference, atualizarLead, incrementar, STATUS } from './_lib/db.js';

export default async function handler(req, res){
  // PagSeguro pode chamar com GET (verificação) ou POST (notificação)
  if (req.method === 'GET') return res.status(200).json({ ok: true, msg: 'Webhook ativo' });
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body || {};
    // PagBank v4 manda payload tipo: { id, reference_id, charges: [{ status: "PAID" }], ... }
    const referenceId = body.reference_id || body.referenceId;
    const charges     = body.charges || [];
    const ultimaCobranca = charges[charges.length - 1] || {};
    const statusCobranca = (ultimaCobranca.status || '').toUpperCase();

    if (!referenceId) {
      console.warn('Webhook sem reference_id:', JSON.stringify(body).slice(0, 300));
      return res.status(200).json({ ignorado: true });
    }

    const lead = await buscarLeadPorReference(referenceId);
    if (!lead) {
      console.warn('Lead não encontrado pra reference', referenceId);
      return res.status(200).json({ ignorado: true });
    }

    // mapeia status do PagBank pro nosso status interno
    let novoStatus = lead.status;
    if (statusCobranca === 'PAID') {
      novoStatus = STATUS.PAGAMENTO_CONFIRMADO;
      await incrementar('pagos');
    } else if (statusCobranca === 'CANCELED' || statusCobranca === 'DECLINED') {
      novoStatus = STATUS.CANCELADO;
    }

    await atualizarLead(lead.id, {
      status: novoStatus,
      pagseguro_status_cobranca: statusCobranca,
      pagseguro_pago_em: statusCobranca === 'PAID' ? Date.now() : lead.pagseguro_pago_em
    });

    return res.status(200).json({ ok: true, lead_id: lead.id, novoStatus });

  } catch (e) {
    console.error('Erro no webhook:', e);
    // sempre retornar 200 pra PagSeguro não ficar reentregando
    return res.status(200).json({ erro: e.message });
  }
}
