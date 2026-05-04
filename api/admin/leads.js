// =====================================================================
// API/ADMIN/LEADS.JS
// GET  → lista todos os leads (mais novos primeiro) + stats
// POST → atualiza um lead (campos: status, observacoes, valor_pago etc)
//        body: { id, ...campos }
// =====================================================================

import { exigirAdmin } from '../_lib/auth.js';
import { listarLeads, atualizarLead, lerStats, dbConfigurado, STATUS } from '../_lib/db.js';

export default async function handler(req, res){
  if (!exigirAdmin(req, res)) return;

  if (!dbConfigurado()){
    return res.status(503).json({
      error: 'Banco de dados não configurado',
      ajuda: 'Crie um Upstash Redis no Vercel Marketplace e conecte ao projeto.'
    });
  }

  if (req.method === 'GET'){
    try {
      const limit  = parseInt(req.query.limit  || '200', 10);
      const offset = parseInt(req.query.offset || '0',   10);
      const [leads, stats] = await Promise.all([
        listarLeads(limit, offset),
        lerStats()
      ]);
      return res.status(200).json({ leads, stats, status_possiveis: STATUS });
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao listar leads', detalhe: e.message });
    }
  }

  if (req.method === 'POST'){
    try {
      const { id, ...campos } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Falta id do lead' });
      const lead = await atualizarLead(id, campos);
      if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });
      return res.status(200).json({ lead });
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao atualizar', detalhe: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
