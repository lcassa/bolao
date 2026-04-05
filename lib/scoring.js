import {
  SCORE_EXACT, SCORE_WINNER_DIFF, SCORE_WINNER, SCORE_ONE_TEAM, SCORE_WRONG,
} from "../styles/colors";

// ============================================================
// SCORING — Lógica de pontuação de palpites
// ============================================================

/** Multiplicadores de pontos por fase do torneio */
export const PHASE_MULT = {
  grupos:    1,
  dezesseis: 2,
  oitavas:   2,
  quartas:   2,
  semi:      3,
  final:     3,
};

/**
 * Calcula o resultado de um palpite para um único jogo.
 * @returns {null | {pts: number, label: string, color: string}}
 */
export function scoreMatch(pick, result) {
  if (!result || result.home === "" || result.home === undefined || !pick) return null;
  const ph = parseInt(pick.home), pa = parseInt(pick.away);
  const rh = parseInt(result.home), ra = parseInt(result.away);
  if (isNaN(ph) || isNaN(pa) || isNaN(rh) || isNaN(ra)) return null;

  if (ph === rh && pa === ra) return { pts: 10, label: "Placar Exato 🎯",       color: SCORE_EXACT };
  const pw = ph > pa ? "h" : ph < pa ? "a" : "d";
  const rw = rh > ra ? "h" : rh < ra ? "a" : "d";
  if (pw === rw && (ph - pa) === (rh - ra)) return { pts: 7, label: "Vencedor + Saldo ✅", color: SCORE_WINNER_DIFF };
  if (pw === rw)                            return { pts: 5, label: "Vencedor Certo 👍",    color: SCORE_WINNER };
  if (ph === rh || pa === ra)               return { pts: 2, label: "Um Time Certo 🤏",    color: SCORE_ONE_TEAM };
  return { pts: 0, label: "Erro Total ❌", color: SCORE_WRONG };
}

/**
 * Calcula o total de pontos de um participante, incluindo apostas longas.
 * @returns {{total: number, exact: number, winner: number}}
 */
export function calcTotal(pid, rounds, picks, results, lb, lr) {
  let total = 0, exact = 0, winner = 0;

  rounds.forEach(r => {
    const mult = PHASE_MULT[r.phase] || 1;
    r.games.forEach(g => {
      const s = scoreMatch(picks?.[pid]?.[r.id]?.[g.id], results?.[r.id]?.[g.id]);
      if (!s) return;
      total += s.pts * mult;
      if (s.pts === 10) exact++;
      if (s.pts >= 5)   winner++;
    });
  });

  const b = lb?.[pid];
  if (b && lr) {
    if (b.champion     && lr.champion     && b.champion === lr.champion)                             total += 30;
    if (b.runner       && lr.runner       && b.runner === lr.runner)                                 total += 15;
    if (b.topScorer    && lr.topScorer    && b.topScorer.toLowerCase() === lr.topScorer.toLowerCase()) total += 20;
    if (b.brazilPosition && lr.brazilPosition && b.brazilPosition === lr.brazilPosition)             total += 10;
  }

  return { total, exact, winner };
}
