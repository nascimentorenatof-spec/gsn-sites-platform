// =====================================================================
// API/_LIB/AUTH.JS — Autenticação simples do admin
//
// Esquema: senha em ADMIN_SENHA (env var). Login bem-sucedido seta um
// cookie HttpOnly chamado "gsn_admin" assinado com SHA-256 da senha.
// Todos os endpoints admin/* checam esse cookie via "exigirAdmin()".
// =====================================================================

import crypto from 'crypto';

const COOKIE_NOME = 'gsn_admin';
const VALIDADE_DIAS = 7;

function tokenDaSenha(senha){
  return crypto.createHash('sha256').update(senha).digest('hex');
}

export function senhaCorreta(senha){
  const senhaCerta = process.env.ADMIN_SENHA;
  if (!senhaCerta) return false;
  if (!senha) return false;
  // comparação resistente a timing attack
  const a = Buffer.from(tokenDaSenha(senha));
  const b = Buffer.from(tokenDaSenha(senhaCerta));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// monta o Set-Cookie pra logar
export function cookieDeLogin(){
  const token = tokenDaSenha(process.env.ADMIN_SENHA || '');
  const maxAge = VALIDADE_DIAS * 24 * 60 * 60;
  return `${COOKIE_NOME}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}

// monta o Set-Cookie pra deslogar
export function cookieDeLogout(){
  return `${COOKIE_NOME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

// extrai cookies do header
function lerCookie(req, nome){
  const raw = req.headers.cookie || '';
  const par = raw.split(';').map(s => s.trim()).find(s => s.startsWith(nome + '='));
  return par ? par.slice(nome.length + 1) : null;
}

// retorna true se o cookie do admin é válido
export function admiLogado(req){
  const senhaCerta = process.env.ADMIN_SENHA;
  if (!senhaCerta) return false;
  const tokenCookie = lerCookie(req, COOKIE_NOME);
  if (!tokenCookie) return false;
  const tokenEsperado = tokenDaSenha(senhaCerta);
  return tokenCookie === tokenEsperado;
}

// middleware: chama no início de cada endpoint admin
export function exigirAdmin(req, res){
  if (!admiLogado(req)){
    res.status(401).json({ error: 'Não autenticado' });
    return false;
  }
  return true;
}
