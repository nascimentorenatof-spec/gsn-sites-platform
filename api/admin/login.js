// =====================================================================
// API/ADMIN/LOGIN.JS — Login do painel admin
// POST { senha } → 200 + cookie HttpOnly  ou  401
// =====================================================================

import { senhaCorreta, cookieDeLogin } from '../_lib/auth.js';

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { senha } = req.body || {};

  // pequeno delay artificial pra dificultar brute force
  await new Promise(r => setTimeout(r, 400));

  if (!senhaCorreta(senha)){
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  res.setHeader('Set-Cookie', cookieDeLogin());
  return res.status(200).json({ ok: true });
}
