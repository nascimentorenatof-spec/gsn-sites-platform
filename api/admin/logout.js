// =====================================================================
// API/ADMIN/LOGOUT.JS — Sai do painel admin
// =====================================================================

import { cookieDeLogout } from '../_lib/auth.js';

export default async function handler(req, res){
  res.setHeader('Set-Cookie', cookieDeLogout());
  return res.status(200).json({ ok: true });
}
