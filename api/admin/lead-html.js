// =====================================================================
// API/ADMIN/LEAD-HTML.JS
// GET /api/admin/lead-html?id=xxx              → renderiza o HTML como página
// GET /api/admin/lead-html?id=xxx&download=1   → força download como .html
// =====================================================================

import { exigirAdmin } from '../_lib/auth.js';
import { buscarLead, dbConfigurado } from '../_lib/db.js';

export default async function handler(req, res){
  if (!exigirAdmin(req, res)) return;

  if (!dbConfigurado()){
    return res.status(503).send('Banco de dados não configurado.');
  }

  const id = req.query.id;
  if (!id) return res.status(400).send('Falta ?id=xxx');

  try {
    const lead = await buscarLead(id);
    if (!lead) return res.status(404).send('Lead não encontrado.');
    if (!lead.html_preview) return res.status(404).send('Esse lead não tem HTML salvo (gerado antes da feature de salvar).');

    // Se ?download=1 → força download como arquivo .html
    if (req.query.download) {
      const slug = (lead.briefing?.nome || 'site')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${slug || id}.html"`);
      return res.status(200).send(lead.html_preview);
    }

    // Senão, renderiza inline (abre no navegador como página normal)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(lead.html_preview);

  } catch (e) {
    return res.status(500).send('Erro: ' + e.message);
  }
}
