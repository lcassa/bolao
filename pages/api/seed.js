import { kv } from "@vercel/kv";

// ============================================================
// SEED — Popula dados de teste: 3 participantes, palpites,
//        resultados de r1 e apostas longas.
// POST /api/seed  body: { password: string }
// ============================================================

const SEED_PARTICIPANTS = [
  { id: "p_alice",  name: "Alice"  },
  { id: "p_bob",    name: "Bob"    },
  { id: "p_carlos", name: "Carlos" },
];

const SEED_PINS = {
  p_alice:  "1234",
  p_bob:    "5678",
  p_carlos: "9012",
};

// Resultados de 6 jogos da rodada r1
const SEED_RESULTS = {
  r1: {
    g1:  { home: 2, away: 1 }, // México 2×1 África do Sul
    g2:  { home: 0, away: 0 }, // Coreia do Sul 0×0 Tchéquia
    g7:  { home: 3, away: 0 }, // Brasil 3×0 Marrocos
    g9:  { home: 2, away: 0 }, // Alemanha 2×0 Curaçao
    g17: { home: 1, away: 1 }, // França 1×1 Senegal
    g19: { home: 2, away: 1 }, // Argentina 2×1 Argélia
  },
};

// Palpites projetados para pontuações variadas:
// Alice  ~35pts de jogos + 40pts apostas = ~75pts
// Bob    ~44pts de jogos + 15pts apostas = ~59pts
// Carlos ~25pts de jogos + 30pts apostas = ~55pts
const SEED_PICKS = {
  p_alice: {
    r1: {
      g1:  { home: 2, away: 1 }, // exato +10
      g2:  { home: 1, away: 0 }, // vencedor +5 (errou — empate real)
      g7:  { home: 2, away: 0 }, // vencedor +5
      g9:  { home: 2, away: 0 }, // exato +10
      g17: { home: 0, away: 0 }, // errado 0 (empate real, placar diferente) — um time +2
      g19: { home: 1, away: 0 }, // vencedor +5
    },
  },
  p_bob: {
    r1: {
      g1:  { home: 3, away: 2 }, // vencedor+saldo +7
      g2:  { home: 0, away: 0 }, // exato +10
      g7:  { home: 3, away: 0 }, // exato +10
      g9:  { home: 1, away: 0 }, // vencedor +5
      g17: { home: 2, away: 2 }, // um time certo (away=1 real, away=2 bob → errado; home=1 real, home=2 bob → errado) → 0pts
      g19: { home: 2, away: 1 }, // exato +10
    },
  },
  p_carlos: {
    r1: {
      g1:  { home: 0, away: 1 }, // errado 0
      g2:  { home: 0, away: 0 }, // exato +10
      g7:  { home: 1, away: 0 }, // errado 0
      g9:  { home: 3, away: 1 }, // vencedor +5
      g17: { home: 1, away: 1 }, // exato +10
      g19: { home: 0, away: 0 }, // errado 0
    },
  },
};

// Apostas longas — resultado real: Brasil campeão, França vice,
// artilheiro Vinicius Jr., Brasil posição Campeão
const SEED_LONG_BETS = {
  p_alice: {
    champion:       "Brasil",       // acerta +30
    runner:         "Argentina",    // erra
    topScorer:      "Mbappé",       // erra
    brazilPosition: "Campeão",      // acerta +10
  },
  p_bob: {
    champion:       "Argentina",    // erra
    runner:         "França",       // acerta +15
    topScorer:      "Mbappé",       // erra
    brazilPosition: "Semifinal",    // erra
  },
  p_carlos: {
    champion:       "França",       // erra
    runner:         "Alemanha",     // erra
    topScorer:      "Vinicius Jr.", // acerta +20
    brazilPosition: "Campeão",      // acerta +10
  },
};

const SEED_LONG_RESULTS = {
  champion:       "Brasil",
  runner:         "França",
  topScorer:      "Vinicius Jr.",
  brazilPosition: "Campeão",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  const { password } = req.body || {};
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "senha incorreta" });
  }

  try {
    await Promise.all([
      kv.set("bolao:participants", JSON.stringify(SEED_PARTICIPANTS)),
      kv.set("bolao:pins",         JSON.stringify(SEED_PINS)),
      kv.set("bolao:picks",        JSON.stringify(SEED_PICKS)),
      kv.set("bolao:results",      JSON.stringify(SEED_RESULTS)),
      kv.set("bolao:longBets",     JSON.stringify(SEED_LONG_BETS)),
      kv.set("bolao:longResults",  JSON.stringify(SEED_LONG_RESULTS)),
    ]);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
