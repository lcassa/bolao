import { useState } from "react";
import {
  BG_BASE, BG_CARD, BG_SURFACE, BORDER_CARD, BORDER_INPUT,
  PRIMARY, DANGER, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_GOLD,
  ERROR, MULT_MED,
} from "../styles/colors";
import { TeamSelect } from "./TeamSelect";
import { PHASES } from "../data/phases";
import { fl } from "../data/teams";

// ============================================================
// ADMIN VIEW — Painel de controle administrativo
// Abas: Rodadas | Participantes | Resultados
// ============================================================

const inp = {
  width:"100%", padding:"9px 11px", background:BG_BASE,
  border:`2px solid ${BORDER_INPUT}`, borderRadius:"7px",
  color:TEXT_PRIMARY, fontSize:"13px", fontFamily:"'Outfit',sans-serif",
  outline:"none", boxSizing:"border-box", marginBottom:"7px",
};

const btn = (bg, fg = "#fff") => ({
  background: bg, color: fg, border:"none", borderRadius:"7px",
  padding:"9px 12px", cursor:"pointer",
  fontFamily:"'Outfit',sans-serif", fontWeight:"700", fontSize:"12px",
});

const BRAZIL_OPTS = [
  "Campeão", "Vice", "3º Lugar", "4º Lugar",
  "Semifinal", "Quartas", "Oitavas", "Rodada de 16", "Fase de Grupos",
];

