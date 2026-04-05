import { kv } from "@vercel/kv";

// ============================================================
// RESET — Apaga todas as chaves do banco.
// Após o reset, ao recarregar o app as rodadas padrão são
// recriadas automaticamente (lógica em pages/index.jsx).
// POST /api/reset  body: { password: string }
// ============================================================

const ALL_KEYS = [
  "bolao:participants",
  "bolao:pins",
  "bolao:picks",
  "bolao:results",
  "bolao:longBets",
  "bolao:longResults",
  "bolao:rounds",
  "bolao:initialized_v3",
];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  const { password } = req.body || {};
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "senha incorreta" });
  }

  try {
    await Promise.all(ALL_KEYS.map(key => kv.del(key)));
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
