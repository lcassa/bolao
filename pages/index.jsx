import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import {
  BG_BASE, BG_CARD, BG_DROPDOWN, BG_SURFACE, BORDER_INPUT, BORDER_CARD,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, TEXT_GOLD,
  PRIMARY, PRIMARY_HOVER,
  HEADER_GRADIENT, HEADER_USER_BG,
  SCORE_EXACT, SCORE_WINNER_DIFF, SCORE_WINNER, SCORE_ONE_TEAM, SCORE_WRONG,
  BONUS_PTS, MULT_HIGH, MULT_MED,
  DANGER, DANGER_BG, ERROR,
  MEDAL_GOLD, MEDAL_SILVER, MEDAL_BRONZE,
} from "../styles/colors";

// ============================================================
// STORAGE — Vercel KV via API route
// ============================================================
const KEYS = {
  participants: "bolao:participants", rounds: "bolao:rounds", picks: "bolao:picks",
  longBets: "bolao:longBets", results: "bolao:results", longResults: "bolao:longResults",
  initialized: "bolao:initialized_v3", pins: "bolao:pins",
};

async function storageGet(key) {
  try {
    const res = await fetch(`/api/storage?key=${encodeURIComponent(key)}`);
    const { value } = await res.json();
    return value ?? null;
  } catch { return null; }
}

