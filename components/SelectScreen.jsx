import { useState } from "react";
import {
  BG_BASE, BG_CARD, BG_SURFACE, BORDER_CARD, BORDER_INPUT,
  PRIMARY, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_GOLD,
  ERROR, DANGER,
} from "../styles/colors";
import { PinPad } from "./PinPad";

// ============================================================
// SELECT SCREEN — Tela de seleção de participante e login
// ============================================================

export function SelectScreen({ participants, pins, onSelect, onAdmin, onSetPin }) {
  const [adminMode, setAdminMode] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [pinError, setPinError] = useState("");
  const [step, setStep] = useState("list"); // list | enter_pin | create_pin | confirm_pin
  const [newPin, setNewPin] = useState("");

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
    setStep(pins?.[p.id] ? "enter_pin" : "create_pin");
  };

  const handleEnterPin = (pin) => {
    if (pin === pins[selectedParticipant.id]) {
      onSelect(selectedParticipant);
    } else {
      setPinError("PIN incorreto. Tente novamente.");
      setTimeout(() => setPinError(""), 2000);
    }
  };

  const handleCreatePin = (pin) => { setNewPin(pin); setStep("confirm_pin"); };

  const handleConfirmPin = (pin) => {
    if (pin === newPin) {
      onSetPin(selectedParticipant.id, pin);
      onSelect(selectedParticipant);
    } else {
      setPinError("Os PINs não coincidem. Tente novamente.");
      setNewPin("");
      setStep("create_pin");
      setTimeout(() => setPinError(""), 2500);
    }
  };

  const back = () => { setStep("list"); setSelectedParticipant(null); setPinError(""); setNewPin(""); };

  return (
    <div style={{ minHeight:"100vh", background:BG_BASE, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", fontFamily:"'Outfit',sans-serif" }}>
      <div style={{ width:"100%", maxWidth:"380px" }}>
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{ fontSize:"56px", marginBottom:"8px" }}>⚽</div>
          <h1 style={{ color:TEXT_PRIMARY, fontFamily:"'Bebas Neue',cursive", fontSize:"38px", letterSpacing:"4px", margin:"0 0 3px" }}>BOLÃO</h1>
          <h2 style={{ color:TEXT_GOLD, fontFamily:"'Bebas Neue',cursive", fontSize:"24px", letterSpacing:"3px", margin:"0 0 6px" }}>DA COPA 2026</h2>
          {step === "list" && <p style={{ color:TEXT_SECONDARY, fontSize:"16px", margin:0 }}>Selecione seu nome para entrar</p>}
        </div>

        {step === "list" && !adminMode && (
          <>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"18px" }}>
              {participants.length === 0
                ? <p style={{ color:TEXT_SECONDARY, textAlign:"center", padding:"28px 0", fontSize:"16px" }}>Nenhum participante ainda.<br/>Acesse o admin para cadastrar.</p>
                : participants.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectParticipant(p)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = PRIMARY}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDER_CARD}
                    style={{
                      background:BG_CARD, border:`2px solid ${BORDER_CARD}`, borderRadius:"12px",
                      padding:"16px 18px", cursor:"pointer", color:TEXT_PRIMARY,
                      fontSize:"18px", fontWeight:"700", fontFamily:"'Outfit',sans-serif",
                      textAlign:"left", display:"flex", alignItems:"center",
                      justifyContent:"space-between", gap:"10px", transition:"border-color 0.2s",
                    }}
                  >
                    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                      <span style={{ fontSize:"26px" }}>👤</span>{p.name}
                    </div>
                    <span style={{ fontSize:"18px" }}>{pins?.[p.id] ? "🔒" : "🆕"}</span>
                  </button>
                ))
              }
            </div>
            <button
              onClick={() => setAdminMode(true)}
              style={{ width:"100%", padding:"14px", background:"transparent", border:`2px dashed ${BORDER_INPUT}`, borderRadius:"10px", color:TEXT_SECONDARY, cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontSize:"16px" }}
            >
              🔐 Acesso Admin
            </button>
          </>
        )}

        {step === "enter_pin" && (
          <PinPad title={`Olá, ${selectedParticipant?.name}!`} subtitle="Digite seu PIN de 4 dígitos" onSubmit={handleEnterPin} error={pinError} onBack={back} />
        )}

        {step === "create_pin" && (
          <PinPad title={`Bem-vindo, ${selectedParticipant?.name}!`} subtitle="Crie um PIN de 4 dígitos para proteger sua conta" onSubmit={handleCreatePin} error={pinError} onBack={back} />
        )}

        {step === "confirm_pin" && (
          <PinPad title="Confirme seu PIN" subtitle="Digite o PIN novamente para confirmar" onSubmit={handleConfirmPin} error={pinError} onBack={() => { setStep("create_pin"); setNewPin(""); setPinError(""); }} />
        )}

        {step === "list" && adminMode && (
          <div style={{ background:BG_CARD, borderRadius:"14px", padding:"22px" }}>
            <p style={{ color:ERROR, fontWeight:"700", margin:"0 0 14px", textAlign:"center", fontSize:"18px" }}>🔐 Painel Administrador</p>
            <input
              type="password"
              placeholder="Senha de admin"
              value={adminPass}
              onChange={e => setAdminPass(e.target.value)}
              onKeyDown={async e => { if (e.key === "Enter" && await checkAdminPassword(adminPass)) onAdmin(); }}
              style={{ width:"100%", padding:"13px 14px", background:BG_BASE, border:`2px solid ${BORDER_INPUT}`, borderRadius:"10px", color:TEXT_PRIMARY, fontSize:"17px", fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box", marginBottom:"12px" }}
            />
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={() => setAdminMode(false)} style={{ flex:1, padding:"13px", background:BG_SURFACE, border:"none", borderRadius:"10px", color:TEXT_SECONDARY, cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:"700", fontSize:"16px" }}>Voltar</button>
              <button onClick={async () => { if (await checkAdminPassword(adminPass)) onAdmin(); else alert("Senha incorreta!"); }} style={{ flex:2, padding:"13px", background:DANGER, border:"none", borderRadius:"10px", color:"#fff", cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontWeight:"700", fontSize:"16px" }}>Entrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
