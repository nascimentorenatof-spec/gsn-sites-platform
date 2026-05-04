// =====================================================================
// API/_LIB/DB.JS — Helper de banco de dados (Upstash Redis via REST)
//
// Estrutura de dados no Redis:
//   leads:zset           → ZSET com {leadId: timestamp} pra ordenar por data
//   lead:{id}            → JSON com todos os campos do lead
//   stats:visitas        → INCR a cada visita ao /criar
//   stats:gerados        → INCR a cada preview gerado
//   stats:pagos          → INCR a cada pagamento confirmado
//
// 🔧 Variáveis de ambiente esperadas (injetadas pelo Vercel quando você
//    conecta um Upstash Redis pelo Marketplace):
//   KV_REST_API_URL  ou  UPSTASH_REDIS_REST_URL
//   KV_REST_API_TOKEN ou UPSTASH_REDIS_REST_TOKEN
// =====================================================================

const URL_REDIS   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN_REDIS = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export function dbConfigurado(){
  return Boolean(URL_REDIS && TOKEN_REDIS);
}

// chamada genérica ao Upstash (REST API)
async function chamar(comando){
  if (!dbConfigurado()){
    throw new Error('Banco de dados não configurado. Configure Upstash Redis no Vercel Marketplace.');
  }
  const r = await fetch(URL_REDIS, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN_REDIS}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(comando)
  });
  if (!r.ok) {
    const erro = await r.text();
    throw new Error(`Redis erro ${r.status}: ${erro}`);
  }
  const data = await r.json();
  return data.result;
}

// ============== LEADS ==============

// gera um id curto, único e ordenável por tempo (timestamp em base36 + random)
export function novoLeadId(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

// salva ou sobrescreve um lead inteiro
export async function salvarLead(lead){
  if (!lead.id) lead.id = novoLeadId();
  if (!lead.criado_em) lead.criado_em = Date.now();
  lead.atualizado_em = Date.now();

  // grava o JSON do lead
  await chamar(['SET', `lead:${lead.id}`, JSON.stringify(lead)]);
  // adiciona ao índice ordenado por timestamp (pra listar mais novos primeiro)
  await chamar(['ZADD', 'leads:zset', lead.criado_em, lead.id]);
  return lead;
}

// busca um lead pelo id
export async function buscarLead(id){
  const json = await chamar(['GET', `lead:${id}`]);
  return json ? JSON.parse(json) : null;
}

// atualiza campos específicos de um lead (merge)
export async function atualizarLead(id, campos){
  const lead = await buscarLead(id);
  if (!lead) return null;
  Object.assign(lead, campos);
  return salvarLead(lead);
}

// busca lead pelo reference_id do PagSeguro
export async function buscarLeadPorReference(referenceId){
  const todos = await listarLeads(500, 0);
  return todos.find(l => l.pagseguro_reference === referenceId);
}

// lista N leads ordenados por data (mais novos primeiro)
export async function listarLeads(limit = 100, offset = 0){
  // ZREVRANGE pega do mais novo pro mais velho
  const ids = await chamar(['ZREVRANGE', 'leads:zset', offset, offset + limit - 1]);
  if (!ids || !ids.length) return [];
  // pega cada lead em paralelo (MGET)
  const chaves = ids.map(id => `lead:${id}`);
  const jsons = await chamar(['MGET', ...chaves]);
  return jsons.map(j => j ? JSON.parse(j) : null).filter(Boolean);
}

// ============== STATS / CONTADORES ==============

export async function incrementar(chave){
  try {
    return await chamar(['INCR', `stats:${chave}`]);
  } catch (e) {
    // se DB caiu, não trava o fluxo de venda
    console.error('Erro ao incrementar', chave, e.message);
    return 0;
  }
}

export async function lerStats(){
  try {
    const [visitas, gerados, pagos] = await chamar([
      'MGET', 'stats:visitas', 'stats:gerados', 'stats:pagos'
    ]);
    return {
      visitas: parseInt(visitas || 0, 10),
      gerados: parseInt(gerados || 0, 10),
      pagos:   parseInt(pagos   || 0, 10)
    };
  } catch (e) {
    return { visitas: 0, gerados: 0, pagos: 0 };
  }
}

// ============== STATUS POSSÍVEIS DO LEAD ==============
export const STATUS = {
  BRIEFING_INICIADO:    'briefing_iniciado',     // chegou no /criar e começou
  PREVIEW_GERADO:       'preview_gerado',         // IA gerou o site
  PAGAMENTO_INICIADO:   'pagamento_iniciado',     // clicou em pagar (foi pro PagSeguro)
  PAGAMENTO_CONFIRMADO: 'pagamento_confirmado',   // PagSeguro confirmou via webhook
  EM_PRODUCAO:          'em_producao',            // você começou a finalizar
  ENTREGUE:             'entregue',               // site no ar
  CANCELADO:            'cancelado'               // desistiu / reembolso
};