export function AdminView({
  rounds, setRounds,
  participants, setParticipants,
  results, setResults,
  longResults, setLongResults,
  pins, onResetPin,
  onLogout,
}) {
  const [tab, setTab] = useState("rounds");
  const [newRound, setNewRound] = useState({ name: "", phase: "grupos" });
  const [newParticipant, setNewParticipant] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [newGame, setNewGame] = useState({ home: "", away: "", date: "", time: "", stadium: "" });
  const [toolsPass, setToolsPass] = useState("");
  const [seedStatus, setSeedStatus] = useState(null); // null | "loading" | "ok" | "error"
  const [resetStatus, setResetStatus] = useState(null);

  const handleSeed = async () => {
    setSeedStatus("loading");
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: toolsPass }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setSeedStatus("error:" + error);
      } else {
        setSeedStatus("ok");
        setTimeout(() => window.location.reload(), 800);
      }
    } catch {
      setSeedStatus("error:falha na requisição");
    }
  };

  const handleReset = async () => {
    setResetStatus("loading");
    try {
      const res = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: toolsPass }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setResetStatus("error:" + error);
      } else {
        setResetStatus("ok");
        setTimeout(() => window.location.reload(), 800);
      }
    } catch {
      setResetStatus("error:falha na requisição");
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:BG_BASE, fontFamily:"'Outfit',sans-serif" }}>
      {/* Header */}
      <div style={{ background:BG_CARD, padding:"14px 16px", borderBottom:`1px solid ${BORDER_CARD}` }}>
        <div style={{ maxWidth:"600px", margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ color:ERROR, fontSize:"10px", fontWeight:"700", letterSpacing:"3px", margin:"0 0 1px", textTransform:"uppercase" }}>🔐 Admin</p>
            <h1 style={{ color:TEXT_PRIMARY, fontFamily:"'Bebas Neue',cursive", fontSize:"22px", letterSpacing:"2px", margin:0 }}>Bolão Copa 2026</h1>
          </div>
          <button onClick={onLogout} style={btn(BG_SURFACE, TEXT_SECONDARY)}>Sair</button>
        </div>
      </div>

      <div style={{ maxWidth:"600px", margin:"0 auto", padding:"0 14px" }}>
        {/* Tabs */}
        <div style={{ display:"flex", marginTop:"14px", background:BG_CARD, borderRadius:"10px", padding:"3px" }}>
          {[{id:"rounds",label:"Rodadas"},{id:"participants",label:"Participantes"},{id:"results",label:"Resultados"}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:"11px 0", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"16px", fontWeight:"600", background:tab===t.id?DANGER:"transparent", color:tab===t.id?"#fff":TEXT_SECONDARY, fontFamily:"'Outfit',sans-serif" }}>{t.label}</button>
          ))}
        </div>

        {/* ── Tab: Rodadas ── */}
        {tab === "rounds" && (
          <div style={{ marginTop:"14px", paddingBottom:"40px" }}>
            <div style={{ background:BG_CARD, borderRadius:"12px", padding:"16px", marginBottom:"14px" }}>
              <p style={{ color:TEXT_GOLD, fontWeight:"700", margin:"0 0 10px", fontSize:"14px" }}>Nova Rodada</p>
              <input placeholder="Nome da rodada" value={newRound.name} onChange={e => setNewRound(p => ({ ...p, name: e.target.value }))} style={inp} />
              <select value={newRound.phase} onChange={e => setNewRound(p => ({ ...p, phase: e.target.value }))} style={inp}>
                {PHASES.map(p => <option key={p.id} value={p.id}>{p.label} (×{p.mult})</option>)}
              </select>
              <button
                onClick={() => {
                  if (!newRound.name.trim()) return;
                  setRounds(p => [...p, { id: Date.now().toString(), name: newRound.name.trim(), phase: newRound.phase, active: false, locked: false, games: [] }]);
                  setNewRound({ name: "", phase: "grupos" });
                }}
                style={{ ...btn(PRIMARY), width:"100%" }}
              >
                + Criar Rodada
              </button>
            </div>

            {rounds.map(round => (
              <div key={round.id} style={{ background:BG_CARD, borderRadius:"12px", padding:"14px", marginBottom:"10px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"6px" }}>
                  <div>
                    <p style={{ color:TEXT_PRIMARY, fontWeight:"700", margin:"0 0 1px", fontSize:"14px" }}>{round.name}</p>
                    <p style={{ color:TEXT_SECONDARY, fontSize:"11px", margin:0 }}>{PHASES.find(p => p.id === round.phase)?.label} · {round.games.length} jogos</p>
                  </div>
                  <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
                    <button onClick={() => setRounds(p => p.map(r => r.id === round.id ? { ...r, active: !r.active } : r))} style={btn(round.active ? PRIMARY : BG_SURFACE, round.active ? "#fff" : TEXT_SECONDARY)}>{round.active ? "✅ Aberta" : "Abrir"}</button>
                    <button onClick={() => setRounds(p => p.map(r => r.id === round.id ? { ...r, locked: !r.locked } : r))} style={btn(round.locked ? DANGER : BG_SURFACE, round.locked ? "#fff" : TEXT_SECONDARY)}>{round.locked ? "🔒 Fechada" : "Fechar"}</button>
                    <button onClick={() => setExpanded(expanded === round.id ? null : round.id)} style={btn(BG_SURFACE, TEXT_SECONDARY)}>⚙️</button>
                    <button onClick={() => setRounds(p => p.filter(r => r.id !== round.id))} style={btn(BG_SURFACE, ERROR)}>✕</button>
                  </div>
                </div>

                {expanded === round.id && (
                  <div style={{ marginTop:"12px", borderTop:`1px solid ${BORDER_CARD}`, paddingTop:"12px" }}>
                    {round.games.map(game => (
                      <div key={game.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:`1px solid ${BORDER_CARD}` }}>
                        <span style={{ color:TEXT_PRIMARY, fontSize:"12px" }}>{fl(game.home)} {game.home} × {game.away} {fl(game.away)} · {game.date} {game.time}</span>
                        <button onClick={() => setRounds(p => p.map(r => r.id === round.id ? { ...r, games: r.games.filter(g => g.id !== game.id) } : r))} style={{ background:"none", border:"none", color:ERROR, cursor:"pointer", fontSize:"14px" }}>✕</button>
                      </div>
                    ))}
                    <div style={{ marginTop:"10px" }}>
                      <p style={{ color:TEXT_SECONDARY, fontSize:"11px", fontWeight:"600", marginBottom:"7px" }}>Adicionar Jogo</p>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px" }}>
                        <input placeholder="Time Casa" value={newGame.home} onChange={e => setNewGame(p => ({ ...p, home: e.target.value }))} style={{ ...inp, marginBottom:0 }} />
                        <input placeholder="Time Fora" value={newGame.away} onChange={e => setNewGame(p => ({ ...p, away: e.target.value }))} style={{ ...inp, marginBottom:0 }} />
                        <input placeholder="Data (12/06)" value={newGame.date} onChange={e => setNewGame(p => ({ ...p, date: e.target.value }))} style={{ ...inp, marginBottom:0 }} />
                        <input placeholder="Hora (16h)" value={newGame.time} onChange={e => setNewGame(p => ({ ...p, time: e.target.value }))} style={{ ...inp, marginBottom:0 }} />
                      </div>
                      <input placeholder="Estádio (opcional)" value={newGame.stadium} onChange={e => setNewGame(p => ({ ...p, stadium: e.target.value }))} style={{ ...inp, marginTop:"5px" }} />
                      <button
                        onClick={() => {
                          if (!newGame.home || !newGame.away) return;
                          setRounds(p => p.map(r => r.id === round.id ? { ...r, games: [...r.games, { ...newGame, id: Date.now().toString() }] } : r));
                          setNewGame({ home: "", away: "", date: "", time: "", stadium: "" });
                        }}
                        style={{ ...btn(PRIMARY), width:"100%" }}
                      >
                        + Adicionar Jogo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Participantes ── */}
        {tab === "participants" && (
          <div style={{ marginTop:"14px", paddingBottom:"40px" }}>
            <div style={{ background:BG_CARD, borderRadius:"12px", padding:"16px", marginBottom:"14px" }}>
              <p style={{ color:TEXT_GOLD, fontWeight:"700", margin:"0 0 10px", fontSize:"14px" }}>Adicionar Participante</p>
              <input
                placeholder="Nome do participante"
                value={newParticipant}
                onChange={e => setNewParticipant(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && newParticipant.trim()) {
                    setParticipants(p => [...p, { id: Date.now().toString(), name: newParticipant.trim() }]);
                    setNewParticipant("");
                  }
                }}
                style={inp}
              />
              <button
                onClick={() => {
                  if (!newParticipant.trim()) return;
                  setParticipants(p => [...p, { id: Date.now().toString(), name: newParticipant.trim() }]);
                  setNewParticipant("");
                }}
                style={{ ...btn(PRIMARY), width:"100%" }}
              >
                + Adicionar
              </button>
            </div>

            <p style={{ color:TEXT_SECONDARY, fontSize:"15px", margin:"0 0 12px" }}>{participants.length} participantes cadastrados</p>

            {participants.map(p => (
              <div key={p.id} style={{ background:BG_CARD, borderRadius:"12px", padding:"14px 16px", marginBottom:"10px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: pins?.[p.id] ? "10px" : "0" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <span style={{ fontSize:"22px" }}>{pins?.[p.id] ? "🔒" : "🆕"}</span>
                    <p style={{ color:TEXT_PRIMARY, fontWeight:"700", margin:0, fontSize:"16px" }}>{p.name}</p>
                  </div>
                  <button onClick={() => setParticipants(prev => prev.filter(x => x.id !== p.id))} style={{ background:"none", border:"none", color:ERROR, cursor:"pointer", fontSize:"18px" }}>✕</button>
                </div>
                {pins?.[p.id] && (
                  <button onClick={() => onResetPin(p.id)} style={{ width:"100%", padding:"9px", background:BG_SURFACE, border:`1px solid ${BORDER_INPUT}`, borderRadius:"8px", color:MULT_MED, cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:"700", fontSize:"14px" }}>
                    🔓 Resetar PIN
                  </button>
                )}
              </div>
            ))}

            {/* ── Ferramentas de Teste ── */}
            <div style={{ background:BG_CARD, borderRadius:"12px", padding:"16px", marginTop:"20px", border:`1px solid ${DANGER}33` }}>
              <p style={{ color:DANGER, fontWeight:"700", margin:"0 0 4px", fontSize:"14px" }}>Ferramentas de Teste</p>
              <p style={{ color:TEXT_SECONDARY, fontSize:"11px", margin:"0 0 12px" }}>Ações destrutivas — confirme com a senha admin.</p>

              <input
                type="password"
                placeholder="Senha admin"
                value={toolsPass}
                onChange={e => { setToolsPass(e.target.value); setSeedStatus(null); setResetStatus(null); }}
                style={inp}
              />

              {/* Seed */}
              <button
                onClick={handleSeed}
                disabled={seedStatus === "loading" || resetStatus === "loading"}
                style={{ ...btn(PRIMARY), width:"100%", marginBottom:"6px", opacity: seedStatus === "loading" ? 0.6 : 1 }}
              >
                {seedStatus === "loading" ? "Carregando..." : "Carregar Dados de Teste"}
              </button>
              {seedStatus === "ok" && <p style={{ color:PRIMARY, fontSize:"11px", margin:"0 0 8px" }}>Dados carregados! Recarregando...</p>}
              {typeof seedStatus === "string" && seedStatus.startsWith("error:") && (
                <p style={{ color:ERROR, fontSize:"11px", margin:"0 0 8px" }}>{seedStatus.replace("error:", "")}</p>
              )}
              <p style={{ color:TEXT_SECONDARY, fontSize:"11px", margin:"0 0 10px" }}>
                Cria Alice, Bob e Carlos (PINs 1234/5678/9012) com palpites e resultados da Rodada 1.
              </p>

              {/* Reset */}
              <button
                onClick={handleReset}
                disabled={seedStatus === "loading" || resetStatus === "loading"}
                style={{ ...btn(DANGER), width:"100%", marginBottom:"6px", opacity: resetStatus === "loading" ? 0.6 : 1 }}
              >
                {resetStatus === "loading" ? "Limpando..." : "Limpar Banco Completo"}
              </button>
              {resetStatus === "ok" && <p style={{ color:PRIMARY, fontSize:"11px", margin:"0 0 8px" }}>Banco limpo! Recarregando...</p>}
              {typeof resetStatus === "string" && resetStatus.startsWith("error:") && (
                <p style={{ color:ERROR, fontSize:"11px", margin:"0 0 8px" }}>{resetStatus.replace("error:", "")}</p>
              )}
              <p style={{ color:TEXT_SECONDARY, fontSize:"11px", margin:0 }}>
                Apaga todos os dados. As rodadas padrão são recriadas automaticamente no reload.
              </p>
            </div>
          </div>
        )}

        {/* ── Tab: Resultados ── */}
        {tab === "results" && (
          <div style={{ marginTop:"14px", paddingBottom:"40px" }}>
            {/* Resultados de longo prazo */}
            <div style={{ background:BG_CARD, borderRadius:"12px", padding:"16px", marginBottom:"14px" }}>
              <p style={{ color:TEXT_GOLD, fontWeight:"700", margin:"0 0 12px", fontSize:"14px" }}>🏆 Resultados de Longo Prazo</p>

              <label style={{ color:TEXT_SECONDARY, fontSize:"11px" }}>Campeão</label>
              <TeamSelect value={longResults?.champion || ""} onChange={v => setLongResults(p => ({ ...p, champion: v }))} placeholder="Selecione o campeão..." />
              <div style={{ marginBottom:"7px" }} />

              <label style={{ color:TEXT_SECONDARY, fontSize:"11px" }}>Vice-Campeão</label>
              <TeamSelect value={longResults?.runner || ""} onChange={v => setLongResults(p => ({ ...p, runner: v }))} placeholder="Selecione o vice..." />
              <div style={{ marginBottom:"7px" }} />

              <label style={{ color:TEXT_SECONDARY, fontSize:"11px" }}>Artilheiro</label>
              <input value={longResults?.topScorer || ""} onChange={e => setLongResults(p => ({ ...p, topScorer: e.target.value }))} placeholder="Nome do artilheiro" style={inp} />

              <label style={{ color:TEXT_SECONDARY, fontSize:"11px" }}>Posição do Brasil</label>
              <select value={longResults?.brazilPosition || ""} onChange={e => setLongResults(p => ({ ...p, brazilPosition: e.target.value }))} style={inp}>
                <option value="">Selecione...</option>
                {BRAZIL_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Resultados por rodada */}
            {rounds.map(round => (
              <div key={round.id} style={{ background:BG_CARD, borderRadius:"12px", padding:"14px", marginBottom:"10px" }}>
                <p style={{ color:TEXT_GOLD, fontFamily:"'Bebas Neue',cursive", fontSize:"16px", letterSpacing:"1px", margin:"0 0 10px" }}>{round.name}</p>
                {round.games.map(game => (
                  <div key={game.id} style={{ marginBottom:"10px" }}>
                    <p style={{ color:TEXT_PRIMARY, fontSize:"12px", fontWeight:"600", margin:"0 0 5px" }}>{fl(game.home)} {game.home} × {game.away} {fl(game.away)} · {game.date}</p>
                    <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                      <input
                        type="number" min="0" placeholder="–"
                        value={results?.[round.id]?.[game.id]?.home ?? ""}
                        onChange={e => setResults(p => ({ ...p, [round.id]: { ...(p[round.id] || {}), [game.id]: { ...(p[round.id]?.[game.id] || {}), home: e.target.value } } }))}
                        style={{ ...inp, width:"55px", marginBottom:0, textAlign:"center", fontSize:"16px", fontFamily:"'Bebas Neue',cursive" }}
                      />
                      <span style={{ color:TEXT_SECONDARY, fontWeight:"700" }}>×</span>
                      <input
                        type="number" min="0" placeholder="–"
                        value={results?.[round.id]?.[game.id]?.away ?? ""}
                        onChange={e => setResults(p => ({ ...p, [round.id]: { ...(p[round.id] || {}), [game.id]: { ...(p[round.id]?.[game.id] || {}), away: e.target.value } } }))}
                        style={{ ...inp, width:"55px", marginBottom:0, textAlign:"center", fontSize:"16px", fontFamily:"'Bebas Neue',cursive" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
