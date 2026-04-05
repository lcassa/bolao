// ============================================================
// TEAMS — 48 seleções da Copa 2026
// ============================================================

export const TEAMS_BY_GROUP = {
  "Grupo A": ["México", "África do Sul", "Coreia do Sul", "Tchéquia"],
  "Grupo B": ["Canadá", "Bósnia-Herz.", "Catar", "Suíça"],
  "Grupo C": ["Brasil", "Marrocos", "Escócia", "Haiti"],
  "Grupo D": ["Estados Unidos", "Paraguai", "Austrália", "Turquia"],
  "Grupo E": ["Alemanha", "Curaçao", "Costa do Marfim", "Equador"],
  "Grupo F": ["Holanda", "Japão", "Suécia", "Tunísia"],
  "Grupo G": ["Bélgica", "Egito", "Irã", "Nova Zelândia"],
  "Grupo H": ["Espanha", "Cabo Verde", "Arábia Saudita", "Uruguai"],
  "Grupo I": ["França", "Senegal", "Iraque", "Noruega"],
  "Grupo J": ["Argentina", "Argélia", "Áustria", "Jordânia"],
  "Grupo K": ["Portugal", "RD Congo", "Uzbequistão", "Colômbia"],
  "Grupo L": ["Inglaterra", "Croácia", "Gana", "Panamá"],
};

export const ALL_TEAMS = Object.values(TEAMS_BY_GROUP).flat();

export const TEAM_TO_GROUP = {};
Object.entries(TEAMS_BY_GROUP).forEach(([group, teams]) => {
  teams.forEach(team => { TEAM_TO_GROUP[team] = group; });
});

export const FLAGS = {
  "Brasil": "🇧🇷", "Argentina": "🇦🇷", "França": "🇫🇷", "Alemanha": "🇩🇪",
  "Espanha": "🇪🇸", "Portugal": "🇵🇹", "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Holanda": "🇳🇱",
  "Bélgica": "🇧🇪", "Croácia": "🇭🇷", "Marrocos": "🇲🇦", "México": "🇲🇽",
  "Japão": "🇯🇵", "Coreia do Sul": "🇰🇷", "Austrália": "🇦🇺", "Suíça": "🇨🇭",
  "Uruguai": "🇺🇾", "Colômbia": "🇨🇴", "Estados Unidos": "🇺🇸", "Canadá": "🇨🇦",
  "Senegal": "🇸🇳", "Gana": "🇬🇭", "Tunísia": "🇹🇳", "Equador": "🇪🇨",
  "Irã": "🇮🇷", "Arábia Saudita": "🇸🇦", "Catar": "🇶🇦", "Haiti": "🇭🇹",
  "Escócia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Paraguai": "🇵🇾", "Turquia": "🇹🇷", "África do Sul": "🇿🇦",
  "Tchéquia": "🇨🇿", "Bósnia-Herz.": "🇧🇦", "Noruega": "🇳🇴", "Suécia": "🇸🇪",
  "Argélia": "🇩🇿", "Áustria": "🇦🇹", "Jordânia": "🇯🇴", "Iraque": "🇮🇶",
  "Uzbequistão": "🇺🇿", "RD Congo": "🇨🇩", "Panamá": "🇵🇦", "Curaçao": "🇨🇼",
  "Costa do Marfim": "🇨🇮", "Nova Zelândia": "🇳🇿", "Egito": "🇪🇬", "Cabo Verde": "🇨🇻",
};

/** Retorna a flag emoji de um time, ou 🏳️ se não encontrado */
export const fl = (name) => FLAGS[name] || "🏳️";
