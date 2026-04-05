import {
  BG_CARD, BG_BASE, BORDER_INPUT,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_GOLD,
  BONUS_PTS, ERROR,
} from "../styles/colors";
import { TeamSelect } from "./TeamSelect";

// ============================================================
// LONG BETS USER — Seção de apostas de longo prazo do participante
// ============================================================

const BRAZIL_OPTS = [
  "Campeão", "Vice", "3º Lugar", "4º Lugar",
  "Semifinal", "Quartas", "Oitavas", "Rodada de 16", "Fase de Grupos",
];

const BETS_CONFIG = [
  { key: "champion",      label: "Campeão da Copa",     pts: 30, icon: "🥇", type: "team"   },
  { key: "runner",        label: "Vice-Campeão",         pts: 15, icon: "🥈", type: "team"   },
  { key: "topScorer",     label: "Artilheiro da Copa",   pts: 20, icon: "⚽", type: "scorer" },
  { key: "brazilPosition",label: "Posição do Brasil",    pts: 10, icon: "🇧🇷", type: "brazil" },
];

const fieldStyle = {
  width: "100%", padding: "13px 14px", background: BG_BASE,
  border: `2px solid ${BORDER_INPUT}`, borderRadius: "10px", color: TEXT_PRIMARY,
  fontSize: "17px", fontFamily: "'Outfit',sans-serif", outline: "none", boxSizing: "border-box",
};

export function LongBetsUser({ participant, longBets, onLongBetsChange, longResults }) {
  const pid = participant.id;
  const val = (key) => longBets?.[pid]?.[key] || "";
  const set = (key, v) => onLongBetsChange(p => ({ ...p, [pid]: { ...(p[pid] || {}), [key]: v } }));

  return (
    <div style={{ background:BG_CARD, borderRadius:"14px", padding:"20px" }}>
      <p style={{ color:TEXT_GOLD, fontFamily:"'Bebas Neue',cursive", fontSize:"22px", letterSpacing:"1px", margin:"0 0 4px" }}>
        🏆 APOSTAS DE LONGO PRAZO
      </p>
      <p style={{ color:TEXT_SECONDARY, fontSize:"16px", margin:"0 0 22px" }}>
        Servem como critério de desempate e podem virar o bolão no final!
      </p>

      {BETS_CONFIG.map(bet => (
        <div key={bet.key} style={{ marginBottom:"22px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
            <label style={{ color:TEXT_PRIMARY, fontWeight:"700", fontSize:"17px" }}>{bet.icon} {bet.label}</label>
            <span style={{ color:BONUS_PTS, fontSize:"16px", fontWeight:"700" }}>+{bet.pts}pts</span>
          </div>

          {bet.type === "team" && (
            <TeamSelect value={val(bet.key)} onChange={v => set(bet.key, v)} placeholder="Selecione um time..." />
          )}

          {bet.type === "scorer" && (
            <div>
              <input
                type="text"
                placeholder="Digite o nome do jogador..."
                value={val(bet.key)}
                onChange={e => set(bet.key, e.target.value)}
                style={fieldStyle}
              />
              <p style={{ color:TEXT_SECONDARY, fontSize:"14px", margin:"6px 0 0" }}>
                ⏳ Lista oficial de convocados disponível em maio/2026
              </p>
            </div>
          )}

          {bet.type === "brazil" && (
            <select value={val(bet.key)} onChange={e => set(bet.key, e.target.value)} style={fieldStyle}>
              <option value="">Selecione a posição...</option>
              {BRAZIL_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          )}

          {longResults?.[bet.key] && (
            <p style={{ margin:"7px 0 0", fontSize:"15px", color: val(bet.key) === longResults[bet.key] ? BONUS_PTS : ERROR }}>
              Resultado: {longResults[bet.key]} {val(bet.key) === longResults[bet.key] ? "✅ Acertou!" : "❌"}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
