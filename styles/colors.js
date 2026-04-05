// ============================================================
// COLOR TOKENS — Bolão da Copa 2026
// Single source of truth for all colors in the app.
// ============================================================

// ─── BACKGROUNDS ─────────────────────────────────────────────
export const BG_BASE      = "#0d1117";   // Página, inputs, modais
export const BG_CARD      = "#161b22";   // Cards, painéis, seções
export const BG_DROPDOWN  = "#1c2128";   // Dropdown overlay
export const BG_SURFACE   = "#21262d";   // Botões secundários, badges, divisores
export const BORDER_INPUT = "#30363d";   // Bordas de input e dashed outlines
export const BORDER_CARD  = "#21262d";   // Bordas de card (alias de BG_SURFACE)

// ─── TEXT ─────────────────────────────────────────────────────
export const TEXT_PRIMARY   = "#e6edf3"; // Texto principal
export const TEXT_SECONDARY = "#9ca8b3"; // Texto secundário — contraste ~4.65:1 sobre BG_CARD (WCAG AA ✓)
export const TEXT_MUTED     = "#c9d1d9"; // Badges de grupo, texto terciário
export const TEXT_GOLD      = "#ffe066"; // Destaques dourados, totais de pontos, títulos de seção

// ─── PRIMARY INTERACTIVE (verde único) ───────────────────────
export const PRIMARY       = "#238636"; // Tabs ativas, hover states, botões de ação, botão Salvar
export const PRIMARY_HOVER = "#2ea043"; // Hover variant (levemente mais claro)

// ─── HEADER ──────────────────────────────────────────────────
// Antes: linear-gradient(135deg, #0d2010, #0a1a0a) — quase invisível sobre #0d1117
// Depois: verde escuro visivelmente distinto, mantém o tom premium/esportivo
export const HEADER_GRADIENT = "linear-gradient(135deg, #0f2d1a, #0d1f10)";
export const HEADER_USER_BG  = "#0f2d1a"; // Fundo do card do usuário logado no ranking

// ─── SCORING TIERS (5 cores perceptualmente distintas) ────────
// Verde → Azul → Amarelo → Laranja → Vermelho
export const SCORE_EXACT       = "#00e676"; // 10pts — Verde menta brilhante
export const SCORE_WINNER_DIFF = "#29b6f6"; // 7pts — Azul céu (era #69f0ae, agora distinto do tier 10pts)
export const SCORE_WINNER      = "#ffeb3b"; // 5pts — Amarelo
export const SCORE_ONE_TEAM    = "#ff9800"; // 2pts — Laranja
export const SCORE_WRONG       = "#f85149"; // 0pts — Vermelho

// ─── BONUS / APOSTAS LONGAS ───────────────────────────────────
export const BONUS_PTS = "#34d399"; // Label de pontos bônus (era #69f0ae — agora sem conflito semântico)

// ─── MULTIPLIER BADGES ────────────────────────────────────────
export const MULT_HIGH = "#ffe066"; // ×3 — ouro (fases finais)
export const MULT_MED  = "#ff9800"; // ×2 — laranja

// ─── DANGER / ADMIN / ERROR ───────────────────────────────────
export const DANGER    = "#b91c1c";   // Tabs de admin, botões destrutivos, rodadas fechadas
export const DANGER_BG = "#b91c1c22"; // Fundo translúcido para badge de rodada fechada
export const ERROR     = "#f85149";   // Erro/errou — igual SCORE_WRONG (semântica consistente)

// ─── RANKING MEDALS ───────────────────────────────────────────
export const MEDAL_GOLD   = "#ffe066"; // 1º lugar
export const MEDAL_SILVER = "#c0c0c0"; // 2º lugar
export const MEDAL_BRONZE = "#cd7f32"; // 3º lugar