async function storageSet(key, value) {
  try {
    await fetch(`/api/storage?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
  } catch {}
}


// ============================================================
// 48 SELEÇÕES — Copa 2026
// ============================================================
const TEAMS_BY_GROUP = {
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

const ALL_TEAMS = Object.values(TEAMS_BY_GROUP).flat();

const TEAM_TO_GROUP = {};
Object.entries(TEAMS_BY_GROUP).forEach(([group, teams]) => {
  teams.forEach(team => { TEAM_TO_GROUP[team] = group; });
});

const VENUES = {
  "Azteca, Cidade do México": {stadium:"Estádio Azteca",        city:"Cidade do México", country:"México"},
  "Cidade do México":          {stadium:"Estádio Azteca",        city:"Cidade do México", country:"México"},
  "Guadalajara":               {stadium:"Estádio Akron",         city:"Guadalajara",      country:"México"},
  "Monterrey":                 {stadium:"Estádio BBVA",          city:"Monterrey",        country:"México"},
  "Toronto":                   {stadium:"BMO Field",             city:"Toronto",          country:"Canadá"},
  "Vancouver":                 {stadium:"BC Place",              city:"Vancouver",        country:"Canadá"},
  "Los Angeles":               {stadium:"SoFi Stadium",          city:"Los Angeles",      country:"EUA"},
  "São Francisco":             {stadium:"Levi's Stadium",        city:"São Francisco",    country:"EUA"},
  "MetLife, Nova York":        {stadium:"MetLife Stadium",       city:"Nova York",        country:"EUA"},
  "Nova York":                 {stadium:"MetLife Stadium",       city:"Nova York",        country:"EUA"},
  "Boston":                    {stadium:"Gillette Stadium",      city:"Boston",           country:"EUA"},
  "Houston":                   {stadium:"NRG Stadium",           city:"Houston",          country:"EUA"},
  "Dallas":                    {stadium:"AT&T Stadium",          city:"Dallas",           country:"EUA"},
  "Filadélfia":                {stadium:"Lincoln Financial Field",city:"Filadélfia",      country:"EUA"},
  "Atlanta":                   {stadium:"Mercedes-Benz Stadium", city:"Atlanta",          country:"EUA"},
  "Seattle":                   {stadium:"Lumen Field",           city:"Seattle",          country:"EUA"},
  "Miami":                     {stadium:"Hard Rock Stadium",     city:"Miami",            country:"EUA"},
  "Kansas City":               {stadium:"Arrowhead Stadium",     city:"Kansas City",      country:"EUA"},
};

const ROUNDS_DEFAULT = [
  { id:"r1", name:"Rodada 1 — Grupos", phase:"grupos", active:false, locked:false, games:[
    {id:"g1", home:"México", away:"África do Sul", date:"11/06", time:"16h", stadium:"Azteca, Cidade do México"},
    {id:"g2", home:"Coreia do Sul", away:"Tchéquia", date:"11/06", time:"23h", stadium:"Guadalajara"},
    {id:"g3", home:"Canadá", away:"Bósnia-Herz.", date:"12/06", time:"16h", stadium:"Toronto"},
    {id:"g4", home:"Estados Unidos", away:"Paraguai", date:"12/06", time:"22h", stadium:"Los Angeles"},
    {id:"g5", home:"Austrália", away:"Turquia", date:"13/06", time:"01h", stadium:"Vancouver"},
    {id:"g6", home:"Catar", away:"Suíça", date:"13/06", time:"16h", stadium:"São Francisco"},
    {id:"g7", home:"Brasil", away:"Marrocos", date:"13/06", time:"19h", stadium:"MetLife, Nova York"},
    {id:"g8", home:"Haiti", away:"Escócia", date:"13/06", time:"22h", stadium:"Boston"},
    {id:"g9", home:"Alemanha", away:"Curaçao", date:"14/06", time:"14h", stadium:"Houston"},
    {id:"g10", home:"Holanda", away:"Japão", date:"14/06", time:"17h", stadium:"Dallas"},
    {id:"g11", home:"Costa do Marfim", away:"Equador", date:"14/06", time:"20h", stadium:"Filadélfia"},
    {id:"g12", home:"Suécia", away:"Tunísia", date:"14/06", time:"23h", stadium:"Monterrey"},
    {id:"g13", home:"Espanha", away:"Cabo Verde", date:"15/06", time:"13h", stadium:"Atlanta"},
    {id:"g14", home:"Bélgica", away:"Egito", date:"15/06", time:"16h", stadium:"Seattle"},
    {id:"g15", home:"Arábia Saudita", away:"Uruguai", date:"15/06", time:"19h", stadium:"Miami"},
    {id:"g16", home:"Irã", away:"Nova Zelândia", date:"15/06", time:"22h", stadium:"Los Angeles"},
    {id:"g17", home:"França", away:"Senegal", date:"16/06", time:"16h", stadium:"Nova York"},
    {id:"g18", home:"Iraque", away:"Noruega", date:"16/06", time:"19h", stadium:"Boston"},
    {id:"g19", home:"Argentina", away:"Argélia", date:"16/06", time:"22h", stadium:"Kansas City"},
    {id:"g20", home:"Áustria", away:"Jordânia", date:"17/06", time:"01h", stadium:"São Francisco"},
    {id:"g21", home:"Portugal", away:"RD Congo", date:"17/06", time:"14h", stadium:"Houston"},
    {id:"g22", home:"Inglaterra", away:"Croácia", date:"17/06", time:"17h", stadium:"Dallas"},
    {id:"g23", home:"Gana", away:"Panamá", date:"17/06", time:"20h", stadium:"Toronto"},
    {id:"g24", home:"Uzbequistão", away:"Colômbia", date:"17/06", time:"23h", stadium:"Cidade do México"},
  ]},
  { id:"r2", name:"Rodada 2 — Grupos", phase:"grupos", active:false, locked:false, games:[
    {id:"g25", home:"Tchéquia", away:"África do Sul", date:"18/06", time:"13h", stadium:"Atlanta"},
    {id:"g26", home:"Suíça", away:"Bósnia-Herz.", date:"18/06", time:"16h", stadium:"Los Angeles"},
    {id:"g27", home:"Canadá", away:"Catar", date:"18/06", time:"19h", stadium:"Vancouver"},
    {id:"g28", home:"México", away:"Coreia do Sul", date:"18/06", time:"22h", stadium:"Guadalajara"},
    {id:"g29", home:"Turquia", away:"Paraguai", date:"19/06", time:"01h", stadium:"São Francisco"},
    {id:"g30", home:"Estados Unidos", away:"Austrália", date:"19/06", time:"16h", stadium:"Seattle"},
    {id:"g31", home:"Escócia", away:"Marrocos", date:"19/06", time:"19h", stadium:"Boston"},
    {id:"g32", home:"Brasil", away:"Haiti", date:"19/06", time:"22h", stadium:"Filadélfia"},
    {id:"g33", home:"Alemanha", away:"Costa do Marfim", date:"20/06", time:"17h", stadium:"Toronto"},
    {id:"g34", home:"Equador", away:"Curaçao", date:"20/06", time:"21h", stadium:"Kansas City"},
    {id:"g35", home:"Holanda", away:"Suécia", date:"20/06", time:"14h", stadium:"Houston"},
    {id:"g36", home:"Tunísia", away:"Japão", date:"21/06", time:"01h", stadium:"Monterrey"},
    {id:"g37", home:"Uruguai", away:"Cabo Verde", date:"21/06", time:"19h", stadium:"Miami"},
    {id:"g38", home:"Espanha", away:"Arábia Saudita", date:"21/06", time:"13h", stadium:"Atlanta"},
    {id:"g39", home:"Bélgica", away:"Irã", date:"21/06", time:"16h", stadium:"Los Angeles"},
    {id:"g40", home:"Nova Zelândia", away:"Egito", date:"21/06", time:"22h", stadium:"Vancouver"},
    {id:"g41", home:"Noruega", away:"Senegal", date:"22/06", time:"21h", stadium:"Nova York"},
    {id:"g42", home:"França", away:"Iraque", date:"22/06", time:"18h", stadium:"Filadélfia"},
    {id:"g43", home:"Argentina", away:"Áustria", date:"22/06", time:"14h", stadium:"Dallas"},
    {id:"g44", home:"Jordânia", away:"Argélia", date:"23/06", time:"00h", stadium:"São Francisco"},
    {id:"g45", home:"Portugal", away:"Uzbequistão", date:"23/06", time:"14h", stadium:"Houston"},
    {id:"g46", home:"Inglaterra", away:"Gana", date:"23/06", time:"17h", stadium:"Boston"},
    {id:"g47", home:"Panamá", away:"Croácia", date:"23/06", time:"20h", stadium:"Toronto"},
    {id:"g48", home:"Colômbia", away:"RD Congo", date:"23/06", time:"23h", stadium:"Guadalajara"},
  ]},
  { id:"r3", name:"Rodada 3 — Grupos (decisiva)", phase:"grupos", active:false, locked:false, games:[
    {id:"g49", home:"Escócia", away:"Brasil", date:"24/06", time:"19h", stadium:"Miami"},
    {id:"g50", home:"Marrocos", away:"Haiti", date:"24/06", time:"19h", stadium:"Atlanta"},
    {id:"g51", home:"Suíça", away:"Canadá", date:"24/06", time:"16h", stadium:"Vancouver"},
    {id:"g52", home:"Bósnia-Herz.", away:"Catar", date:"24/06", time:"16h", stadium:"Seattle"},
    {id:"g53", home:"Tchéquia", away:"México", date:"24/06", time:"22h", stadium:"Cidade do México"},
    {id:"g54", home:"África do Sul", away:"Coreia do Sul", date:"24/06", time:"22h", stadium:"Monterrey"},
    {id:"g55", home:"Curaçao", away:"Costa do Marfim", date:"25/06", time:"17h", stadium:"Filadélfia"},
    {id:"g56", home:"Equador", away:"Alemanha", date:"25/06", time:"17h", stadium:"Nova York"},
    {id:"g57", home:"Japão", away:"Suécia", date:"25/06", time:"20h", stadium:"Dallas"},
    {id:"g58", home:"Tunísia", away:"Holanda", date:"25/06", time:"20h", stadium:"Kansas City"},
    {id:"g59", home:"Turquia", away:"Estados Unidos", date:"25/06", time:"23h", stadium:"Los Angeles"},
    {id:"g60", home:"Paraguai", away:"Austrália", date:"25/06", time:"23h", stadium:"São Francisco"},
    {id:"g61", home:"Noruega", away:"França", date:"26/06", time:"16h", stadium:"Boston"},
    {id:"g62", home:"Senegal", away:"Iraque", date:"26/06", time:"16h", stadium:"Toronto"},
    {id:"g63", home:"Egito", away:"Irã", date:"26/06", time:"00h", stadium:"Seattle"},
    {id:"g64", home:"Nova Zelândia", away:"Bélgica", date:"26/06", time:"00h", stadium:"Vancouver"},
    {id:"g65", home:"Cabo Verde", away:"Arábia Saudita", date:"26/06", time:"21h", stadium:"Houston"},
    {id:"g66", home:"Uruguai", away:"Espanha", date:"26/06", time:"21h", stadium:"Guadalajara"},
    {id:"g67", home:"Panamá", away:"Inglaterra", date:"27/06", time:"18h", stadium:"Nova York"},
    {id:"g68", home:"Croácia", away:"Gana", date:"27/06", time:"18h", stadium:"Filadélfia"},
    {id:"g69", home:"Argélia", away:"Áustria", date:"27/06", time:"23h", stadium:"Kansas City"},
    {id:"g70", home:"Jordânia", away:"Argentina", date:"27/06", time:"23h", stadium:"Dallas"},
    {id:"g71", home:"Colômbia", away:"Portugal", date:"27/06", time:"20h30", stadium:"Miami"},
    {id:"g72", home:"RD Congo", away:"Uzbequistão", date:"27/06", time:"20h30", stadium:"Atlanta"},
  ]},
];

const PHASE_MULT = { grupos:1, dezesseis:2, oitavas:2, quartas:2, semi:3, final:3 };
const PHASES = [
  {id:"grupos",label:"Fase de Grupos",mult:1},{id:"dezesseis",label:"Rodada de 16",mult:2},
  {id:"oitavas",label:"Oitavas de Final",mult:2},{id:"quartas",label:"Quartas de Final",mult:2},
  {id:"semi",label:"Semifinal",mult:3},{id:"final",label:"Final",mult:3},
];
const SCORING = [
  {pts:10,label:"Placar Exato",desc:"Acertou os gols de ambos os times exatamente",icon:"🎯",color:SCORE_EXACT,
    example:{pick:"Brasil 2 × 1 Marrocos",result:"Brasil 2 × 1 Marrocos"}},
  {pts:7,label:"Vencedor + Saldo",desc:"Acertou quem venceu e a diferença de gols",icon:"✅",color:SCORE_WINNER_DIFF,
    example:{pick:"Brasil 2 × 0 Marrocos",result:"Brasil 3 × 1 Marrocos",note:"Saldo de 2 em ambos"}},
  {pts:5,label:"Vencedor / Empate",desc:"Acertou quem ganhou (ou empate), mas errou placar e saldo",icon:"👍",color:SCORE_WINNER,
    example:{pick:"Brasil 3 × 0 Marrocos",result:"Brasil 1 × 0 Marrocos"}},
  {pts:2,label:"Um Time Certo",desc:"Acertou os gols de um dos times, mas errou o vencedor",icon:"🤏",color:SCORE_ONE_TEAM,
    example:{pick:"Brasil 1 × 2 Marrocos",result:"Brasil 1 × 1 Marrocos",note:"Brasil: 1 gol acertado"}},
  {pts:0,label:"Erro Total",desc:"Não acertou nada",icon:"❌",color:SCORE_WRONG,
    example:{pick:"Brasil 0 × 3 Marrocos",result:"Brasil 2 × 1 Marrocos"}},
];
const FLAGS = {"Brasil":"🇧🇷","Argentina":"🇦🇷","França":"🇫🇷","Alemanha":"🇩🇪","Espanha":"🇪🇸","Portugal":"🇵🇹","Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Holanda":"🇳🇱","Bélgica":"🇧🇪","Croácia":"🇭🇷","Marrocos":"🇲🇦","México":"🇲🇽","Japão":"🇯🇵","Coreia do Sul":"🇰🇷","Austrália":"🇦🇺","Suíça":"🇨🇭","Uruguai":"🇺🇾","Colômbia":"🇨🇴","Estados Unidos":"🇺🇸","Canadá":"🇨🇦","Senegal":"🇸🇳","Gana":"🇬🇭","Tunísia":"🇹🇳","Equador":"🇪🇨","Irã":"🇮🇷","Arábia Saudita":"🇸🇦","Catar":"🇶🇦","Haiti":"🇭🇹","Escócia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Paraguai":"🇵🇾","Turquia":"🇹🇷","África do Sul":"🇿🇦","Tchéquia":"🇨🇿","Bósnia-Herz.":"🇧🇦","Noruega":"🇳🇴","Suécia":"🇸🇪","Argélia":"🇩🇿","Áustria":"🇦🇹","Jordânia":"🇯🇴","Iraque":"🇮🇶","Uzbequistão":"🇺🇿","RD Congo":"🇨🇩","Panamá":"🇵🇦","Curaçao":"🇨🇼","Costa do Marfim":"🇨🇮","Nova Zelândia":"🇳🇿","Egito":"🇪🇬","Cabo Verde":"🇨🇻"};
const fl = n => FLAGS[n]||"🏳️";

function scoreMatch(pick, result) {
  if(!result||result.home===""||result.home===undefined||!pick) return null;
  const ph=parseInt(pick.home),pa=parseInt(pick.away),rh=parseInt(result.home),ra=parseInt(result.away);
  if(isNaN(ph)||isNaN(pa)||isNaN(rh)||isNaN(ra)) return null;
  if(ph===rh&&pa===ra) return {pts:10,label:"Placar Exato 🎯",color:SCORE_EXACT};
  const pw=ph>pa?"h":ph<pa?"a":"d", rw=rh>ra?"h":rh<ra?"a":"d";
  if(pw===rw&&(ph-pa)===(rh-ra)) return {pts:7,label:"Vencedor + Saldo ✅",color:SCORE_WINNER_DIFF};
  if(pw===rw) return {pts:5,label:"Vencedor Certo 👍",color:SCORE_WINNER};
  if(ph===rh||pa===ra) return {pts:2,label:"Um Time Certo 🤏",color:SCORE_ONE_TEAM};
  return {pts:0,label:"Erro Total ❌",color:SCORE_WRONG};
}
function calcTotal(pid, rounds, picks, results, lb, lr) {
  let total=0,exact=0,winner=0;
  rounds.forEach(r=>{ const m=PHASE_MULT[r.phase]||1; r.games.forEach(g=>{ const s=scoreMatch(picks?.[pid]?.[r.id]?.[g.id],results?.[r.id]?.[g.id]); if(!s) return; total+=s.pts*m; if(s.pts===10)exact++; if(s.pts>=5)winner++; }); });
  const b=lb?.[pid];
  if(b&&lr){
    if(b.champion&&lr.champion&&b.champion===lr.champion) total+=30;
    if(b.runner&&lr.runner&&b.runner===lr.runner) total+=15;
    if(b.topScorer&&lr.topScorer&&b.topScorer.toLowerCase()===lr.topScorer.toLowerCase()) total+=20;
    if(b.brazilPosition&&lr.brazilPosition&&b.brazilPosition===lr.brazilPosition) total+=10;
  }
  return {total,exact,winner};
}

// ============================================================
// TEAM SELECT — Campo de busca com lista filtrada
// ============================================================
function TeamSelect({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = query.trim() === ""
    ? ALL_TEAMS
    : ALL_TEAMS.filter(t => t.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const select = (team) => { onChange(team); setQuery(team); setOpen(false); };
  const clear = () => { onChange(""); setQuery(""); setOpen(false); };

  return (
    <div ref={ref} style={{ position:"relative", width:"100%" }}>
      <div style={{ position:"relative" }}>
        <input
          type="text"
          value={query}
          placeholder={placeholder || "Buscar time..."}
          onChange={e => { setQuery(e.target.value); setOpen(true); if (e.target.value === "") onChange(""); }}
          onFocus={() => setOpen(true)}
          style={{
            width:"100%", padding:"13px 44px 13px 14px", background:BG_BASE,
            border: open ? `2px solid ${PRIMARY}` : `2px solid ${BORDER_INPUT}`,
            borderRadius:"10px", color:TEXT_PRIMARY, fontSize:"16px",
            fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box",
          }}
        />
        {value
          ? <button onClick={clear} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:TEXT_SECONDARY, fontSize:"18px", cursor:"pointer", lineHeight:1 }}>✕</button>
          : <span style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", color:TEXT_SECONDARY, fontSize:"16px", pointerEvents:"none" }}>🔍</span>
        }
      </div>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:100,
          background:BG_DROPDOWN, border:`2px solid ${BORDER_INPUT}`, borderRadius:"10px",
          maxHeight:"220px", overflowY:"auto", boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
        }}>
          {filtered.length === 0
            ? <p style={{ color:TEXT_SECONDARY, fontSize:"15px", padding:"14px", margin:0, textAlign:"center" }}>Nenhum time encontrado</p>
            : filtered.map(team => (
              <button key={team} onClick={() => select(team)} style={{
                width:"100%", padding:"13px 14px", background: value===team ? PRIMARY : "transparent",
                border:"none", borderBottom:`1px solid ${BORDER_CARD}`, color:TEXT_PRIMARY,
                fontSize:"16px", fontFamily:"'Outfit',sans-serif", cursor:"pointer",
                textAlign:"left", display:"flex", alignItems:"center", gap:"10px",
              }}
                onMouseEnter={e => { if(value!==team) e.currentTarget.style.background=BG_SURFACE; }}
                onMouseLeave={e => { if(value!==team) e.currentTarget.style.background="transparent"; }}
              >
                <span style={{ fontSize:"22px" }}>{fl(team)}</span>
                <span style={{ fontWeight: value===team ? "700" : "400" }}>{team}</span>
              </button>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ============================================================
// SCORING MODAL
// ============================================================
function ScoringModal({onClose}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={onClose}>
      <div style={{background:BG_BASE,border:`1px solid ${BORDER_CARD}`,borderRadius:"20px",padding:"28px 22px",maxWidth:"480px",width:"100%",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"22px"}}>
          <h2 style={{color:TEXT_GOLD,fontFamily:"'Bebas Neue',cursive",fontSize:"26px",letterSpacing:"2px",margin:0}}>⚽ SISTEMA DE PONTUAÇÃO</h2>
          <button onClick={onClose} style={{background:"none",border:"none",color:TEXT_SECONDARY,fontSize:"26px",cursor:"pointer"}}>✕</button>
        </div>
        {SCORING.map(r=>(
          <div key={r.pts} style={{padding:"14px 16px",background:BG_CARD,borderRadius:"12px",marginBottom:"10px",borderLeft:`5px solid ${r.color}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
              <span style={{color:TEXT_PRIMARY,fontWeight:"700",fontSize:"17px"}}>{r.icon} {r.label}</span>
              <span style={{color:r.color,fontFamily:"'Bebas Neue',cursive",fontSize:"26px"}}>{r.pts}pts</span>
            </div>
            <p style={{color:TEXT_SECONDARY,fontSize:"15px",margin:"0 0 10px"}}>{r.desc}</p>
            <div style={{background:BG_BASE,borderRadius:"8px",padding:"10px 14px",fontSize:"15px"}}>
              <div style={{display:"flex",gap:"8px",marginBottom:"4px"}}>
                <span style={{color:TEXT_SECONDARY,minWidth:"70px"}}>Palpite:</span>
                <span style={{color:TEXT_PRIMARY,fontWeight:"600"}}>{r.example.pick}</span>
              </div>
              <div style={{display:"flex",gap:"8px",marginBottom: r.example.note ? "4px" : "0"}}>
                <span style={{color:TEXT_SECONDARY,minWidth:"70px"}}>Resultado:</span>
                <span style={{color:r.color,fontWeight:"600"}}>{r.example.result}</span>
              </div>
              {r.example.note && (
                <div style={{display:"flex",gap:"8px"}}>
                  <span style={{color:TEXT_SECONDARY,minWidth:"70px"}}></span>
                  <span style={{color:TEXT_SECONDARY,fontStyle:"italic"}}>{r.example.note}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div style={{marginTop:"16px",background:BG_CARD,borderRadius:"12px",padding:"16px"}}>
          <p style={{color:TEXT_GOLD,fontWeight:"700",marginBottom:"10px",fontSize:"16px"}}>⚡ MULTIPLICADORES DE FASE</p>
          {PHASES.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${BORDER_CARD}`}}><span style={{color:TEXT_SECONDARY,fontSize:"16px"}}>{p.label}</span><span style={{color:p.mult>1?TEXT_GOLD:TEXT_PRIMARY,fontWeight:"700",fontSize:"16px"}}>×{p.mult}</span></div>)}
        </div>
        <div style={{marginTop:"12px",background:BG_CARD,borderRadius:"12px",padding:"16px"}}>
          <p style={{color:TEXT_GOLD,fontWeight:"700",marginBottom:"10px",fontSize:"16px"}}>🏆 APOSTAS DE LONGO PRAZO</p>
          {[{l:"Campeão da Copa",p:30},{l:"Artilheiro",p:20},{l:"Vice-Campeão",p:15},{l:"Posição do Brasil",p:10}].map(b=><div key={b.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${BORDER_CARD}`}}><span style={{color:TEXT_SECONDARY,fontSize:"16px"}}>{b.l}</span><span style={{color:BONUS_PTS,fontWeight:"700",fontSize:"16px"}}>+{b.p}pts</span></div>)}
        </div>
        <div style={{marginTop:"12px",background:BG_CARD,borderRadius:"12px",padding:"16px"}}>
          <p style={{color:TEXT_GOLD,fontWeight:"700",marginBottom:"8px",fontSize:"16px"}}>🔢 DESEMPATE (em ordem)</p>
          {["Mais placares exatos (10pts)","Mais vencedores acertados (5–7pts)","Acertou o Campeão no bônus"].map((r,i)=><div key={i} style={{display:"flex",gap:"8px",padding:"5px 0"}}><span style={{color:TEXT_GOLD,fontWeight:"700",fontSize:"16px",minWidth:"20px"}}>{i+1}.</span><span style={{color:TEXT_SECONDARY,fontSize:"15px"}}>{r}</span></div>)}
        </div>
      </div>
    </div>
  );
}

