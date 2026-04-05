import { useState } from "react";
import {
  BG_BASE, BG_CARD, BG_SURFACE, BORDER_CARD,
  HEADER_GRADIENT, HEADER_USER_BG,
  PRIMARY, PRIMARY_HOVER,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_GOLD,
  BONUS_PTS, DANGER_BG, ERROR,
  MEDAL_GOLD, MEDAL_SILVER, MEDAL_BRONZE,
} from "../styles/colors";
import { ScoringModal } from "./ScoringModal";
import { GameCard } from "./GameCard";
import { LongBetsUser } from "./LongBetsUser";
import { calcTotal, PHASE_MULT } from "../lib/scoring";
import { TEAM_TO_GROUP } from "../data/teams";

// ============================================================
// USER VIEW — Interface do participante
// Abas: Palpites | Apostas Longas | Ranking
// ============================================================

export function UserView({
  participant, rounds, picks, onPicksChange,
  results, longBets, onLongBetsChange, longResults,
  participants, onBack,
}) {
  const [tab, setTab] = useState("picks");
  const [showScoring, setShowScoring] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeRounds = rounds.filter(r => r.active);
  const stats = calcTotal(participant.id, rounds, picks, results, longBets, longResults);
  const ranking = participants
    .map(p => ({ ...p, ...calcTotal(p.id, rounds, picks, results, longBets, longResults) }))
    .sort((a, b) => b.total - a.total || b.exact - a.exact || b.winner - a.winner);

  return (
    <div style={{ minHeight:"100vh", background:BG_BASE, fontFamily:"'Outfit',sans-serif" }}>
      {showScoring && <ScoringModal onClose={() => setShowScoring(false)} />}

      {/* Header */}
      <div style={{ background:HEADER_GRADIENT, padding:"22px 18px 18px", borderBottom:`1px solid ${BORDER_CARD}` }}>
        <div style={{ maxWidth:"480px", margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p style={{ color:BONUS_PTS, fontSize:"13px", fontWeight:"600", letterSpacing:"3px", margin:"0 0 4px", textTransform:"uppercase" }}>Bolão da Copa 2026</p>
            <h1 style={{ color:TEXT_PRIMARY, fontFamily:"'Bebas Neue',cursive", fontSize:"32px", letterSpacing:"2px", margin:"0 0 4px" }}>Olá, {participant.name}! 👋</h1>
            <p style={{ color:TEXT_SECONDARY, fontSize:"16px", margin:0 }}>
              <span style={{ color:TEXT_GOLD, fontWeight:"700", fontSize:"28px", fontFamily:"'Bebas Neue',cursive" }}>{stats.total}</span>
              {" "}pontos · 🎯{stats.exact} exatos
            </p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"8px", alignItems:"flex-end" }}>
            <button onClick={() => setShowScoring(true)} style={{ background:BG_SURFACE, border:`1px solid ${BORDER_CARD}`, color:TEXT_SECONDARY, borderRadius:"8px", padding:"9px 14px", cursor:"pointer", fontSize:"15px", fontFamily:"'Outfit',sans-serif" }}>ℹ️ Pontuação</button>
            <button onClick={onBack} style={{ background:"none", border:"none", color:TEXT_SECONDARY, cursor:"pointer", fontSize:"15px", fontFamily:"'Outfit',sans-serif" }}>← Trocar</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:"480px", margin:"0 auto", padding:"0 14px" }}>
        {/* Tabs */}
        <div style={{ display:"flex", marginTop:"14px", background:BG_CARD, borderRadius:"10px", padding:"3px" }}>
          {[{id:"picks",label:"Palpites"},{id:"longbet",label:"Apostas Longas"},{id:"ranking",label:"Ranking"}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:"11px 0", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"16px", fontWeight:"600", background:tab===t.id?PRIMARY:"transparent", color:tab===t.id?"#fff":TEXT_SECONDARY, fontFamily:"'Outfit',sans-serif" }}>{t.label}</button>
          ))}
        </div>

        {/* ── Tab: Palpites ── */}
        {tab === "picks" && (
          <div style={{ marginTop:"14px", paddingBottom:"85px" }}>
            {activeRounds.length === 0
              ? <div style={{ textAlign:"center", padding:"60px 20px", color:TEXT_SECONDARY }}>
                  <div style={{ fontSize:"44px", marginBottom:"12px" }}>⏳</div>
                  <p>Nenhuma rodada aberta.<br/>Aguarda o admin liberar!</p>
                </div>
              : activeRounds.map(round => {
                  const parseDate = d => { const [day, mon] = d.split("/").map(Number); return mon * 100 + day; };
                  const renderCard = game => (
                    <GameCard
                      key={game.id}
                      game={game}
                      phase={round.phase}
                      pick={picks?.[participant.id]?.[round.id]?.[game.id]}
                      result={results?.[round.id]?.[game.id]}
                      disabled={round.locked}
                      onPickChange={val => onPicksChange(p => ({
                        ...p,
                        [participant.id]: {
                          ...(p[participant.id] || {}),
                          [round.id]: {
                            ...(p[participant.id]?.[round.id] || {}),
                            [game.id]: val,
                          },
                        },
                      }))}
                    />
                  );

                  const roundHeader = (
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", margin:"22px 0 12px" }}>
                      <h2 style={{ color:TEXT_GOLD, fontFamily:"'Bebas Neue',cursive", fontSize:"22px", letterSpacing:"1px", margin:0 }}>{round.name}</h2>
                      <span style={{ background:BG_SURFACE, color:TEXT_SECONDARY, borderRadius:"5px", padding:"3px 8px", fontSize:"14px" }}>×{PHASE_MULT[round.phase]}</span>
                      {round.locked && <span style={{ background:DANGER_BG, color:ERROR, borderRadius:"5px", padding:"3px 8px", fontSize:"14px" }}>🔒</span>}
                    </div>
                  );

                  if (round.phase === "grupos") {
                    const byGroup = {};
                    round.games.forEach(g => {
                      const gr = TEAM_TO_GROUP[g.home] || TEAM_TO_GROUP[g.away] || "Outros";
                      (byGroup[gr] = byGroup[gr] || []).push(g);
                    });
                    const sortedGroups = Object.keys(byGroup).sort();
                    sortedGroups.forEach(gr => byGroup[gr].sort((a, b) => parseDate(a.date) - parseDate(b.date)));
                    return (
                      <div key={round.id}>
                        {roundHeader}
                        {sortedGroups.map(gr => (
                          <div key={gr}>
                            <div style={{ display:"flex", alignItems:"center", gap:"8px", margin:"16px 0 8px" }}>
                              <span style={{ color:"#c9d1d9", fontFamily:"'Bebas Neue',cursive", fontSize:"17px", letterSpacing:"1px", background:BG_SURFACE, borderRadius:"6px", padding:"3px 10px" }}>{gr}</span>
                            </div>
                            {byGroup[gr].map(renderCard)}
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div key={round.id}>
                      {roundHeader}
                      {round.games.slice().sort((a, b) => parseDate(a.date) - parseDate(b.date)).map(renderCard)}
                    </div>
                  );
                })
            }
          </div>
        )}

        {/* ── Tab: Apostas Longas ── */}
        {tab === "longbet" && (
          <div style={{ marginTop:"14px", paddingBottom:"85px" }}>
            <LongBetsUser participant={participant} longBets={longBets} onLongBetsChange={onLongBetsChange} longResults={longResults} />
          </div>
        )}

        {/* ── Tab: Ranking ── */}
        {tab === "ranking" && (
          <div style={{ marginTop:"14px", paddingBottom:"40px" }}>
            {ranking.map((p, i) => (
              <div key={p.id} style={{
                display:"flex", alignItems:"center", gap:"14px",
                background: p.id === participant.id ? HEADER_USER_BG : BG_CARD,
                border: p.id === participant.id ? `2px solid ${PRIMARY}` : `2px solid ${BORDER_CARD}`,
                borderRadius:"14px", padding:"16px", marginBottom:"10px",
              }}>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"26px", minWidth:"36px", textAlign:"center", color: i===0?MEDAL_GOLD : i===1?MEDAL_SILVER : i===2?MEDAL_BRONZE : TEXT_SECONDARY }}>
                  {i===0 ? "🥇" : i===1 ? "🥈" : i===2 ? "🥉" : `${i+1}º`}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ color:TEXT_PRIMARY, fontWeight:"700", margin:"0 0 4px", fontSize:"18px" }}>{p.name}{p.id === participant.id ? " (você)" : ""}</p>
                  <p style={{ color:TEXT_SECONDARY, fontSize:"15px", margin:0 }}>🎯{p.exact} exatos · 👍{p.winner} vencedores</p>
                </div>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"32px", color:TEXT_GOLD }}>{p.total}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botão Salvar (fixo no rodapé, exceto na aba ranking) */}
      {tab !== "ranking" && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"10px 14px", background:`linear-gradient(transparent,${BG_BASE} 40%)` }}>
          <div style={{ maxWidth:"480px", margin:"0 auto" }}>
            <button
              onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
              style={{ width:"100%", padding:"14px", background:saved?PRIMARY_HOVER:PRIMARY, color:"#fff", border:"none", borderRadius:"12px", fontSize:"15px", fontWeight:"700", cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}
            >
              {saved ? "✅ Palpites Salvos!" : "💾 Salvar Palpites"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
