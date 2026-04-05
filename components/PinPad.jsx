import { useState, useEffect, useRef } from "react";
import {
  BG_CARD, BG_BASE, BG_SURFACE, BORDER_INPUT,
  PRIMARY, TEXT_PRIMARY, TEXT_SECONDARY, ERROR,
} from "../styles/colors";

// ============================================================
// PIN PAD — Entrada de PIN de 4 dígitos
// ============================================================

export function PinPad({ title, subtitle, onSubmit, error, onBack }) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const refs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => { refs[0].current?.focus(); }, []);

  const handleDigit = (i, val) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 3) refs[i + 1].current.focus();
    if (next.every(x => x !== "")) {
      setTimeout(() => onSubmit(next.join("")), 80);
    }
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current.focus();
  };

  const clear = () => { setDigits(["", "", "", ""]); refs[0].current.focus(); };

  const dotStyle = (i) => ({
    width: "56px", height: "72px", borderRadius: "14px",
    border: error ? `2px solid ${ERROR}` : digits[i] ? `2px solid ${PRIMARY}` : `2px solid ${BORDER_INPUT}`,
    background: BG_BASE, color: TEXT_PRIMARY, fontSize: "32px", fontWeight: "700",
    textAlign: "center", outline: "none",
    fontFamily: "'Bebas Neue',cursive", MozAppearance: "textfield", caretColor: "transparent",
  });

  return (
    <div style={{ background:BG_CARD, borderRadius:"16px", padding:"28px 22px", textAlign:"center" }}>
      <p style={{ color:TEXT_PRIMARY, fontWeight:"700", fontSize:"20px", margin:"0 0 6px" }}>{title}</p>
      <p style={{ color:TEXT_SECONDARY, fontSize:"16px", margin:"0 0 24px" }}>{subtitle}</p>

      <div style={{ display:"flex", justifyContent:"center", gap:"12px", marginBottom:"16px" }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="number"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleDigit(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            onFocus={e => e.target.select()}
            style={dotStyle(i)}
          />
        ))}
      </div>

      {error && <p style={{ color:ERROR, fontSize:"15px", margin:"0 0 12px", fontWeight:"600" }}>{error}</p>}

      <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
        {onBack && (
          <button onClick={onBack} style={{ background:BG_SURFACE, border:"none", borderRadius:"10px", padding:"11px 22px", color:TEXT_SECONDARY, cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:"700", fontSize:"16px" }}>
            ← Voltar
          </button>
        )}
        <button onClick={clear} style={{ background:BG_SURFACE, border:"none", borderRadius:"10px", padding:"11px 22px", color:TEXT_SECONDARY, cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:"700", fontSize:"16px" }}>
          Limpar
        </button>
      </div>
    </div>
  );
}
