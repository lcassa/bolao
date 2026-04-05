import {
  BG_CARD, BG_BASE, BORDER_CARD,
  TEXT_PRIMARY, TEXT_SECONDARY,
  MULT_HIGH, MULT_MED,
} from "../styles/colors";
import { ScoreInput } from "./ScoreInput";
import { scoreMatch, PHASE_MULT } from "../lib/scoring";
import { VENUES } from "../data/venues";
import { fl } from "../data/teams";

// ============================================================
// GAME CARD — Card de jogo com inputs de palpite e resultado
// ============================================================

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function dayOfWeek(dateStr) {
  const [d, m] = dateStr.split("/").map(Number);
  return DAYS_PT[new Date(2026, m - 1, d).getDay()];
}

export function GameCard({ game, pick, onPickChange, result, phase, disabled }) {
  const mult = PHASE_MULT[phase] || 1;
  const s = (result?.home !== undefined && result?.home !== "" && pick)
    ? scoreMatch(pick, result)
    : null;
  const venue = VENUES[game.stadium];
  const venueStr = venue
    ? `${venue.stadium} · ${venue.city}, ${venue.country}`
    : game.stadium;
  const dow = dayOfWeek(game.date);

  return (
    <div style={{
      background:BG_CARD, borderRadius:"14px", padding:"14px 12px",
      border: s ? `2px solid ${s.color}40` : `2px solid ${BORDER_CARD}`,
      marginBottom:"10px", position:"relative",
    }}>
      {mult > 1 && (
        <div style={{
          position:"absolute", top:"10px", right:"10px",
          background: mult === 3 ? MULT_HIGH : MULT_MED,
          color:BG_BASE, borderRadius:"6px", padding:"3px 10px",
          fontSize:"14px", fontWeight:"700",
        }}>
          ×{mult}
        </div>
      )}

      <p style={{ color:TEXT_SECONDARY, fontSize:"15px", margin:"0 0 14px" }}>
        {dow}, {game.date} · {game.time} · {venueStr}
      </p>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"6px" }}>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ fontSize:"36px", marginBottom:"6px" }}>{fl(game.home)}</div>
          <p style={{ color:TEXT_PRIMARY, fontWeight:"700", fontSize:"17px", margin:0, lineHeight:"1.3" }}>{game.home}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"5px", flexShrink:0 }}>
          <ScoreInput value={pick?.home ?? ""} onChange={v => onPickChange({ ...pick, home: v })} disabled={disabled} />
          <span style={{ color:TEXT_SECONDARY, fontSize:"20px", fontWeight:"700" }}>×</span>
          <ScoreInput value={pick?.away ?? ""} onChange={v => onPickChange({ ...pick, away: v })} disabled={disabled} />
        </div>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ fontSize:"36px", marginBottom:"6px" }}>{fl(game.away)}</div>
          <p style={{ color:TEXT_PRIMARY, fontWeight:"700", fontSize:"17px", margin:0, lineHeight:"1.3" }}>{game.away}</p>
        </div>
      </div>

      {result?.home !== undefined && result?.home !== "" && (
        <div style={{ marginTop:"10px", padding:"8px 12px", background:BG_BASE, borderRadius:"8px", textAlign:"center" }}>
          <span style={{ color:TEXT_SECONDARY, fontSize:"15px" }}>Resultado: </span>
          <span style={{ color:TEXT_PRIMARY, fontWeight:"700", fontSize:"16px" }}>{result.home} × {result.away}</span>
          {s && <span style={{ marginLeft:"10px", color:s.color, fontWeight:"700", fontSize:"15px" }}>+{s.pts * mult}pts</span>}
        </div>
      )}
    </div>
  );
}
