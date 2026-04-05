import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const { key } = req.query;

  if (!key) return res.status(400).json({ error: "key required" });

  if (req.method === "GET") {
    try {
      const raw = await kv.get(key);
      if (raw === null || raw === undefined) {
        return res.status(200).json({ value: null });
      }
      // kv.get may return already-parsed object or a raw JSON string
      const value = typeof raw === "string" ? JSON.parse(raw) : raw;
      return res.status(200).json({ value });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { value } = req.body;
      await kv.set(key, JSON.stringify(value));
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      await kv.del(key);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "method not allowed" });
}