function ScoreInput({value,onChange,disabled}) {
  return <input type="number" min="0" max="99" value={value} disabled={disabled} onChange={e=>onChange(e.target.value)} style={{width:"62px",height:"62px",borderRadius:"10px",border:`2px solid ${BORDER_INPUT}`,background:BG_BASE,color:TEXT_PRIMARY,fontSize:"28px",fontWeight:"700",textAlign:"center",outline:"none",fontFamily:"'Bebas Neue',cursive",MozAppearance:"textfield",opacity:disabled?0.4:1}}/>;
}

const DAYS_PT=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
function dayOfWeek(dateStr){const[d,m]=dateStr.split("/").map(Number);return DAYS_PT[new Date(2026,m-1,d).getDay()];}

function GameCard({game,pick,onPickChange,result,phase,disabled}) {
  const mult=PHASE_MULT[phase]||1;
  const s=(result?.home!==undefined&&result?.home!==""&&pick)?scoreMatch(pick,result):null;
  const venue=VENUES[game.stadium];
  const venueStr=venue?`${venue.stadium} · ${venue.city}, ${venue.country}`:game.stadium;
  const dow=dayOfWeek(game.date);
  return (
    <div style={{background:BG_CARD,borderRadius:"14px",padding:"14px 12px",border:s?`2px solid ${s.color}40`:`2px solid ${BORDER_CARD}`,marginBottom:"10px",position:"relative"}}>
      {mult>1&&<div style={{position:"absolute",top:"10px",right:"10px",background:mult===3?MULT_HIGH:MULT_MED,color:BG_BASE,borderRadius:"6px",padding:"3px 10px",fontSize:"14px",fontWeight:"700"}}>×{mult}</div>}
      <p style={{color:TEXT_SECONDARY,fontSize:"15px",margin:"0 0 14px"}}>{dow}, {game.date} · {game.time} · {venueStr}</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"6px"}}>
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{fontSize:"36px",marginBottom:"6px"}}>{fl(game.home)}</div>
          <p style={{color:TEXT_PRIMARY,fontWeight:"700",fontSize:"17px",margin:0,lineHeight:"1.3"}}>{game.home}</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"5px",flexShrink:0}}>
          <ScoreInput value={pick?.home??""} onChange={v=>onPickChange({...pick,home:v})} disabled={disabled}/>
          <span style={{color:TEXT_SECONDARY,fontSize:"20px",fontWeight:"700"}}>×</span>
          <ScoreInput value={pick?.away??""} onChange={v=>onPickChange({...pick,away:v})} disabled={disabled}/>
        </div>
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{fontSize:"36px",marginBottom:"6px"}}>{fl(game.away)}</div>
          <p style={{color:TEXT_PRIMARY,fontWeight:"700",fontSize:"17px",margin:0,lineHeight:"1.3"}}>{game.away}</p>
        </div>
      </div>
      {result?.home!==undefined&&result?.home!==""&&(
        <div style={{marginTop:"10px",padding:"8px 12px",background:BG_BASE,borderRadius:"8px",textAlign:"center"}}>
          <span style={{color:TEXT_SECONDARY,fontSize:"15px"}}>Resultado: </span>
          <span style={{color:TEXT_PRIMARY,fontWeight:"700",fontSize:"16px"}}>{result.home} × {result.away}</span>
          {s&&<span style={{marginLeft:"10px",color:s.color,fontWeight:"700",fontSize:"15px"}}>+{s.pts*mult}pts</span>}
        </div>
      )}
    </div>
  );
}

