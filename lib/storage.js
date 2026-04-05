// ============================================================
// STORAGE — Vercel KV via API route /api/storage
// ============================================================

export const KEYS = {
  participants: "bolao:participants",
  rounds:       "bolao:rounds",
  picks:        "bolao:picks",
  longBets:     "bolao:longBets",
  results:      "bolao:results",
  longResults:  "bolao:longResults",
  initialized:  "bolao:initialized_v3",
  pins:         "bolao:pins",
};

export async function storageGet(key) {
  try {
    const res = await fetch(`/api/storage?key=${encodeURIComponent(key)}`);
    const { value } = await res.json();
    return value ?? null;
  } catch {
    return null;
  }
}

export async function storageSet(key, value) {
  try {
    await fetch(`/api/storage?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
  } catch {}
}
