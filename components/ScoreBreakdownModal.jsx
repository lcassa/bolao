import {
  BG_BASE, BG_CARD, BG_SURFACE, BORDER_CARD,
  PRIMARY,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_GOLD,
  BONUS_PTS, ERROR,
  SCORE_WRONG,
  MULT_HIGH, MULT_MED,
} from "../styles/colors";

// ============================================================
// SCORE BREAKDOWN MODAL — Discriminação de pontuação por rodada
// ============================================================

export function ScoreBreakdownModal({ participantName, breakdown, onClose }) {
  const { rounds, longBets, longBetsTotal, potentialRemaining, total, exact, winner } = breakdown;

  // Encontrar rodada com maior pontuação para badge "Melhor rodada"
  const maxRoundTotal = Math.max(...rounds.map(r => r.roundTotal), 0);
  const bestRoundId   = maxRoundTotal > 0
    ? rounds.find(r => r.roundTotal === maxRoundTotal)?.id
    : null;

  // Apenas rodadas com pelo menos 1 jogo com resultado
  const roundsWithResults = rounds.filter(r => r.games.some(g => g.result));

  const multColor = mult => mult >= 3 ? MULT_HIGH : mult >= 2 ? MULT_MED : TEXT_SECONDARY;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 1000,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: BG_BASE,
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "0 0 32px",
        }}
      >
        {/* Header do modal */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 18px 14px",
          borderBottom: `1px solid ${BORDER_CARD}`,
          position: "sticky", top: 0, background: BG_BASE, zIndex: 1,
        }}>
          <div>
            <p style={{ color: BONUS_PTS, fontSize: "11px", fontWeight: "700", letterSpacing: "2px", margin: "0 0 2px", textTransform: "uppercase" }}>Discriminação de pontos</p>
            <h2 style={{ color: TEXT_PRIMARY, fontFamily: "'Bebas Neue',cursive", fontSize: "24px", letterSpacing: "1px", margin: 0 }}>
              {participantName.toUpperCase()}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: BG_SURFACE, border: `1px solid ${BORDER_CARD}`, color: TEXT_SECONDARY, borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "14px 16px 0" }}>
          {/* Strip de resumo */}
          <div style={{
            background: "linear-gradient(135deg, #0f2d1a, #0d1f10)",
            border: `1px solid ${PRIMARY}`,
            borderRadius: "14px",
            padding: "16px",
            marginBottom: "20px",
            display: "flex", flexDirection: "column", gap: "8px",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ color: TEXT_GOLD, fontFamily: "'Bebas Neue',cursive", fontSize: "42px", lineHeight: 1 }}>{total}</span>
              <span style={{ color: TEXT_SECONDARY, fontSize: "16px" }}>pontos totais</span>
            </div>
            {/* Barra resumo de tiers */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "14px" }}>
              {exact > 0   && <span style={{ color: "#00e676" }}>🎯 {exact} exato{exact > 1 ? "s" : ""}</span>}
              {winner > 0  && <span style={{ color: "#29b6f6" }}>✅ {winner} vencedor{winner > 1 ? "es" : ""}</span>}
              {longBetsTotal > 0 && <span style={{ color: BONUS_PTS }}>🎰 +{longBetsTotal}pts bônus</span>}
            </div>
            {potentialRemaining > 0 && (
              <p style={{ color: TEXT_SECONDARY, fontSize: "13px", margin: 0 }}>
                +{potentialRemaining}pts ainda disponíveis
              </p>
            )}
          </div>

          {/* Rodadas */}
          {roundsWithResults.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: TEXT_SECONDARY }}>
              <p style={{ fontSize: "15px" }}>Nenhum resultado disponível ainda.</p>
            </div>
          )}

          {roundsWithResults.map(r => (
            <div key={r.id} style={{ marginBottom: "20px" }}>
              {/* Cabeçalho da rodada */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "8px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: TEXT_GOLD, fontFamily: "'Bebas Neue',cursive", fontSize: "18px", letterSpacing: "1px" }}>
                    {r.name}
                  </span>
                  {r.mult > 1 && (
                    <span style={{
                      background: BG_SURFACE, color: multColor(r.mult),
                      fontSize: "12px", fontWeight: "700",
                      padding: "2px 7px", borderRadius: "6px",
                    }}>
                      ×{r.mult}
                    </span>
                  )}
                  {r.id === bestRoundId && (
                    <span style={{ fontSize: "13px", color: TEXT_GOLD }}>⭐ melhor rodada</span>
                  )}
                </div>
                <span style={{ color: TEXT_GOLD, fontFamily: "'Bebas Neue',cursive", fontSize: "22px" }}>
                  {r.roundTotal}pts
                </span>
              </div>

              {/* Jogos da rodada */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {r.games.filter(g => g.result).map(g => {
                  const borderColor = g.score ? g.score.color : SCORE_WRONG;
                  return (
                    <div
                      key={g.id}
                      style={{
                        background: BG_CARD,
                        borderRadius: "10px",
                        borderLeft: `4px solid ${borderColor}`,
                        padding: "10px 12px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {/* Times e placar */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: TEXT_PRIMARY, fontWeight: "600", fontSize: "14px", margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {g.home} <span style={{ color: TEXT_GOLD }}>{g.result.home}–{g.result.away}</span> {g.away}
                        </p>
                        <p style={{ color: TEXT_SECONDARY, fontSize: "13px", margin: 0 }}>
                          {g.pick
                            ? <>Palpite: <span style={{ color: TEXT_PRIMARY }}>{g.pick.home}–{g.pick.away}</span></>
                            : <span style={{ color: ERROR }}>Sem palpite</span>
                          }
                        </p>
                      </div>

                      {/* Label + pontos */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {g.score ? (
                          <>
                            <p style={{ color: g.score.color, fontSize: "12px", fontWeight: "600", margin: "0 0 2px" }}>{g.score.label}</p>
                            <p style={{ color: TEXT_GOLD, fontFamily: "'Bebas Neue',cursive", fontSize: "18px", margin: 0 }}>
                              +{g.earned}pts
                            </p>
                          </>
                        ) : (
                          <p style={{ color: ERROR, fontSize: "13px", margin: 0 }}>0pts</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Apostas longas */}
          <div style={{ marginBottom: "8px" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "8px",
            }}>
              <span style={{ color: TEXT_GOLD, fontFamily: "'Bebas Neue',cursive", fontSize: "18px", letterSpacing: "1px" }}>
                Apostas de Longo Prazo
              </span>
              {longBetsTotal > 0 && (
                <span style={{ color: BONUS_PTS, fontFamily: "'Bebas Neue',cursive", fontSize: "22px" }}>
                  +{longBetsTotal}pts
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {longBets.map(b => {
                const hasResult = b.result !== null;
                const ptColor = b.hit ? BONUS_PTS : hasResult ? ERROR : TEXT_SECONDARY;
                return (
                  <div
                    key={b.key}
                    style={{
                      background: BG_CARD,
                      borderRadius: "10px",
                      borderLeft: `4px solid ${b.hit ? BONUS_PTS : hasResult ? ERROR : BORDER_CARD}`,
                      padding: "10px 12px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ color: TEXT_PRIMARY, fontWeight: "600", fontSize: "14px", margin: "0 0 3px" }}>
                        {b.icon} {b.label}
                      </p>
                      <p style={{ color: TEXT_SECONDARY, fontSize: "13px", margin: 0 }}>
                        {b.pick
                          ? <><span style={{ color: TEXT_PRIMARY }}>{b.pick}</span>{b.result ? <> → {b.result}</> : ""}</>
                          : <span style={{ color: ERROR }}>Sem aposta</span>
                        }
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ color: ptColor, fontFamily: "'Bebas Neue',cursive", fontSize: "18px", margin: 0 }}>
                        {b.hit ? `+${b.pts}pts` : hasResult ? "0pts" : `+${b.pts}?`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
