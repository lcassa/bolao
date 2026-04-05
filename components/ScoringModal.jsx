import {
  BG_BASE, BG_CARD, BORDER_CARD,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_GOLD,
  BONUS_PTS,
} from "../styles/colors";
import { SCORING, PHASES } from "../data/phases";

// ============================================================
// SCORING MODAL — Explicação do sistema de pontuação
// ============================================================

export function ScoringModal({ onClose }) {
  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}
      onClick={onClose}
    >
      <div
        style={{ background:BG_BASE, border:`1px solid ${BORDER_CARD}`, borderRadius:"20px", padding:"28px 22px", maxWidth:"480px", width:"100%", maxHeight:"90vh", overflowY:"auto" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"22px" }}>
          <h2 style={{ color:TEXT_GOLD, fontFamily:"'Bebas Neue',cursive", fontSize:"26px", letterSpacing:"2px", margin:0 }}>⚽ SISTEMA DE PONTUAÇÃO</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:TEXT_SECONDARY, fontSize:"26px", cursor:"pointer" }}>✕</button>
        </div>

        {SCORING.map(r => (
          <div key={r.pts} style={{ padding:"14px 16px", background:BG_CARD, borderRadius:"12px", marginBottom:"10px", borderLeft:`5px solid ${r.color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
              <span style={{ color:TEXT_PRIMARY, fontWeight:"700", fontSize:"17px" }}>{r.icon} {r.label}</span>
              <span style={{ color:r.color, fontFamily:"'Bebas Neue',cursive", fontSize:"26px" }}>{r.pts}pts</span>
            </div>
            <p style={{ color:TEXT_SECONDARY, fontSize:"15px", margin:"0 0 10px" }}>{r.desc}</p>
            <div style={{ background:BG_BASE, borderRadius:"8px", padding:"10px 14px", fontSize:"15px" }}>
              <div style={{ display:"flex", gap:"8px", marginBottom:"4px" }}>
                <span style={{ color:TEXT_SECONDARY, minWidth:"70px" }}>Palpite:</span>
                <span style={{ color:TEXT_PRIMARY, fontWeight:"600" }}>{r.example.pick}</span>
              </div>
              <div style={{ display:"flex", gap:"8px", marginBottom: r.example.note ? "4px" : "0" }}>
                <span style={{ color:TEXT_SECONDARY, minWidth:"70px" }}>Resultado:</span>
                <span style={{ color:r.color, fontWeight:"600" }}>{r.example.result}</span>
              </div>
              {r.example.note && (
                <div style={{ display:"flex", gap:"8px" }}>
                  <span style={{ color:TEXT_SECONDARY, minWidth:"70px" }}></span>
                  <span style={{ color:TEXT_SECONDARY, fontStyle:"italic" }}>{r.example.note}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        <div style={{ marginTop:"16px", background:BG_CARD, borderRadius:"12px", padding:"16px" }}>
          <p style={{ color:TEXT_GOLD, fontWeight:"700", marginBottom:"10px", fontSize:"16px" }}>⚡ MULTIPLICADORES DE FASE</p>
          {PHASES.map(p => (
            <div key={p.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${BORDER_CARD}` }}>
              <span style={{ color:TEXT_SECONDARY, fontSize:"16px" }}>{p.label}</span>
              <span style={{ color:p.mult > 1 ? TEXT_GOLD : TEXT_PRIMARY, fontWeight:"700", fontSize:"16px" }}>×{p.mult}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop:"12px", background:BG_CARD, borderRadius:"12px", padding:"16px" }}>
          <p style={{ color:TEXT_GOLD, fontWeight:"700", marginBottom:"10px", fontSize:"16px" }}>🏆 APOSTAS DE LONGO PRAZO</p>
          {[{l:"Campeão da Copa",p:30},{l:"Artilheiro",p:20},{l:"Vice-Campeão",p:15},{l:"Posição do Brasil",p:10}].map(b => (
            <div key={b.l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${BORDER_CARD}` }}>
              <span style={{ color:TEXT_SECONDARY, fontSize:"16px" }}>{b.l}</span>
              <span style={{ color:BONUS_PTS, fontWeight:"700", fontSize:"16px" }}>+{b.p}pts</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop:"12px", background:BG_CARD, borderRadius:"12px", padding:"16px" }}>
          <p style={{ color:TEXT_GOLD, fontWeight:"700", marginBottom:"8px", fontSize:"16px" }}>🔢 DESEMPATE (em ordem)</p>
          {["Mais placares exatos (10pts)", "Mais vencedores acertados (5–7pts)", "Acertou o Campeão no bônus"].map((r, i) => (
            <div key={i} style={{ display:"flex", gap:"8px", padding:"5px 0" }}>
              <span style={{ color:TEXT_GOLD, fontWeight:"700", fontSize:"16px", minWidth:"20px" }}>{i+1}.</span>
              <span style={{ color:TEXT_SECONDARY, fontSize:"15px" }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
