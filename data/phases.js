import {
  SCORE_EXACT, SCORE_WINNER_DIFF, SCORE_WINNER, SCORE_ONE_TEAM, SCORE_WRONG,
} from "../styles/colors";

// ============================================================
// PHASES — Fases do torneio com multiplicadores de pontuação
// ============================================================

export const PHASES = [
  { id: "grupos",    label: "Fase de Grupos",    mult: 1 },
  { id: "dezesseis", label: "Rodada de 16",       mult: 2 },
  { id: "oitavas",   label: "Oitavas de Final",   mult: 2 },
  { id: "quartas",   label: "Quartas de Final",   mult: 2 },
  { id: "semi",      label: "Semifinal",           mult: 3 },
  { id: "final",     label: "Final",               mult: 3 },
];

// ============================================================
// SCORING — Descrição dos 5 tiers de pontuação (usado no modal)
// ============================================================

export const SCORING = [
  {
    pts: 10, label: "Placar Exato", icon: "🎯", color: SCORE_EXACT,
    desc: "Acertou os gols de ambos os times exatamente",
    example: { pick: "Brasil 2 × 1 Marrocos", result: "Brasil 2 × 1 Marrocos" },
  },
  {
    pts: 7, label: "Vencedor + Saldo", icon: "✅", color: SCORE_WINNER_DIFF,
    desc: "Acertou quem venceu e a diferença de gols",
    example: { pick: "Brasil 2 × 0 Marrocos", result: "Brasil 3 × 1 Marrocos", note: "Saldo de 2 em ambos" },
  },
  {
    pts: 5, label: "Vencedor / Empate", icon: "👍", color: SCORE_WINNER,
    desc: "Acertou quem ganhou (ou empate), mas errou placar e saldo",
    example: { pick: "Brasil 3 × 0 Marrocos", result: "Brasil 1 × 0 Marrocos" },
  },
  {
    pts: 2, label: "Um Time Certo", icon: "🤏", color: SCORE_ONE_TEAM,
    desc: "Acertou os gols de um dos times, mas errou o vencedor",
    example: { pick: "Brasil 1 × 2 Marrocos", result: "Brasil 1 × 1 Marrocos", note: "Brasil: 1 gol acertado" },
  },
  {
    pts: 0, label: "Erro Total", icon: "❌", color: SCORE_WRONG,
    desc: "Não acertou nada",
    example: { pick: "Brasil 0 × 3 Marrocos", result: "Brasil 2 × 1 Marrocos" },
  },
];