// ============================================================
// LONG BETS — User section
// ============================================================
function LongBetsUser({ participant, longBets, onLongBetsChange, longResults }) {
  const pid = participant.id;
  const val = (key) => longBets?.[pid]?.[key] || "";
  const set = (key, v) => onLongBetsChange(p => ({ ...p, [pid]: { ...(p[pid] || {}), [key]: v } }));

  const bets = [
    { key:"champion", label:"Campeão da Copa", pts:30, icon:"🥇", type:"team" },
    { key:"runner",   label:"Vice-Campeão",    pts:15, icon:"🥈", type:"team" },
    { key:"topScorer",label:"Artilheiro da Copa", pts:20, icon:"⚽", type:"scorer" },
    { key:"brazilPosition", label:"Posição do Brasil", pts:10, icon:"🇧🇷", type:"brazil" },
  ];

  const brazilOpts = ["Campeão","Vice","3º Lugar","4º Lugar","Semifinal","Quartas","Oitavas","Rodada de 16","Fase de Grupos"];

  const fieldStyle = {
    width:"100%", padding:"13px 14px", background:BG_BASE,
    border:`2px solid ${BORDER_INPUT}`, borderRadius:"10px", color:TEXT_PRIMARY,
    fontSize:"17px", fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box",
  };

  return (
    <div style={{background:BG_CARD,borderRadius:"14px",padding:"20px"}}>
      <p style={{color:TEXT_GOLD,fontFamily:"'Bebas Neue',cursive",fontSize:"22px",letterSpacing:"1px",margin:"0 0 4px"}}>🏆 APOSTAS DE LONGO PRAZO</p>
      <p style={{color:TEXT_SECONDARY,fontSize:"16px",margin:"0 0 22px"}}>Servem como critério de desempate e podem virar o bolão no final!</p>

      {bets.map(bet => (
        <div key={bet.key} style={{marginBottom:"22px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
            <label style={{color:TEXT_PRIMARY,fontWeight:"700",fontSize:"17px"}}>{bet.icon} {bet.label}</label>
            <span style={{color:BONUS_PTS,fontSize:"16px",fontWeight:"700"}}>+{bet.pts}pts</span>
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
              <p style={{color:TEXT_SECONDARY,fontSize:"14px",margin:"6px 0 0"}}>
                ⏳ Lista oficial de convocados disponível em maio/2026
              </p>
            </div>
          )}

          {bet.type === "brazil" && (
            <select value={val(bet.key)} onChange={e => set(bet.key, e.target.value)} style={fieldStyle}>
              <option value="">Selecione a posição...</option>
              {brazilOpts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          )}

          {longResults?.[bet.key] && (
            <p style={{margin:"7px 0 0",fontSize:"15px",color:val(bet.key)===longResults[bet.key]?BONUS_PTS:ERROR}}>
              Resultado: {longResults[bet.key]} {val(bet.key)===longResults[bet.key]?"✅ Acertou!":"❌"}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// USER VIEW
// ============================================================
function UserView({participant,rounds,picks,onPicksChange,results,longBets,onLongBetsChange,longResults,participants,onBack}) {
  const [tab,setTab]=useState("picks");
  const [showScoring,setShowScoring]=useState(false);
  const [saved,setSaved]=useState(false);
  const activeRounds=rounds.filter(r=>r.active);
  const stats=calcTotal(participant.id,rounds,picks,results,longBets,longResults);
  const ranking=participants.map(p=>({...p,...calcTotal(p.id,rounds,picks,results,longBets,longResults)})).sort((a,b)=>b.total-a.total||b.exact-a.exact||b.winner-a.winner);

  return (
    <div style={{minHeight:"100vh",background:BG_BASE,fontFamily:"'Outfit',sans-serif"}}>
      {showScoring&&<ScoringModal onClose={()=>setShowScoring(false)}/>}
      <div style={{background:HEADER_GRADIENT,padding:"22px 18px 18px",borderBottom:`1px solid ${BORDER_CARD}`}}>
        <div style={{maxWidth:"480px",margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <p style={{color:BONUS_PTS,fontSize:"13px",fontWeight:"600",letterSpacing:"3px",margin:"0 0 4px",textTransform:"uppercase"}}>Bolão da Copa 2026</p>
            <h1 style={{color:TEXT_PRIMARY,fontFamily:"'Bebas Neue',cursive",fontSize:"32px",letterSpacing:"2px",margin:"0 0 4px"}}>Olá, {participant.name}! 👋</h1>
            <p style={{color:TEXT_SECONDARY,fontSize:"16px",margin:0}}><span style={{color:TEXT_GOLD,fontWeight:"700",fontSize:"28px",fontFamily:"'Bebas Neue',cursive"}}>{stats.total}</span> pontos · 🎯{stats.exact} exatos</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px",alignItems:"flex-end"}}>
            <button onClick={()=>setShowScoring(true)} style={{background:BG_SURFACE,border:`1px solid ${BORDER_INPUT}`,color:TEXT_SECONDARY,borderRadius:"8px",padding:"9px 14px",cursor:"pointer",fontSize:"15px",fontFamily:"'Outfit',sans-serif"}}>ℹ️ Pontuação</button>
            <button onClick={onBack} style={{background:"none",border:"none",color:TEXT_SECONDARY,cursor:"pointer",fontSize:"15px",fontFamily:"'Outfit',sans-serif"}}>← Trocar</button>
          </div>
        </div>
      </div>
      <div style={{maxWidth:"480px",margin:"0 auto",padding:"0 14px"}}>
        <div style={{display:"flex",marginTop:"14px",background:BG_CARD,borderRadius:"10px",padding:"3px"}}>
          {[{id:"picks",label:"Palpites"},{id:"longbet",label:"Apostas Longas"},{id:"ranking",label:"Ranking"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 0",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"16px",fontWeight:"600",background:tab===t.id?PRIMARY:"transparent",color:tab===t.id?"#fff":TEXT_SECONDARY,fontFamily:"'Outfit',sans-serif"}}>{t.label}</button>
          ))}
        </div>

        {tab==="picks"&&<div style={{marginTop:"14px",paddingBottom:"85px"}}>
          {activeRounds.length===0
            ? <div style={{textAlign:"center",padding:"60px 20px",color:TEXT_SECONDARY}}><div style={{fontSize:"44px",marginBottom:"12px"}}>⏳</div><p>Nenhuma rodada aberta.<br/>Aguarda o admin liberar!</p></div>
            : activeRounds.map(round=>{
              const parseDate=d=>{const[day,mon]=d.split("/").map(Number);return mon*100+day;};
              const renderCard=game=>(<GameCard key={game.id} game={game} phase={round.phase} pick={picks?.[participant.id]?.[round.id]?.[game.id]} result={results?.[round.id]?.[game.id]} disabled={round.locked} onPickChange={val=>onPicksChange(p=>({...p,[participant.id]:{...(p[participant.id]||{}),[round.id]:{...(p[participant.id]?.[round.id]||{}),[game.id]:val}}}))}/>);
              const roundHeader=<div style={{display:"flex",alignItems:"center",gap:"8px",margin:"22px 0 12px"}}>
                <h2 style={{color:TEXT_GOLD,fontFamily:"'Bebas Neue',cursive",fontSize:"22px",letterSpacing:"1px",margin:0}}>{round.name}</h2>
                <span style={{background:BG_SURFACE,color:TEXT_SECONDARY,borderRadius:"5px",padding:"3px 8px",fontSize:"14px"}}>×{PHASE_MULT[round.phase]}</span>
                {round.locked&&<span style={{background:DANGER_BG,color:ERROR,borderRadius:"5px",padding:"3px 8px",fontSize:"14px"}}>🔒</span>}
              </div>;
              if(round.phase==="grupos"){
                const byGroup={};
                round.games.forEach(g=>{const gr=TEAM_TO_GROUP[g.home]||TEAM_TO_GROUP[g.away]||"Outros";(byGroup[gr]=byGroup[gr]||[]).push(g);});
                const sortedGroups=Object.keys(byGroup).sort();
                sortedGroups.forEach(gr=>byGroup[gr].sort((a,b)=>parseDate(a.date)-parseDate(b.date)));
                return <div key={round.id}>
                  {roundHeader}
                  {sortedGroups.map(gr=>(
                    <div key={gr}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px",margin:"16px 0 8px"}}>
                        <span style={{color:TEXT_MUTED,fontFamily:"'Bebas Neue',cursive",fontSize:"17px",letterSpacing:"1px",background:BG_SURFACE,borderRadius:"6px",padding:"3px 10px"}}>{gr}</span>
                      </div>
                      {byGroup[gr].map(renderCard)}
                    </div>
                  ))}
                </div>;
              }
              return <div key={round.id}>
                {roundHeader}
                {round.games.slice().sort((a,b)=>parseDate(a.date)-parseDate(b.date)).map(renderCard)}
              </div>;
            })
          }
        </div>}

        {tab==="longbet"&&<div style={{marginTop:"14px",paddingBottom:"85px"}}>
          <LongBetsUser participant={participant} longBets={longBets} onLongBetsChange={onLongBetsChange} longResults={longResults}/>
        </div>}

        {tab==="ranking"&&<div style={{marginTop:"14px",paddingBottom:"40px"}}>
          {ranking.map((p,i)=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:"14px",background:p.id===participant.id?HEADER_USER_BG:BG_CARD,border:p.id===participant.id?`2px solid ${PRIMARY}`:`2px solid ${BORDER_CARD}`,borderRadius:"14px",padding:"16px 16px",marginBottom:"10px"}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"26px",minWidth:"36px",textAlign:"center",color:i===0?MEDAL_GOLD:i===1?MEDAL_SILVER:i===2?MEDAL_BRONZE:TEXT_SECONDARY}}>
                {i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}º`}
              </div>
              <div style={{flex:1}}>
                <p style={{color:TEXT_PRIMARY,fontWeight:"700",margin:"0 0 4px",fontSize:"18px"}}>{p.name}{p.id===participant.id?" (você)":""}</p>
                <p style={{color:TEXT_SECONDARY,fontSize:"15px",margin:0}}>🎯{p.exact} exatos · 👍{p.winner} vencedores</p>
              </div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"32px",color:TEXT_GOLD}}>{p.total}</div>
            </div>
          ))}
        </div>}
      </div>

      {tab!=="ranking"&&<div style={{position:"fixed",bottom:0,left:0,right:0,padding:"10px 14px",background:`linear-gradient(transparent,${BG_BASE} 40%)`}}>
        <div style={{maxWidth:"480px",margin:"0 auto"}}>
          <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}} style={{width:"100%",padding:"14px",background:saved?PRIMARY_HOVER:PRIMARY,color:"#fff",border:"none",borderRadius:"12px",fontSize:"15px",fontWeight:"700",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
            {saved?"✅ Palpites Salvos!":"💾 Salvar Palpites"}
          </button>
        </div>
      </div>}
    </div>
  );
}

// ============================================================
// ADMIN VIEW
// ============================================================
function AdminView({rounds,setRounds,participants,setParticipants,results,setResults,longResults,setLongResults,pins,onResetPin,onLogout}) {
  const [tab,setTab]=useState("rounds");
  const [newRound,setNewRound]=useState({name:"",phase:"grupos"});
  const [newParticipant,setNewParticipant]=useState("");
  const [expanded,setExpanded]=useState(null);
  const [newGame,setNewGame]=useState({home:"",away:"",date:"",time:"",stadium:""});
  const inp={width:"100%",padding:"9px 11px",background:BG_BASE,border:`2px solid ${BORDER_INPUT}`,borderRadius:"7px",color:TEXT_PRIMARY,fontSize:"13px",fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:"7px"};
  const btn=(bg,fg="#fff")=>({background:bg,color:fg,border:"none",borderRadius:"7px",padding:"9px 12px",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:"700",fontSize:"12px"});

  return (
    <div style={{minHeight:"100vh",background:BG_BASE,fontFamily:"'Outfit',sans-serif"}}>
      <div style={{background:BG_CARD,padding:"14px 16px",borderBottom:`1px solid ${BORDER_CARD}`}}>
        <div style={{maxWidth:"600px",margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><p style={{color:ERROR,fontSize:"10px",fontWeight:"700",letterSpacing:"3px",margin:"0 0 1px",textTransform:"uppercase"}}>🔐 Admin</p><h1 style={{color:TEXT_PRIMARY,fontFamily:"'Bebas Neue',cursive",fontSize:"22px",letterSpacing:"2px",margin:0}}>Bolão Copa 2026</h1></div>
          <button onClick={onLogout} style={btn(BG_SURFACE,TEXT_SECONDARY)}>Sair</button>
        </div>
      </div>
      <div style={{maxWidth:"600px",margin:"0 auto",padding:"0 14px"}}>
        <div style={{display:"flex",marginTop:"14px",background:BG_CARD,borderRadius:"10px",padding:"3px"}}>
          {[{id:"rounds",label:"Rodadas"},{id:"participants",label:"Participantes"},{id:"results",label:"Resultados"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 0",borderRadius:"8px",border:"none",cursor:"pointer",fontSize:"16px",fontWeight:"600",background:tab===t.id?DANGER:"transparent",color:tab===t.id?"#fff":TEXT_SECONDARY,fontFamily:"'Outfit',sans-serif"}}>{t.label}</button>
          ))}
        </div>

        {tab==="rounds"&&<div style={{marginTop:"14px",paddingBottom:"40px"}}>
          <div style={{background:BG_CARD,borderRadius:"12px",padding:"16px",marginBottom:"14px"}}>
            <p style={{color:TEXT_GOLD,fontWeight:"700",margin:"0 0 10px",fontSize:"14px"}}>Nova Rodada</p>
            <input placeholder="Nome da rodada" value={newRound.name} onChange={e=>setNewRound(p=>({...p,name:e.target.value}))} style={inp}/>
            <select value={newRound.phase} onChange={e=>setNewRound(p=>({...p,phase:e.target.value}))} style={inp}>
              {PHASES.map(p=><option key={p.id} value={p.id}>{p.label} (×{p.mult})</option>)}
            </select>
            <button onClick={()=>{if(!newRound.name.trim())return;setRounds(p=>[...p,{id:Date.now().toString(),name:newRound.name.trim(),phase:newRound.phase,active:false,locked:false,games:[]}]);setNewRound({name:"",phase:"grupos"});}} style={{...btn(PRIMARY),width:"100%"}}>+ Criar Rodada</button>
          </div>
          {rounds.map(round=>(
            <div key={round.id} style={{background:BG_CARD,borderRadius:"12px",padding:"14px",marginBottom:"10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"6px"}}>
                <div><p style={{color:TEXT_PRIMARY,fontWeight:"700",margin:"0 0 1px",fontSize:"14px"}}>{round.name}</p><p style={{color:TEXT_SECONDARY,fontSize:"11px",margin:0}}>{PHASES.find(p=>p.id===round.phase)?.label} · {round.games.length} jogos</p></div>
                <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                  <button onClick={()=>setRounds(p=>p.map(r=>r.id===round.id?{...r,active:!r.active}:r))} style={btn(round.active?PRIMARY:BG_SURFACE,round.active?"#fff":TEXT_SECONDARY)}>{round.active?"✅ Aberta":"Abrir"}</button>
                  <button onClick={()=>setRounds(p=>p.map(r=>r.id===round.id?{...r,locked:!r.locked}:r))} style={btn(round.locked?DANGER:BG_SURFACE,round.locked?"#fff":TEXT_SECONDARY)}>{round.locked?"🔒 Fechada":"Fechar"}</button>
                  <button onClick={()=>setExpanded(expanded===round.id?null:round.id)} style={btn(BG_SURFACE,TEXT_SECONDARY)}>⚙️</button>
                  <button onClick={()=>setRounds(p=>p.filter(r=>r.id!==round.id))} style={btn(BG_SURFACE,ERROR)}>✕</button>
                </div>
              </div>
              {expanded===round.id&&(
                <div style={{marginTop:"12px",borderTop:`1px solid ${BORDER_CARD}`,paddingTop:"12px"}}>
                  {round.games.map(game=>(
                    <div key={game.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${BORDER_CARD}`}}>
                      <span style={{color:TEXT_PRIMARY,fontSize:"12px"}}>{fl(game.home)} {game.home} × {game.away} {fl(game.away)} · {game.date} {game.time}</span>
                      <button onClick={()=>setRounds(p=>p.map(r=>r.id===round.id?{...r,games:r.games.filter(g=>g.id!==game.id)}:r))} style={{background:"none",border:"none",color:ERROR,cursor:"pointer",fontSize:"14px"}}>✕</button>
                    </div>
                  ))}
                  <div style={{marginTop:"10px"}}>
                    <p style={{color:TEXT_SECONDARY,fontSize:"11px",fontWeight:"600",marginBottom:"7px"}}>Adicionar Jogo</p>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>
                      <input placeholder="Time Casa" value={newGame.home} onChange={e=>setNewGame(p=>({...p,home:e.target.value}))} style={{...inp,marginBottom:0}}/>
                      <input placeholder="Time Fora" value={newGame.away} onChange={e=>setNewGame(p=>({...p,away:e.target.value}))} style={{...inp,marginBottom:0}}/>
                      <input placeholder="Data (12/06)" value={newGame.date} onChange={e=>setNewGame(p=>({...p,date:e.target.value}))} style={{...inp,marginBottom:0}}/>
                      <input placeholder="Hora (16h)" value={newGame.time} onChange={e=>setNewGame(p=>({...p,time:e.target.value}))} style={{...inp,marginBottom:0}}/>
                    </div>
                    <input placeholder="Estádio (opcional)" value={newGame.stadium} onChange={e=>setNewGame(p=>({...p,stadium:e.target.value}))} style={{...inp,marginTop:"5px"}}/>
                    <button onClick={()=>{if(!newGame.home||!newGame.away)return;setRounds(p=>p.map(r=>r.id===round.id?{...r,games:[...r.games,{...newGame,id:Date.now().toString()}]}:r));setNewGame({home:"",away:"",date:"",time:"",stadium:""}); }} style={{...btn(PRIMARY),width:"100%"}}>+ Adicionar Jogo</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>}

        {tab==="participants"&&<div style={{marginTop:"14px",paddingBottom:"40px"}}>
          <div style={{background:BG_CARD,borderRadius:"12px",padding:"16px",marginBottom:"14px"}}>
            <p style={{color:TEXT_GOLD,fontWeight:"700",margin:"0 0 10px",fontSize:"14px"}}>Adicionar Participante</p>
            <input placeholder="Nome do participante" value={newParticipant} onChange={e=>setNewParticipant(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newParticipant.trim()){setParticipants(p=>[...p,{id:Date.now().toString(),name:newParticipant.trim()}]);setNewParticipant("");}}} style={inp}/>
            <button onClick={()=>{if(!newParticipant.trim())return;setParticipants(p=>[...p,{id:Date.now().toString(),name:newParticipant.trim()}]);setNewParticipant("");}} style={{...btn(PRIMARY),width:"100%"}}>+ Adicionar</button>
          </div>
          <p style={{color:TEXT_SECONDARY,fontSize:"15px",margin:"0 0 12px"}}>{participants.length} participantes cadastrados</p>
          {participants.map(p=>(
            <div key={p.id} style={{background:BG_CARD,borderRadius:"12px",padding:"14px 16px",marginBottom:"10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom: pins?.[p.id] ? "10px" : "0"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <span style={{fontSize:"22px"}}>{pins?.[p.id]?"🔒":"🆕"}</span>
                  <p style={{color:TEXT_PRIMARY,fontWeight:"700",margin:0,fontSize:"16px"}}>{p.name}</p>
                </div>
                <button onClick={()=>setParticipants(prev=>prev.filter(x=>x.id!==p.id))} style={{background:"none",border:"none",color:ERROR,cursor:"pointer",fontSize:"18px"}}>✕</button>
              </div>
              {pins?.[p.id] && (
                <button onClick={()=>onResetPin(p.id)} style={{width:"100%",padding:"9px",background:BG_SURFACE,border:`1px solid ${BORDER_INPUT}`,borderRadius:"8px",color:MULT_MED,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:"700",fontSize:"14px"}}>
                  🔓 Resetar PIN
                </button>
              )}
            </div>
          ))}
        </div>}

        {tab==="results"&&<div style={{marginTop:"14px",paddingBottom:"40px"}}>
          {/* Long term results */}
          <div style={{background:BG_CARD,borderRadius:"12px",padding:"16px",marginBottom:"14px"}}>
            <p style={{color:TEXT_GOLD,fontWeight:"700",margin:"0 0 12px",fontSize:"14px"}}>🏆 Resultados de Longo Prazo</p>

            <label style={{color:TEXT_SECONDARY,fontSize:"11px"}}>Campeão</label>
            <TeamSelect value={longResults?.champion||""} onChange={v=>setLongResults(p=>({...p,champion:v}))} placeholder="Selecione o campeão..."/>
            <div style={{marginBottom:"7px"}}/>

            <label style={{color:TEXT_SECONDARY,fontSize:"11px"}}>Vice-Campeão</label>
            <TeamSelect value={longResults?.runner||""} onChange={v=>setLongResults(p=>({...p,runner:v}))} placeholder="Selecione o vice..."/>
            <div style={{marginBottom:"7px"}}/>

            <label style={{color:TEXT_SECONDARY,fontSize:"11px"}}>Artilheiro</label>
            <input value={longResults?.topScorer||""} onChange={e=>setLongResults(p=>({...p,topScorer:e.target.value}))} placeholder="Nome do artilheiro" style={inp}/>

            <label style={{color:TEXT_SECONDARY,fontSize:"11px"}}>Posição do Brasil</label>
            <select value={longResults?.brazilPosition||""} onChange={e=>setLongResults(p=>({...p,brazilPosition:e.target.value}))} style={inp}>
              <option value="">Selecione...</option>
              {["Campeão","Vice","3º Lugar","4º Lugar","Semifinal","Quartas","Oitavas","Rodada de 16","Fase de Grupos"].map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Match results */}
          {rounds.map(round=>(
            <div key={round.id} style={{background:BG_CARD,borderRadius:"12px",padding:"14px",marginBottom:"10px"}}>
              <p style={{color:TEXT_GOLD,fontFamily:"'Bebas Neue',cursive",fontSize:"16px",letterSpacing:"1px",margin:"0 0 10px"}}>{round.name}</p>
              {round.games.map(game=>(
                <div key={game.id} style={{marginBottom:"10px"}}>
                  <p style={{color:TEXT_PRIMARY,fontSize:"12px",fontWeight:"600",margin:"0 0 5px"}}>{fl(game.home)} {game.home} × {game.away} {fl(game.away)} · {game.date}</p>
                  <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                    <input type="number" min="0" placeholder="–" value={results?.[round.id]?.[game.id]?.home??""} onChange={e=>setResults(p=>({...p,[round.id]:{...(p[round.id]||{}),[game.id]:{...(p[round.id]?.[game.id]||{}),home:e.target.value}}}))} style={{...inp,width:"55px",marginBottom:0,textAlign:"center",fontSize:"16px",fontFamily:"'Bebas Neue',cursive"}}/>
                    <span style={{color:TEXT_SECONDARY,fontWeight:"700"}}>×</span>
                    <input type="number" min="0" placeholder="–" value={results?.[round.id]?.[game.id]?.away??""} onChange={e=>setResults(p=>({...p,[round.id]:{...(p[round.id]||{}),[game.id]:{...(p[round.id]?.[game.id]||{}),away:e.target.value}}}))} style={{...inp,width:"55px",marginBottom:0,textAlign:"center",fontSize:"16px",fontFamily:"'Bebas Neue',cursive"}}/>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}

// ============================================================
// PIN PAD COMPONENT
// ============================================================
function PinPad({ title, subtitle, onSubmit, error, onBack }) {
  const [digits, setDigits] = useState(["","","",""]);
  const refs = [useRef(),useRef(),useRef(),useRef()];

  useEffect(()=>{ refs[0].current?.focus(); },[]);

  const handleDigit = (i, val) => {
    const d = val.replace(/\D/g,"").slice(-1);
    const next = [...digits]; next[i] = d;
    setDigits(next);
    if(d && i < 3) refs[i+1].current.focus();
    if(next.every(x=>x!=="")){
      setTimeout(()=>onSubmit(next.join("")), 80);
    }
  };
  const handleKey = (i, e) => {
    if(e.key==="Backspace"&&!digits[i]&&i>0){ refs[i-1].current.focus(); }
  };
  const clear = () => { setDigits(["","","",""]); refs[0].current.focus(); };

  const dotStyle = (i) => ({
    width:"56px", height:"72px", borderRadius:"14px",
    border: error ? `2px solid ${ERROR}` : digits[i] ? `2px solid ${PRIMARY}` : `2px solid ${BORDER_INPUT}`,
    background:BG_BASE, color:TEXT_PRIMARY, fontSize:"32px", fontWeight:"700",
    textAlign:"center", outline:"none", fontFamily:"'Bebas Neue',cursive",
    MozAppearance:"textfield", caretColor:"transparent",
  });

  return (
    <div style={{background:BG_CARD,borderRadius:"16px",padding:"28px 22px",textAlign:"center"}}>
      <p style={{color:TEXT_PRIMARY,fontWeight:"700",fontSize:"20px",margin:"0 0 6px"}}>{title}</p>
      <p style={{color:TEXT_SECONDARY,fontSize:"16px",margin:"0 0 24px"}}>{subtitle}</p>
      <div style={{display:"flex",justifyContent:"center",gap:"12px",marginBottom:"16px"}}>
        {digits.map((d,i)=>(
          <input key={i} ref={refs[i]} type="number" inputMode="numeric" maxLength={1}
            value={d} onChange={e=>handleDigit(i,e.target.value)}
            onKeyDown={e=>handleKey(i,e)} onFocus={e=>e.target.select()}
            style={dotStyle(i)}/>
        ))}
      </div>
      {error && <p style={{color:ERROR,fontSize:"15px",margin:"0 0 12px",fontWeight:"600"}}>{error}</p>}
      <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
        {onBack && <button onClick={onBack} style={{background:BG_SURFACE,border:"none",borderRadius:"10px",padding:"11px 22px",color:TEXT_SECONDARY,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:"700",fontSize:"16px"}}>← Voltar</button>}
        <button onClick={clear} style={{background:BG_SURFACE,border:"none",borderRadius:"10px",padding:"11px 22px",color:TEXT_SECONDARY,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:"700",fontSize:"16px"}}>Limpar</button>
      </div>
    </div>
  );
}

// ============================================================
// SELECT SCREEN
// ============================================================
function SelectScreen({participants,pins,onSelect,onAdmin,onSetPin}) {
  const [adminMode,setAdminMode]=useState(false);
  const [adminPass,setAdminPass]=useState("");
  const [selectedParticipant,setSelectedParticipant]=useState(null);
  const [pinError,setPinError]=useState("");
  const [step,setStep]=useState("list"); // list | enter_pin | create_pin | confirm_pin
  const [newPin,setNewPin]=useState("");
  const checkAdminPassword = async (pass) => {
    const res = await fetch("/api/admin-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass }),
    });
    return res.ok;
  };

  const handleSelectParticipant = (p) => {
    setSelectedParticipant(p);
    setPinError("");
    if(pins?.[p.id]) { setStep("enter_pin"); }
    else { setStep("create_pin"); }
  };

  const handleEnterPin = (pin) => {
    if(pin === pins[selectedParticipant.id]) {
      onSelect(selectedParticipant);
    } else {
      setPinError("PIN incorreto. Tente novamente.");
      setTimeout(()=>setPinError(""),2000);
    }
  };

  const handleCreatePin = (pin) => { setNewPin(pin); setStep("confirm_pin"); };

  const handleConfirmPin = (pin) => {
    if(pin === newPin) {
      onSetPin(selectedParticipant.id, pin);
      onSelect(selectedParticipant);
    } else {
      setPinError("Os PINs não coincidem. Tente novamente.");
      setNewPin("");
      setStep("create_pin");
      setTimeout(()=>setPinError(""),2500);
    }
  };

  const back = () => { setStep("list"); setSelectedParticipant(null); setPinError(""); setNewPin(""); };

  return (
    <div style={{minHeight:"100vh",background:BG_BASE,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:"'Outfit',sans-serif"}}>
      <div style={{width:"100%",maxWidth:"380px"}}>
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <div style={{fontSize:"56px",marginBottom:"8px"}}>⚽</div>
          <h1 style={{color:TEXT_PRIMARY,fontFamily:"'Bebas Neue',cursive",fontSize:"38px",letterSpacing:"4px",margin:"0 0 3px"}}>BOLÃO</h1>
          <h2 style={{color:TEXT_GOLD,fontFamily:"'Bebas Neue',cursive",fontSize:"24px",letterSpacing:"3px",margin:"0 0 6px"}}>DA COPA 2026</h2>
          {step==="list" && <p style={{color:TEXT_SECONDARY,fontSize:"16px",margin:0}}>Selecione seu nome para entrar</p>}
        </div>

        {step==="list" && !adminMode && (
          <>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"18px"}}>
              {participants.length===0
                ? <p style={{color:TEXT_SECONDARY,textAlign:"center",padding:"28px 0",fontSize:"16px"}}>Nenhum participante ainda.<br/>Acesse o admin para cadastrar.</p>
                : participants.map(p=>(
                  <button key={p.id} onClick={()=>handleSelectParticipant(p)}
                    style={{background:BG_CARD,border:`2px solid ${BORDER_CARD}`,borderRadius:"12px",padding:"16px 18px",cursor:"pointer",color:TEXT_PRIMARY,fontSize:"18px",fontWeight:"700",fontFamily:"'Outfit',sans-serif",textAlign:"left",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px",transition:"border-color 0.2s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=PRIMARY} onMouseLeave={e=>e.currentTarget.style.borderColor=BORDER_CARD}>
                    <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                      <span style={{fontSize:"26px"}}>👤</span>{p.name}
                    </div>
                    <span style={{fontSize:"18px"}}>{pins?.[p.id] ? "🔒" : "🆕"}</span>
                  </button>
                ))}
            </div>
            <button onClick={()=>setAdminMode(true)} style={{width:"100%",padding:"14px",background:"transparent",border:`2px dashed ${BORDER_INPUT}`,borderRadius:"10px",color:TEXT_SECONDARY,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:"16px"}}>🔐 Acesso Admin</button>
          </>
        )}

        {step==="enter_pin" && (
          <PinPad
            title={`Olá, ${selectedParticipant?.name}!`}
            subtitle="Digite seu PIN de 4 dígitos"
            onSubmit={handleEnterPin}
            error={pinError}
            onBack={back}
          />
        )}

        {step==="create_pin" && (
          <PinPad
            title={`Bem-vindo, ${selectedParticipant?.name}!`}
            subtitle="Crie um PIN de 4 dígitos para proteger sua conta"
            onSubmit={handleCreatePin}
            error={pinError}
            onBack={back}
          />
        )}

        {step==="confirm_pin" && (
          <PinPad
            title="Confirme seu PIN"
            subtitle="Digite o PIN novamente para confirmar"
            onSubmit={handleConfirmPin}
            error={pinError}
            onBack={()=>{setStep("create_pin");setNewPin("");setPinError("");}}
          />
        )}

        {step==="list" && adminMode && (
          <div style={{background:BG_CARD,borderRadius:"14px",padding:"22px"}}>
            <p style={{color:ERROR,fontWeight:"700",margin:"0 0 14px",textAlign:"center",fontSize:"18px"}}>🔐 Painel Administrador</p>
            <input type="password" placeholder="Senha de admin" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={async e=>{if(e.key==="Enter"&&await checkAdminPassword(adminPass))onAdmin();}} style={{width:"100%",padding:"13px 14px",background:BG_BASE,border:`2px solid ${BORDER_INPUT}`,borderRadius:"10px",color:TEXT_PRIMARY,fontSize:"17px",fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:"12px"}}/>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={()=>setAdminMode(false)} style={{flex:1,padding:"13px",background:BG_SURFACE,border:"none",borderRadius:"10px",color:TEXT_SECONDARY,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:"700",fontSize:"16px"}}>Voltar</button>
              <button onClick={async ()=>{if(await checkAdminPassword(adminPass))onAdmin();else alert("Senha incorreta!");}} style={{flex:2,padding:"13px",background:DANGER,border:"none",borderRadius:"10px",color:"#fff",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:"700",fontSize:"16px"}}>Entrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [loaded,setLoaded]=useState(false);
  const [view,setView]=useState("select");
  const [currentParticipant,setCurrentParticipant]=useState(null);
  const [participants,setParticipants]=useState([]);
  const [rounds,setRounds]=useState([]);
  const [picks,setPicks]=useState({});
  const [longBets,setLongBets]=useState({});
  const [results,setResults]=useState({});
  const [longResults,setLongResults]=useState({});
  const [pins,setPins]=useState({});

  useEffect(()=>{
    (async()=>{
      const [p,r,pk,lb,res,lr,init,pn]=await Promise.all([storageGet(KEYS.participants),storageGet(KEYS.rounds),storageGet(KEYS.picks),storageGet(KEYS.longBets),storageGet(KEYS.results),storageGet(KEYS.longResults),storageGet(KEYS.initialized),storageGet(KEYS.pins)]);
      if(p) setParticipants(p);
      if(r && r.length>0) setRounds(r); else {setRounds(ROUNDS_DEFAULT);await storageSet(KEYS.rounds,ROUNDS_DEFAULT);}
      if(pk) setPicks(pk);
      if(lb) setLongBets(lb);
      if(res) setResults(res);
      if(lr) setLongResults(lr);
      if(pn) setPins(pn);
      setLoaded(true);
    })();
  },[]);

  useEffect(()=>{if(loaded)storageSet(KEYS.participants,participants);},[participants]);
  useEffect(()=>{if(loaded)storageSet(KEYS.rounds,rounds);},[rounds]);
  useEffect(()=>{if(loaded)storageSet(KEYS.picks,picks);},[picks]);
  useEffect(()=>{if(loaded)storageSet(KEYS.longBets,longBets);},[longBets]);
  useEffect(()=>{if(loaded)storageSet(KEYS.results,results);},[results]);
  useEffect(()=>{if(loaded)storageSet(KEYS.longResults,longResults);},[longResults]);
  useEffect(()=>{if(loaded)storageSet(KEYS.pins,pins);},[pins]);

  const handleSetPin = (pid, pin) => setPins(p=>({...p,[pid]:pin}));
  const handleResetPin = (pid) => setPins(p=>{const n={...p}; delete n[pid]; return n;});

  if(!loaded) return (
    <>
      <Head>
        <title>Bolão da Copa 2026</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
      </Head>
      <div style={{minHeight:"100vh",background:BG_BASE,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:TEXT_SECONDARY,fontFamily:"'Outfit',sans-serif"}}>⚽ Carregando...</div></div>
    </>
  );
  const headTag = (
    <Head>
      <title>Bolão da Copa 2026</title>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet"/>
    </Head>
  );
  if(view==="select") return <><Head><title>Bolão da Copa 2026</title><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/><link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet"/></Head><SelectScreen participants={participants} pins={pins} onSelect={p=>{setCurrentParticipant(p);setView("user");}} onAdmin={()=>setView("admin")} onSetPin={handleSetPin}/></>;
  if(view==="admin") return <><Head><title>Admin — Bolão da Copa 2026</title><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/><link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet"/></Head><AdminView rounds={rounds} setRounds={setRounds} participants={participants} setParticipants={setParticipants} results={results} setResults={setResults} longResults={longResults} setLongResults={setLongResults} pins={pins} onResetPin={handleResetPin} onLogout={()=>setView("select")}/></>;
  return <><Head><title>Bolão da Copa 2026</title><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/><link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet"/></Head><UserView participant={currentParticipant} rounds={rounds} picks={picks} onPicksChange={setPicks} results={results} longBets={longBets} onLongBetsChange={setLongBets} longResults={longResults} participants={participants} onBack={()=>setView("select")}/></>;
}
