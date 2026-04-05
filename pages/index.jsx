import Head from "next/head";
import { useState, useEffect } from "react";
import { BG_BASE, TEXT_SECONDARY } from "../styles/colors";
import { KEYS, storageGet, storageSet } from "../lib/storage";
import { ROUNDS_DEFAULT } from "../data/rounds";
import { SelectScreen } from "../components/SelectScreen";
import { UserView } from "../components/UserView";
import { AdminView } from "../components/AdminView";

// ============================================================
// APP — Componente raiz: estado global, persistência e roteamento
// ============================================================

const HEAD_BASE = (
  <>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />
  </>
);

export default function App() {
  const [loaded,          setLoaded]          = useState(false);
  const [view,            setView]            = useState("select");
  const [currentParticipant, setCurrentParticipant] = useState(null);
  const [participants,    setParticipants]    = useState([]);
  const [rounds,          setRounds]          = useState([]);
  const [picks,           setPicks]           = useState({});
  const [longBets,        setLongBets]        = useState({});
  const [results,         setResults]         = useState({});
  const [longResults,     setLongResults]     = useState({});
  const [pins,            setPins]            = useState({});

  // Carregamento inicial — busca todos os dados do Vercel KV em paralelo
  useEffect(() => {
    (async () => {
      const [p, r, pk, lb, res, lr, , pn] = await Promise.all([
        storageGet(KEYS.participants),
        storageGet(KEYS.rounds),
        storageGet(KEYS.picks),
        storageGet(KEYS.longBets),
        storageGet(KEYS.results),
        storageGet(KEYS.longResults),
        storageGet(KEYS.initialized),
        storageGet(KEYS.pins),
      ]);
      if (p)  setParticipants(p);
      if (r && r.length > 0) setRounds(r);
      else { setRounds(ROUNDS_DEFAULT); await storageSet(KEYS.rounds, ROUNDS_DEFAULT); }
      if (pk) setPicks(pk);
      if (lb) setLongBets(lb);
      if (res) setResults(res);
      if (lr) setLongResults(lr);
      if (pn) setPins(pn);
      setLoaded(true);
    })();
  }, []);

  // Persistência automática — cada estado sincroniza com o KV ao mudar
  useEffect(() => { if (loaded) storageSet(KEYS.participants, participants); }, [participants]);
  useEffect(() => { if (loaded) storageSet(KEYS.rounds,       rounds);       }, [rounds]);
  useEffect(() => { if (loaded) storageSet(KEYS.picks,        picks);        }, [picks]);
  useEffect(() => { if (loaded) storageSet(KEYS.longBets,     longBets);     }, [longBets]);
  useEffect(() => { if (loaded) storageSet(KEYS.results,      results);      }, [results]);
  useEffect(() => { if (loaded) storageSet(KEYS.longResults,  longResults);  }, [longResults]);
  useEffect(() => { if (loaded) storageSet(KEYS.pins,         pins);         }, [pins]);

  const handleSetPin   = (pid, pin) => setPins(p => ({ ...p, [pid]: pin }));
  const handleResetPin = (pid)      => setPins(p => { const n = { ...p }; delete n[pid]; return n; });

  if (!loaded) return (
    <>
      <Head>
        <title>Bolão da Copa 2026</title>
        {HEAD_BASE}
      </Head>
      <div style={{ minHeight:"100vh", background:BG_BASE, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:TEXT_SECONDARY, fontFamily:"'Outfit',sans-serif" }}>⚽ Carregando...</div>
      </div>
    </>
  );

  if (view === "select") return (
    <>
      <Head><title>Bolão da Copa 2026</title>{HEAD_BASE}</Head>
      <SelectScreen
        participants={participants}
        pins={pins}
        onSelect={p => { setCurrentParticipant(p); setView("user"); }}
        onAdmin={() => setView("admin")}
        onSetPin={handleSetPin}
      />
    </>
  );

  if (view === "admin") return (
    <>
      <Head><title>Admin — Bolão da Copa 2026</title>{HEAD_BASE}</Head>
      <AdminView
        rounds={rounds}          setRounds={setRounds}
        participants={participants} setParticipants={setParticipants}
        results={results}        setResults={setResults}
        longResults={longResults} setLongResults={setLongResults}
        pins={pins}
        onResetPin={handleResetPin}
        onLogout={() => setView("select")}
      />
    </>
  );

  return (
    <>
      <Head><title>Bolão da Copa 2026</title>{HEAD_BASE}</Head>
      <UserView
        participant={currentParticipant}
        rounds={rounds}
        picks={picks}           onPicksChange={setPicks}
        results={results}
        longBets={longBets}     onLongBetsChange={setLongBets}
        longResults={longResults}
        participants={participants}
        onBack={() => setView("select")}
      />
    </>
  );
}
