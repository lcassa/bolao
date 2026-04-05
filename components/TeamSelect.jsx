import { useState, useEffect, useRef } from "react";
import {
  BG_BASE, BG_DROPDOWN, BG_SURFACE, BORDER_INPUT, BORDER_CARD,
  PRIMARY, TEXT_PRIMARY, TEXT_SECONDARY,
} from "../styles/colors";
import { ALL_TEAMS, fl } from "../data/teams";

// ============================================================
// TEAM SELECT — Campo de busca com lista filtrada de seleções
// ============================================================

export function TeamSelect({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = query.trim() === ""
    ? ALL_TEAMS
    : ALL_TEAMS.filter(t => t.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const select = (team) => { onChange(team); setQuery(team); setOpen(false); };
  const clear  = () =>      { onChange("");   setQuery("");   setOpen(false); };

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
          : <span   style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", color:TEXT_SECONDARY, fontSize:"16px", pointerEvents:"none" }}>🔍</span>
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
              <button
                key={team}
                onClick={() => select(team)}
                onMouseEnter={e => { if (value !== team) e.currentTarget.style.background = BG_SURFACE; }}
                onMouseLeave={e => { if (value !== team) e.currentTarget.style.background = "transparent"; }}
                style={{
                  width:"100%", padding:"13px 14px",
                  background: value === team ? PRIMARY : "transparent",
                  border:"none", borderBottom:`1px solid ${BORDER_CARD}`,
                  color:TEXT_PRIMARY, fontSize:"16px",
                  fontFamily:"'Outfit',sans-serif", cursor:"pointer",
                  textAlign:"left", display:"flex", alignItems:"center", gap:"10px",
                }}
              >
                <span style={{ fontSize:"22px" }}>{fl(team)}</span>
                <span style={{ fontWeight: value === team ? "700" : "400" }}>{team}</span>
              </button>
            ))
          }
        </div>
      )}
    </div>
  );
}
