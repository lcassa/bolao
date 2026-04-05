import { BORDER_INPUT, BG_BASE, TEXT_PRIMARY } from "../styles/colors";

// ============================================================
// SCORE INPUT — Campo numérico para palpite de gols
// ============================================================

export function ScoreInput({ value, onChange, disabled }) {
  return (
    <input
      type="number"
      min="0"
      max="99"
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "62px", height: "62px", borderRadius: "10px",
        border: `2px solid ${BORDER_INPUT}`, background: BG_BASE,
        color: TEXT_PRIMARY, fontSize: "28px", fontWeight: "700",
        textAlign: "center", outline: "none",
        fontFamily: "'Bebas Neue',cursive", MozAppearance: "textfield",
        opacity: disabled ? 0.4 : 1,
      }}
    />
  );
}
