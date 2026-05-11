import { useEffect, useState } from "react";
import { usePlatformData } from "./hooks/usePlatformData";

let FAMILIES = {};
let ASSETS = [];
let ACTIVITY = [];

const SC0 = {
  "ai-review": { label: "AI Review", color: "#0EA5E9", bg: "#F0F9FF" },
  remediation: { label: "Needs Changes", color: "#F59E0B", bg: "#FFFBEB" },
  governance: { label: "Governance", color: "#8B5CF6", bg: "#F5F3FF" },
  approved: { label: "Approved", color: "#22C55E", bg: "#DCFCE7" },
};
const CL = { aws: "AWS", gcp: "GCP", azure: "Azure" };
const CC = { aws: "#F59E0B", gcp: "#0EA5E9", azure: "#06B6D4" };
const ML = { experimental: "Experimental", validated: "Validated", "battle-tested": "Battle-Tested" };
const MC = { experimental: "#F59E0B", validated: "#22C55E", "battle-tested": "#0EA5E9" };
const EC = { low: "#22C55E", medium: "#F59E0B", high: "#EF4444" };
const ACM = { blue: "#0EA5E9", purple: "#8B5CF6", orange: "#F59E0B", green: "#22C55E" };
const UNKNOWN_FAMILY = { name: "Unknown", color: "#6B7280", bg: "#F3F4F6", tagline: "Unavailable Family", longDesc: "This family was deleted from MongoDB.", solutions: [], useCases: [], dependsOn: [], enables: [] };
const getFamily = (key) => FAMILIES[key] || UNKNOWN_FAMILY;

const URL_RE = /(https?:\/\/[^\s,)<>]+|(?:[a-zA-Z0-9-]+\.)+(?:io|com|org|net|dev|app|co|ai|xyz|info|biz|us|in|cloud)[^\s,)<>]*)/;
function Linkify({ text, style }) {
  if (!text || typeof text !== "string") return text || null;
  const parts = text.split(URL_RE);
  if (parts.length === 1) return <span style={style}>{text}</span>;
  return <span style={style}>{parts.map((p, i) => {
    if (!URL_RE.test(p)) return p;
    const href = p.startsWith("http") ? p : `https://${p}`;
    return <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#0EA5E9", textDecoration: "underline", wordBreak: "break-all" }}>{p}</a>;
  })}</span>;
}

export default function App() {
  const { families, assets, submissions, activity, loading, refreshing, error, submitAsset, reload } = usePlatformData();
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [asset, setAsset] = useState(null);
  const [sub, setSub] = useState(null);
  const [famKey, setFamKey] = useState(null);
  const [ff, setFf] = useState("all");
  const [cf, setCf] = useState([]);
  const [mf, setMf] = useState([]);
  const [df, setDf] = useState(false);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("grid");
  const [subs, setSubs] = useState([]);
  const [sf, setSf] = useState("all");
  const USER_STORAGE_KEY = "aimplify-user";

  FAMILIES = families || {};
  ASSETS = assets || [];
  ACTIVITY = activity || [];

  useEffect(() => {
    setSubs(submissions || []);
  }, [submissions]);

  useEffect(() => {
    try {
      const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
      if (rawUser) {
        setUser(JSON.parse(rawUser));
      }
    } catch {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    window.localStorage.removeItem(USER_STORAGE_KEY);
  };

  const tc = (c) => setCf((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  const tm = (m) => setMf((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]));
  const fil = ASSETS.filter((a) => {
    if (ff !== "all" && a.family !== ff) return false;
    if (cf.length && !cf.some((c) => a.clouds.includes(c))) return false;
    if (mf.length && !mf.includes(a.maturity)) return false;
    if (df && !a.demoReady) return false;
    if (q) {
      const s = q.toLowerCase();
      return (
        a.name.toLowerCase().includes(s) ||
        a.desc.toLowerCase().includes(s) ||
        a.tags.some((t) => t.toLowerCase().includes(s)) ||
        a.id.toLowerCase().includes(s) ||
        a.solution.toLowerCase().includes(s)
      );
    }
    return true;
  });
  const nav = (v) => {
    setView(v);
    setAsset(null);
    setSub(null);
    setFamKey(null);
    window.scrollTo(0, 0);
  };
  const openA = (a) => {
    setAsset(a);
    setView("detail");
    window.scrollTo(0, 0);
  };
  const openS = (s) => {
    setSub(s);
    setView("sub-detail");
    window.scrollTo(0, 0);
  };
  const openFam = (k) => {
    setFamKey(k);
    setView("family");
    window.scrollTo(0, 0);
  };
  const pc = subs.filter((s) => s.status !== "approved").length;

  if (loading) return <div style={{ padding: 40 }}>Loading platform data...</div>;
  if (error) return <div style={{ padding: 40, color: "#EF4444" }}>Error: {error}</div>;
  if (!user) return <LoginPage onLogin={handleLogin} families={families || {}} assets={assets || []} />;

  return (
    <div style={{ fontFamily: "'Poppins',-apple-system,sans-serif", background: "#FAFBFC", minHeight: "100vh", color: "#1a1a2e" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}*{box-sizing:border-box;margin:0;padding:0}::selection{background:#0EA5E9;color:#fff}input::placeholder,textarea::placeholder{color:#9CA3AF}button{cursor:pointer}select{font-family:inherit}`}</style>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 64, borderBottom: "1px solid #E5E7EB", background: "#fff", position: "sticky", top: 0, zIndex: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => nav("home")}>
            <img src="https://www.infovision.com/wp-content/uploads/2024/12/Logo-1.svg" alt="IV" style={{ height: 22 }} onError={(e) => { e.target.style.display = "none"; }} />
            <div style={{ width: 1, height: 24, background: "#E5E7EB" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#0EA5E9,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>Ai</div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>AIMPLIFY</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 3 }}>{[{ k: "home", l: "Home" }, { k: "catalog", l: "Catalog" }, { k: "pipeline", l: "Pipeline" }, { k: "submit", l: "Submit" }].map((n) => <div key={n.k} onClick={() => nav(n.k)} style={{ padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer", color: view === n.k ? "#0EA5E9" : "#6B7280", background: view === n.k ? "#F0F9FF" : "transparent", display: "flex", alignItems: "center", gap: 5 }}>{n.l}{n.k === "pipeline" && pc > 0 && <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#0EA5E9", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{pc}</span>}</div>)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button disabled={refreshing} onClick={() => reload({ silent: true })} title="Refresh data" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", fontSize: 14, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", opacity: refreshing ? 0.7 : 1 }}>
            <span style={{ display: "inline-block", animation: refreshing ? "spin .8s linear infinite" : "none" }}>↻</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 8, padding: "7px 14px", width: 200 }}>
            <span style={{ color: "#9CA3AF", fontSize: 14, fontWeight: 300 }}>/</span>
            <input value={q} onChange={(e) => { setQ(e.target.value); if (view !== "catalog") { setView("catalog"); setFf("all"); } }} placeholder="Search..." style={{ border: "none", background: "none", outline: "none", fontSize: 13, flex: 1, fontFamily: "inherit", color: "#1a1a2e" }} />
            {q && <span onClick={() => setQ("")} style={{ color: "#9CA3AF", cursor: "pointer", fontSize: 12 }}>✕</span>}
          </div>
          <div onClick={handleLogout} title="Sign out" style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#22C55E,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", cursor: "pointer" }}>{user.init}</div>
        </div>
      </nav>
      {view === "home" && <HomeView user={user} openFam={openFam} openA={openA} nav={nav} subs={subs} openS={openS} />}
      {view === "family" && famKey && <FamilyView fk={famKey} openA={openA} goBack={() => nav("home")} nav={nav} />}
      {view === "catalog" && <div><div style={{ padding: "24px 40px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><h1 style={{ fontSize: 24, fontWeight: 700 }}>Asset Catalog</h1><p style={{ color: "#6B7280", fontSize: 13, marginTop: 3 }}>{fil.length} of {ASSETS.length} assets</p></div><div style={{ display: "flex", gap: 8, alignItems: "center" }}><button onClick={() => nav("submit")} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #0EA5E9", background: "#F0F9FF", color: "#0EA5E9", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>+ Submit</button><div style={{ display: "flex", gap: 3, background: "#F3F4F6", borderRadius: 8, padding: 3 }}>{["grid", "list"].map((m) => <button key={m} onClick={() => setMode(m)} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: mode === m ? "#fff" : "transparent", color: mode === m ? "#1a1a2e" : "#9CA3AF", fontSize: 12, fontWeight: 500, fontFamily: "inherit", boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,.08)" : "none", textTransform: "capitalize" }}>{m}</button>)}</div></div></div>
        <div style={{ padding: "0 40px 12px", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>{[{ k: "all", l: "All" }, ...Object.entries(FAMILIES).map(([k, f]) => ({ k, l: f.name }))].map((p) => <Chip key={p.k} active={ff === p.k} onClick={() => setFf(p.k)} color={p.k === "all" ? "#6B7280" : (FAMILIES[p.k]?.color || "#6B7280")}>{p.l}</Chip>)}<Dv />{["aws", "gcp", "azure"].map((c) => <Chip key={c} active={cf.includes(c)} onClick={() => tc(c)} color={CC[c]} dot>{CL[c]}</Chip>)}<Dv />{["experimental", "validated", "battle-tested"].map((m) => <Chip key={m} active={mf.includes(m)} onClick={() => tm(m)} color={MC[m]}>{ML[m]}</Chip>)}<Dv /><Chip active={df} onClick={() => setDf(!df)} color="#22C55E">Demo</Chip>{(cf.length || mf.length || df || ff !== "all") && <span onClick={() => { setCf([]); setMf([]); setDf(false); setFf("all"); }} style={{ fontSize: 11, color: "#9CA3AF", cursor: "pointer", marginLeft: 4 }}>Clear all</span>}</div>
        {fil.length === 0 ? <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}><div style={{ fontSize: 28, fontWeight: 200, color: "#D1D5DB" }}>-</div><div style={{ fontSize: 15, fontWeight: 500, marginTop: 8 }}>No matching assets</div></div> : mode === "grid" ? <div style={{ padding: "0 40px 48px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>{fil.map((a, i) => <ACard key={a.id} a={a} i={i} onClick={() => openA(a)} />)}</div> : <div style={{ padding: "0 40px 48px", display: "flex", flexDirection: "column", gap: 8 }}>{fil.map((a, i) => <ARow key={a.id} a={a} i={i} onClick={() => openA(a)} />)}</div>}</div>}
      {view === "detail" && asset && <DV a={asset} goBack={() => nav("catalog")} openA={openA} />}
      {view === "pipeline" && <div><div style={{ padding: "24px 40px 8px", display: "flex", justifyContent: "space-between" }}><div><h1 style={{ fontSize: 24, fontWeight: 700 }}>Contribution Pipeline</h1><p style={{ color: "#6B7280", fontSize: 13, marginTop: 3 }}>Submit → AI Review → Governance → Published</p></div><button onClick={() => nav("submit")} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#0EA5E9", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>+ Submit</button></div>
        <div style={{ padding: "14px 40px", display: "flex", gap: 6 }}><Chip active={sf === "all"} onClick={() => setSf("all")} color="#6B7280">All</Chip>{Object.entries(SC0).map(([k, v]) => <Chip key={k} active={sf === k} onClick={() => setSf(k)} color={v.color}>{v.label}</Chip>)}</div>
        <div style={{ padding: "0 40px 48px", display: "flex", flexDirection: "column", gap: 10 }}>{(sf === "all" ? subs : subs.filter((s) => s.status === sf)).map((s) => { const sc = SC0[s.status] || SC0["ai-review"]; const fm = getFamily(s.family); return <div key={s.id} onClick={() => openS(s)} style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 22px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, cursor: "pointer", transition: "all .2s" }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.06)"} onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}><div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${fm.color},${sc.color})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{s.submitterInit}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{s.submitter} · {s.date} · <span style={{ color: fm.color, fontWeight: 500 }}>{fm.name}</span></div></div><div style={{ textAlign: "center", minWidth: 48 }}><div style={{ fontSize: 17, fontWeight: 700, color: s.aiScore >= 80 ? "#22C55E" : s.aiScore >= 60 ? "#F59E0B" : "#EF4444" }}>{s.aiScore}</div><div style={{ fontSize: 9, color: "#9CA3AF", textTransform: "uppercase" }}>Score</div></div><span style={{ fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 14, background: sc.bg, color: sc.color, whiteSpace: "nowrap" }}>{sc.label}</span><span style={{ color: "#D1D5DB" }}>→</span></div>; })}</div></div>}
      {view === "sub-detail" && sub && <SDV sub={sub} goBack={() => nav("pipeline")} />}
      {view === "submit" && <SubmitView goBack={() => nav("pipeline")} subs={subs} setSubs={setSubs} onDone={() => nav("pipeline")} onSubmitAsset={submitAsset} />}
    </div>
  );
}

function loginFamilyAssetCount(assets, familyKey) {
  const nk = String(familyKey || "").toLowerCase();
  return assets.filter((a) => String(a.family || "").toLowerCase() === nk).length;
}

function LoginPage({ onLogin, families, assets }) {
  const fam = families || {};
  const ast = assets || [];
  const familyRows = Object.entries(fam).sort(([, a], [, b]) => String(a.name || "").localeCompare(String(b.name || "")));
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const doLogin = () => { if (!email.includes("@")) { setErr("Enter a valid email"); return; } if (pass.length < 3) { setErr("Enter your password"); return; } const name = email.split("@")[0].split(".").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "); const init = name.split(" ").map((w) => w[0]).join("").slice(0, 2); onLogin({ name, email, init, role: "Engineering" }); };
  const ivLogo = "https://www.infovision.com/wp-content/uploads/2024/12/Logo-1.svg";
  return <div style={{ fontFamily: "'Poppins',sans-serif", minHeight: "100vh", display: "flex", background: "#FAFBFC" }}><style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input::placeholder{color:#9CA3AF}`}</style>
    <div style={{ flex: 1, background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(14,165,233,0.08)" }} />
      <div style={{ position: "absolute", bottom: -60, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.08)" }} />
      <div style={{
        marginBottom: 36,
        maxWidth: 380,
        alignSelf: "flex-start",
        padding: "20px 22px 18px",
        borderRadius: 16,
        background: "linear-gradient(155deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)",
        WebkitBackdropFilter: "blur(14px)",
        backdropFilter: "blur(14px)",
      }}>
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.97)", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 14 }}>
          <img src={ivLogo} alt="InfoVision" style={{ height: 44, width: "auto", maxWidth: 210, display: "block", objectFit: "contain", objectPosition: "left center" }} onError={(e) => { e.target.style.display = "none"; }} />
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 100%)", marginBottom: 14 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,#0EA5E9,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0, boxShadow: "0 4px 14px rgba(14,165,233,0.35)" }}>Ai</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(148,163,184,0.95)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Internal platform</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.15 }}>AIMPLIFY</span>
          </div>
        </div>
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}>AI Capabilities &<br />Accelerator Platform</h1>
      <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6, maxWidth: 400 }}>Discover, deploy, and demonstrate InfoVision's AI assets - from prompt libraries and agent patterns to production-ready accelerators.</p>
      <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap" }}>{familyRows.map(([k, f]) => <div key={k} style={{ textAlign: "center", minWidth: 56 }}><div style={{ fontSize: 20, fontWeight: 700, color: f.color }}>{loginFamilyAssetCount(ast, k)}</div><div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{f.name}</div></div>)}</div>
    </div>
    <div style={{ width: 480, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px", background: "#fff" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Sign in</h2>
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 28 }}>Use your InfoVision credentials</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div><label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "#4B5563" }}>Email</label><input value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && doLogin()} placeholder="you@infovision.com" style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#1a1a2e" }} /></div>
        <div><label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "#4B5563" }}>Password</label><input value={pass} onChange={(e) => { setPass(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && doLogin()} type="password" placeholder="Enter your password" style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#1a1a2e" }} /></div>
        {err && <div style={{ fontSize: 12, color: "#EF4444" }}>{err}</div>}
        <button onClick={doLogin} style={{ padding: "12px", borderRadius: 8, border: "none", background: "#0EA5E9", color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "inherit", marginTop: 4 }}>Sign in</button>
        <div style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 8 }}>SSO via Microsoft Entra ID available</div>
      </div>
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid #F3F4F6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><img src="https://www.infovision.com/wp-content/uploads/2024/12/Logo-1.svg" alt="IV" style={{ height: 18 }} onError={(e) => { e.target.style.display = "none"; }} /><span style={{ fontSize: 11, color: "#9CA3AF" }}>InfoVision Technology · Internal Platform</span></div>
      </div>
    </div>
  </div>;
}

function HomeView({ user, openFam, openA, nav, subs, openS }) {
  const recentAssets = [...ASSETS].sort((a, b) => b.stats.deployments - a.stats.deployments).slice(0, 5);
  const pendingSubs = subs.filter((s) => s.status !== "approved");
  const totalDeploys = ASSETS.reduce((s, a) => s + a.stats.deployments, 0); const demoCount = ASSETS.filter((a) => a.demoReady).length; const btCount = ASSETS.filter((a) => a.maturity === "battle-tested").length;
  return <div><div style={{ padding: "28px 40px 20px" }}><h1 style={{ fontSize: 24, fontWeight: 700 }}>Welcome back, {user.name.split(" ")[0]}</h1><p style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>Here's what's happening across the AIMPLIFY platform</p></div>
    <div style={{ padding: "0 40px 20px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>{[[ASSETS.length, "Total Assets", "#0EA5E9"], [btCount, "Battle-Tested", "#0EA5E9"], [demoCount, "Demo-Ready", "#22C55E"], [totalDeploys, "Total Deploys", "#8B5CF6"]].map(([n, l, c], i) => <div key={i} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "16px 20px" }}><div style={{ fontSize: 22, fontWeight: 700, color: c }}>{n}</div><div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{l}</div></div>)}</div>
    <div style={{ padding: "0 40px 20px" }}><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Platform Families</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>{Object.entries(FAMILIES).map(([k, f]) => { const cnt = ASSETS.filter((a) => a.family === k).length; return <div key={k} onClick={() => openFam(k)} style={{ padding: "16px 18px", borderRadius: 12, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer", transition: "all .25s", borderTop: `3px solid ${f.color}` }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.06)"; e.currentTarget.style.borderColor = "#D1D5DB"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#E5E7EB"; }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 15, fontWeight: 700, color: f.color }}>{f.name}</span><span style={{ fontSize: 11, fontWeight: 600, color: f.color, background: `${f.color}15`, padding: "2px 8px", borderRadius: 10 }}>{cnt}</span></div><div style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.4 }}>{f.tagline}</div></div>; })}</div></div>
    <div style={{ padding: "0 40px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "18px 22px" }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Most Deployed Assets</div>
        {recentAssets.map((a) => { const fm = getFamily(a.family); return <div key={a.id} onClick={() => openA(a)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F3F4F6", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}><span style={{ width: 8, height: 8, borderRadius: "50%", background: fm.color, flexShrink: 0 }} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div><div style={{ fontSize: 11, color: "#9CA3AF" }}>{a.id} · {fm.name}</div></div><div style={{ fontSize: 13, fontWeight: 600, color: "#4B5563" }}>{a.stats.deployments}</div><span style={{ color: "#D1D5DB", fontSize: 12, marginLeft: 4 }}>→</span></div>; })}
        <div onClick={() => nav("catalog")} style={{ marginTop: 12, fontSize: 12, color: "#0EA5E9", fontWeight: 500, cursor: "pointer" }}>View full catalog →</div></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "18px 22px" }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Recent Activity</div>
          {ACTIVITY.map((a, i) => <div key={i} style={{ padding: "8px 0", borderBottom: i < ACTIVITY.length - 1 ? "1px solid #F3F4F6" : "none", fontSize: 12, color: "#4B5563", lineHeight: 1.5 }}><strong>{a.who}</strong> {a.action} <span style={{ color: a.color, fontWeight: 500 }}>{a.what}</span><div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{a.time}</div></div>)}</div>
        {pendingSubs.length > 0 && <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "18px 22px" }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Pipeline ({pendingSubs.length} pending)</div>
          {pendingSubs.slice(0, 3).map((s) => { const sc = SC0[s.status] || SC0["ai-review"]; return <div key={s.id} onClick={() => openS(s)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F3F4F6", cursor: "pointer" }}><span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 10, background: sc.bg, color: sc.color, whiteSpace: "nowrap", flexShrink: 0 }}>{sc.label}</span><div style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{s.name}</div><span style={{ color: "#D1D5DB", fontSize: 12 }}>→</span></div>; })}
          <div onClick={() => nav("pipeline")} style={{ marginTop: 10, fontSize: 12, color: "#0EA5E9", fontWeight: 500, cursor: "pointer" }}>View pipeline →</div></div>}
      </div></div></div>;
}

function FamilyView({ fk, openA, goBack, nav }) { const f = getFamily(fk); const assets = ASSETS.filter((a) => a.family === fk); const depArr = Array.isArray(f.dependsOn) ? f.dependsOn : [f.dependsOn];
  return <div><div style={{ padding: "14px 40px", fontSize: 13 }}><span onClick={goBack} style={{ color: "#0EA5E9", cursor: "pointer", fontWeight: 500 }}>← Home</span><span style={{ color: "#D1D5DB" }}> / </span><span style={{ fontWeight: 500, color: f.color }}>{f.name}</span></div>
    <div style={{ padding: "0 40px 20px" }}><div style={{ background: f.bg, border: `1px solid ${f.color}25`, borderRadius: 14, borderTop: `4px solid ${f.color}`, display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 0, overflow: "hidden", alignItems: "start" }}>
      <div style={{ padding: "28px 28px 28px 32px", borderRight: `1px solid ${f.color}15` }}><div style={{ fontSize: 11, fontWeight: 700, color: f.color, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{f.tagline}</div><h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{f.name}</h1><p style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.7 }}><Linkify text={f.longDesc} /></p><div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>{[[assets.length, "Assets"], [assets.filter((a) => a.maturity === "battle-tested").length, "Battle-Tested"], [assets.filter((a) => a.demoReady).length, "Demo-Ready"], [assets.reduce((s, a) => s + a.stats.deployments, 0), "Deploys"]].map(([n, l], i) => <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "9px 14px", border: "1px solid #E5E7EB", textAlign: "center", minWidth: 60 }}><div style={{ fontSize: 18, fontWeight: 700, color: f.color }}>{n}</div><div style={{ fontSize: 10, color: "#6B7280", marginTop: 1, fontWeight: 500 }}>{l}</div></div>)}</div></div>
      <div style={{ padding: "28px 20px", borderRight: `1px solid ${f.color}15` }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}><span style={{ width: 3, height: 14, borderRadius: 2, background: f.color, display: "inline-block", flexShrink: 0 }} /><span style={{ fontSize: 10, fontWeight: 700, color: f.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>When to Sell</span></div>{f.useCases.map((u, i) => <div key={i} style={{ display: "flex", gap: 7, marginBottom: 10, fontSize: 12, color: "#374151", lineHeight: 1.55 }}><span style={{ color: f.color, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>›</span><span>{u}</span></div>)}</div>
      <div style={{ padding: "28px 20px", borderRight: `1px solid ${f.color}15` }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}><span style={{ width: 3, height: 14, borderRadius: 2, background: "#9CA3AF", display: "inline-block", flexShrink: 0 }} /><span style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em" }}>Depends On</span></div>{depArr.map((d, i) => <div key={i} style={{ fontSize: 12, color: "#374151", lineHeight: 1.55, marginBottom: 8 }}>{d}</div>)}</div>
      <div style={{ padding: "28px 20px 28px 20px" }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}><span style={{ width: 3, height: 14, borderRadius: 2, background: "#22C55E", display: "inline-block", flexShrink: 0 }} /><span style={{ fontSize: 10, fontWeight: 700, color: "#22C55E", textTransform: "uppercase", letterSpacing: "0.07em" }}>Enables</span></div>{f.enables.map((e, i) => <div key={i} style={{ fontSize: 12, color: "#374151", lineHeight: 1.55, marginBottom: 8 }}>{e}</div>)}</div>
    </div></div>
    <div style={{ padding: "0 40px 20px" }}><div style={{ fontSize: 11, fontWeight: 700, marginBottom: 10, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Signature Solutions</div><div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>{f.solutions.map((s, i) => { const [title, ...rest] = s.split(" — "); return <div key={i} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "12px 16px", borderLeft: `3px solid ${f.color}`, display: "flex", gap: 10, alignItems: "flex-start" }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: f.color, flexShrink: 0, marginTop: 4 }} /><div><div style={{ fontSize: 12.5, fontWeight: 600, color: f.color }}>{title}</div>{rest.length > 0 && <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 3, lineHeight: 1.5 }}>{rest.join(" — ")}</div>}</div></div>; })}</div></div>
    <div style={{ padding: "0 40px 48px" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Assets <span style={{ color: "#9CA3AF", fontWeight: 400 }}>({assets.length})</span></div><span onClick={() => nav("submit")} style={{ fontSize: 12, color: f.color, fontWeight: 500, cursor: "pointer" }}>+ Submit to {f.name} →</span></div><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>{assets.map((a, i) => <ACard key={a.id} a={a} i={i} onClick={() => openA(a)} />)}</div>{assets.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#9CA3AF", fontSize: 14 }}>No assets yet. <span onClick={() => nav("submit")} style={{ color: "#0EA5E9", cursor: "pointer", fontWeight: 500 }}>Be the first to contribute.</span></div>}</div>
  </div>;
}

function DV({ a, goBack, openA }) { const [tab, setTab] = useState("overview"); const fm = getFamily(a.family); const rel = ASSETS.filter((x) => x.id !== a.id && x.family === a.family).slice(0, 3);
  return <div style={{ maxWidth: "100%", overflowX: "hidden" }}><div style={{ padding: "14px 40px", fontSize: 13, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", rowGap: 4, maxWidth: "100%" }}><span onClick={goBack} style={{ color: "#0EA5E9", cursor: "pointer", fontWeight: 500 }}>← Catalog</span><span style={{ color: "#D1D5DB" }}>/</span><span style={{ color: fm.color, fontWeight: 500 }}>{fm.name}</span><span style={{ color: "#D1D5DB" }}>/</span><span style={{ fontWeight: 500, minWidth: 0, wordBreak: "break-word", overflowWrap: "anywhere" }}>{a.name}</span></div>
    <div className="dv-layout" style={{ padding: "0 40px 48px" }}><div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}><div style={{ minWidth: 0 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}><span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#9CA3AF", background: "#F3F4F6", padding: "3px 9px", borderRadius: 4, border: "1px solid #E5E7EB" }}>{a.id}</span><Bdg color={fm.color} label={fm.name} /><Bdg color={MC[a.maturity]} label={ML[a.maturity]} />{a.demoReady && <Bdg color="#22C55E" label="Demo Ready" />}</div><h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, wordBreak: "break-word", overflowWrap: "anywhere" }}>{a.name}</h1><div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>{a.clouds.map((c) => <span key={c} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: `${CC[c]}0A`, color: CC[c], border: `1px solid ${CC[c]}20`, fontWeight: 500 }}>{CL[c]}</span>)}</div><div style={{ marginTop: 8, fontSize: 12, color: fm.color, fontWeight: 500, wordBreak: "break-word", overflowWrap: "anywhere", maxWidth: "100%" }}>{a.solution}</div><p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, marginTop: 8, maxWidth: "100%" }}>{a.desc}</p><div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>{(() => { const demoLine = (a.quickStart || "").split("\n").find(l => l.toLowerCase().startsWith("demo")); const demoVal = demoLine ? demoLine.replace(/^demo:\s*/i, "").trim() : ""; const hasDemo = demoVal && !["not available yet", "details being gathered", "request for repo"].includes(demoVal.toLowerCase()); const demoHref = hasDemo ? (demoVal.startsWith("http") ? demoVal : `https://${demoVal}`) : ""; return <Btn primary label="Launch Demo" disabled={!hasDemo} onClick={() => { if (demoHref) window.open(demoHref, "_blank"); }} />; })()}<Btn label="Clone Repo" /></div></div>
      <MediaSection a={a} familyColor={fm.color} />
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid #E5E7EB" }}>{["Overview", "Architecture", "Quick Start"].map((t) => { const k = t.toLowerCase().replace(" ", "-"); return <button key={t} onClick={() => setTab(k)} style={{ padding: "9px 16px", fontSize: 13, fontWeight: 500, border: "none", borderBottom: `2px solid ${tab === k ? "#0EA5E9" : "transparent"}`, background: "none", fontFamily: "inherit", color: tab === k ? "#0EA5E9" : "#9CA3AF" }}>{t}</button>; })}</div>
      <div><Crd><CrdT>About</CrdT>{a.longDesc.split("\n\n").map((p, i) => <p key={i} style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.7, marginTop: i ? 10 : 0 }}><Linkify text={p} /></p>)}<div style={{ display: "flex", gap: 5, marginTop: 14, flexWrap: "wrap" }}>{a.tags.map((t) => <span key={t} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 14, background: "#F3F4F6", color: "#6B7280", fontWeight: 500 }}>{t}</span>)}</div></Crd>
        <Crd><CrdT>Architecture</CrdT><div style={{ background: "#F9FAFB", border: "1px dashed #E5E7EB", borderRadius: 10, padding: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>{a.architecture.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ padding: "10px 16px", borderRadius: 8, background: `${ACM[a.archColors[i]]}0C`, border: `1px solid ${ACM[a.archColors[i]]}25`, color: ACM[a.archColors[i]], fontSize: 12, fontWeight: 600, textAlign: "center", minWidth: 100 }}>{s}</div>{i < a.architecture.length - 1 && <span style={{ color: "#D1D5DB" }}>→</span>}</div>)}</div></Crd>
        <Crd><CrdT>Quick Start</CrdT><div style={{ background: "#1a1a2e", borderRadius: 8, padding: "14px 18px", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, lineHeight: 1.8, color: "#E5E7EB", overflowX: "auto", whiteSpace: "pre" }}>{a.quickStart.split("\n").map((l, i) => <div key={i}>{l.startsWith("#") ? <span style={{ color: "#6B7280" }}>{l}</span> : <Linkify text={l} />}</div>)}</div></Crd>
        <Crd><CrdT>Prerequisites</CrdT><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>{a.prerequisites.map((p, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#F9FAFB", borderRadius: 8, fontSize: 12 }}><span style={{ width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, background: p.done ? "#DCFCE7" : "#F3F4F6", color: p.done ? "#22C55E" : "#D1D5DB", fontWeight: 600, flexShrink: 0 }}>{p.done ? "✓" : ""}</span>{p.name}</div>)}</div></Crd></div></div>
      <aside style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}><SC t="Usage"><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}><SB n={a.stats.deployments} l="Deploys" c="#0EA5E9" /><SB n={a.stats.demos} l="Demos" c="#22C55E" /><SB n={a.stats.projects} l="Projects" c="#F59E0B" /><SB n={`${a.stats.satisfaction}%`} l="Rating" c="#8B5CF6" /></div></SC>
        <SC t="Details">{[["ID", a.id], ["Family", fm.name], ["Category", a.category], ["Solution", a.solution], ["Maturity", ML[a.maturity]], ["Effort", a.effort.charAt(0).toUpperCase() + a.effort.slice(1)]].map(([k, v]) => <div key={k} style={{ display: "grid", gridTemplateColumns: "minmax(72px, auto) minmax(0, 1fr)", columnGap: 8, alignItems: "start", padding: "6px 0", borderBottom: "1px solid #F3F4F6", fontSize: 12, minWidth: 0 }}><span style={{ color: "#9CA3AF", lineHeight: 1.45, flexShrink: 0 }}>{k}</span><span style={{ fontWeight: 500, color: k === "Family" ? fm.color : k === "Maturity" ? MC[a.maturity] : "#1a1a2e", fontFamily: k === "ID" ? "'JetBrains Mono'" : "inherit", fontSize: k === "ID" ? 11 : 12, lineHeight: 1.45, minWidth: 0, wordBreak: "break-word", overflowWrap: "anywhere" }}>{v}</span></div>)}</SC>
        <SC t="Owner"><div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#F9FAFB", borderRadius: 10, minWidth: 0 }}><div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${fm.color},#8B5CF6)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{a.ownerInit}</div><div style={{ fontSize: 13, fontWeight: 600, minWidth: 0, wordBreak: "break-word", overflowWrap: "anywhere" }}>{a.owner}</div></div></SC>
        <SC t="Dependencies">{a.dependencies.map((d, i) => <div key={i} style={{ fontSize: 12, color: "#4B5563", padding: "5px 0", borderBottom: "1px solid #F3F4F6" }}>{d}</div>)}</SC>
        <SC t="Changelog">{a.changelog.map((c, i) => <div key={i} style={{ padding: "6px 0", borderBottom: i < a.changelog.length - 1 ? "1px solid #F3F4F6" : "none" }}><div style={{ display: "flex", gap: 7 }}><span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#0EA5E9", background: "#F0F9FF", padding: "2px 7px", borderRadius: 4 }}>{c.ver}</span><span style={{ fontSize: 10, color: "#9CA3AF" }}>{c.date}</span></div><div style={{ fontSize: 11, color: "#6B7280", marginTop: 3 }}>{c.desc}</div></div>)}</SC>
        {rel.length > 0 && <SC t={`More in ${fm.name}`}>{rel.map((r) => <div key={r.id} onClick={(e) => { e.stopPropagation(); openA(r); }} role="button" tabIndex={0} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 6px", margin: "0 -6px", borderBottom: "1px solid #F3F4F6", cursor: "pointer", borderRadius: 6 }} onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}><span style={{ width: 7, height: 7, borderRadius: "50%", background: fm.color, flexShrink: 0 }} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: 10, color: "#9CA3AF" }}>{r.id}</div></div><span style={{ color: "#D1D5DB", fontSize: 12 }}>→</span></div>)}</SC>}
      </aside></div></div>;
}

function SDV({ sub, goBack }) { const sc = SC0[sub.status] || SC0["ai-review"]; const fm = getFamily(sub.family);
  return <div><div style={{ padding: "14px 40px", fontSize: 13 }}><span onClick={goBack} style={{ color: "#0EA5E9", cursor: "pointer", fontWeight: 500 }}>← Pipeline</span><span style={{ color: "#9CA3AF" }}> / {sub.name}</span></div>
    <div style={{ padding: "0 40px 48px", maxWidth: 800 }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}><span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "#9CA3AF", background: "#F3F4F6", padding: "3px 10px", borderRadius: 4, border: "1px solid #E5E7EB" }}>{sub.id}</span><span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 12, background: sc.bg, color: sc.color }}>{sc.label}</span><span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 12, background: fm.bg, color: fm.color }}>{fm.name}</span></div><h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{sub.name}</h1><p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, marginBottom: 20 }}>{sub.desc}</p>
      <Crd><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}><CrdT>AI Review</CrdT><span style={{ fontSize: 24, fontWeight: 700, color: sub.aiScore >= 80 ? "#22C55E" : sub.aiScore >= 60 ? "#F59E0B" : "#EF4444" }}>{sub.aiScore}<span style={{ fontSize: 12, fontWeight: 400, color: "#9CA3AF" }}>/100</span></span></div>{sub.aiFindings.map((f, i) => { const fC = f.status === "pass" ? "#22C55E" : f.status === "warn" ? "#F59E0B" : "#EF4444"; const fB = f.status === "pass" ? "#DCFCE7" : f.status === "warn" ? "#FEF3C7" : "#FEE2E2"; return <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < sub.aiFindings.length - 1 ? "1px solid #F3F4F6" : "none" }}><span style={{ width: 18, height: 18, borderRadius: "50%", background: fB, color: fC, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{f.status === "pass" ? "✓" : f.status === "warn" ? "!" : "✕"}</span><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{f.category}</div><div style={{ fontSize: 12, color: "#6B7280", marginTop: 2, lineHeight: 1.5 }}>{f.detail}</div></div></div>; })}</Crd>
      {sub.govReviewer && <Crd><CrdT>Governance</CrdT><div style={{ display: "flex", gap: 12 }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{sub.govReviewer.split(" ").map((w) => w[0]).join("")}</div><div><div style={{ fontSize: 13, fontWeight: 600 }}>{sub.govReviewer}</div><div style={{ fontSize: 12, color: "#6B7280", marginTop: 4, lineHeight: 1.6 }}>{sub.govNotes}</div></div></div></Crd>}</div></div>;
}

function SubmitView({ goBack, setSubs, onDone, onSubmitAsset }) { const [nm, setNm] = useState(""); const [fm, setFm] = useState("relay"); const [ds, setDs] = useState(""); const [done, setDone] = useState(false);
  const doS = async () => {
    if (!nm.trim() || !ds.trim()) return;
    const created = await onSubmitAsset({
      name: nm.trim(),
      family: fm,
      desc: ds.trim(),
      submitter: "Ravi Kumar",
      submitterInit: "RK",
    });
    setSubs((p) => [created, ...p]);
    setDone(true);
  };
  const IS = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#1a1a2e", background: "#fff" };
  if (done) return <div style={{ padding: "80px 40px", textAlign: "center" }}><div style={{ width: 52, height: 52, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 22, color: "#22C55E" }}>✓</div><h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Submitted</h2><p style={{ color: "#6B7280", fontSize: 13, maxWidth: 440, margin: "0 auto 20px", lineHeight: 1.6 }}>AI Review Agent is analyzing your submission. Track in the Pipeline.</p><div style={{ display: "flex", gap: 10, justifyContent: "center" }}><button onClick={onDone} style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: "#0EA5E9", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>View Pipeline</button></div></div>;
  return <div><div style={{ padding: "14px 40px", fontSize: 13 }}><span onClick={goBack} style={{ color: "#0EA5E9", cursor: "pointer", fontWeight: 500 }}>← Pipeline</span></div>
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 40px 48px" }}><h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Submit a New Asset</h1><p style={{ color: "#6B7280", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>Contribute to any platform family. Automated AI review then governance board approval.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}><div><label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Asset Name <span style={{ color: "#EF4444" }}>*</span></label><input value={nm} onChange={(e) => setNm(e.target.value)} placeholder="e.g. Invoice Extraction Pipeline" style={IS} /></div>
        <div><label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Platform Family <span style={{ color: "#EF4444" }}>*</span></label><select value={fm} onChange={(e) => setFm(e.target.value)} style={IS}>{Object.entries(FAMILIES).map(([k, f]) => <option key={k} value={k}>{f.name} — {f.tagline}</option>)}</select></div>
        <div><label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Description <span style={{ color: "#EF4444" }}>*</span></label><textarea value={ds} onChange={(e) => setDs(e.target.value)} placeholder="What does it do? Which signature solution does it support?" rows={4} style={{ ...IS, resize: "vertical" }} /></div>
        <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 20px" }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>AI Review checks:</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>{["Security & sanitization", "Documentation", "Test coverage & evals", "Cloud-native deploy", "Code quality", "Compliance & logging", "Dependency health"].map((it, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#4B5563" }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: "#0EA5E9", flexShrink: 0 }} />{it}</div>)}</div></div>
        <button onClick={doS} disabled={!nm.trim() || !ds.trim()} style={{ padding: "11px 26px", borderRadius: 8, border: "none", background: (!nm.trim() || !ds.trim()) ? "#7DD3FC" : "#0EA5E9", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "inherit", alignSelf: "flex-start", cursor: (!nm.trim() || !ds.trim()) ? "default" : "pointer" }}>Submit for Review</button></div></div></div>;
}

function MediaSection({ a, familyColor }) {
  const [embedFailed, setEmbedFailed] = useState(false);
  const mediaType = a.mediaType || "none";
  const embedUrl = a.mediaUrl || "";
  const streamUrl = a.streamUrl || "";

  if (mediaType === "none" || (!embedUrl && !streamUrl)) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "28px 20px", textAlign: "center", width: 580 }}>
          <div style={{ fontSize: 18, color: "#D1D5DB", marginBottom: 8 }}>▶</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF" }}>Details being gathered</div>
          <div style={{ fontSize: 11, color: "#CBD5E1", marginTop: 4 }}>Video will be available soon</div>
        </div>
      </div>
    );
  }

  if (mediaType === "video" || mediaType === "image") {
    const iframeSrc = embedFailed && streamUrl ? streamUrl : embedUrl;
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: 580, height: 370, borderRadius: 10, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", position: "relative" }}>
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            title="Demo Video"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
            frameBorder="0"
            onError={() => { if (!embedFailed) setEmbedFailed(true); }}
            style={{ width: "100%", height: "calc(100% + 48px)", marginTop: -48, border: "none", display: "block" }}
          />
        </div>
      </div>
    );
  }

  return null;
}

function Chip({ children, active, onClick, color, dot }) { return <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 18, border: `1px solid ${active ? color : "#E5E7EB"}`, background: active ? `${color}10` : "#fff", color: active ? color : "#6B7280", fontSize: 12, fontFamily: "inherit", fontWeight: 500 }}>{dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />}{children}</button>; }
function Dv() { return <div style={{ width: 1, height: 22, background: "#E5E7EB", margin: "0 3px" }} />; }
function Bdg({ color, label }) { return <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 10, background: `${color}12`, color, border: `1px solid ${color}20` }}>{label}</span>; }
function Crd({ children }) { return <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "18px 22px", marginBottom: 14 }}>{children}</div>; }
function CrdT({ children }) { return <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#0EA5E9", flexShrink: 0 }} />{children}</div>; }
function SC({ t, children }) { return <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "14px 16px", minWidth: 0, maxWidth: "100%", overflow: "hidden" }}><div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3AF", fontWeight: 600, marginBottom: 10 }}>{t}</div>{children}</div>; }
function SB({ n, l, c }) { return <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 8px", textAlign: "center", border: "1px solid #F3F4F6" }}><div style={{ fontSize: 17, fontWeight: 700, color: c }}>{n}</div><div style={{ fontSize: 9, color: "#9CA3AF", marginTop: 1, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</div></div>; }
function Btn({ primary, label, disabled, onClick }) { const [h, setH] = useState(false); return <button disabled={disabled} onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ padding: "9px 18px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: disabled ? "default" : "pointer", fontFamily: "inherit", border: primary ? "none" : "1px solid #E5E7EB", background: primary ? (disabled ? "#7DD3FC" : h ? "#0284C7" : "#0EA5E9") : h ? "#F9FAFB" : "#fff", color: primary ? "#fff" : "#4B5563", transform: h && !disabled ? "translateY(-1px)" : "none", opacity: disabled ? 0.6 : 1 }}>{label}</button>; }
function ACard({ a, i, onClick }) { const [h, setH] = useState(false); const fm = getFamily(a.family); return <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ animation: `fadeUp .4s ease ${0.04 * i}s both`, position: "relative", zIndex: 1, background: "#fff", border: `1px solid ${h ? fm.color + "40" : "#E5E7EB"}`, borderRadius: 12, padding: "18px 20px", cursor: "pointer", display: "flex", flexDirection: "column", transition: "all .3s", transform: h ? "translateY(-3px)" : "none", boxShadow: h ? "0 10px 36px rgba(0,0,0,.07)" : "0 1px 3px rgba(0,0,0,.03)", borderTop: `3px solid ${fm.color}` }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 7px", borderRadius: 4 }}>{a.id}</span><span style={{ fontSize: 10, fontWeight: 600, color: fm.color }}>{fm.name}</span></div><div style={{ display: "flex", gap: 3 }}>{a.clouds.map((c) => <span key={c} style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: `${CC[c]}12`, color: CC[c] }}>{CL[c]}</span>)}</div></div><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{a.name}</div><div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, flex: 1 }}>{a.desc}</div><div style={{ fontSize: 11, color: fm.color, fontWeight: 500, marginTop: 8 }}>{a.solution}</div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: "1px solid #F3F4F6" }}><div style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: `${EC[a.effort]}12`, color: EC[a.effort] }}>{a.effort === "low" ? "Low" : a.effort === "medium" ? "Med" : "High"}</span>{a.demoReady && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#22C55E", fontWeight: 500 }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: "#22C55E" }} />Demo</span>}{a.mediaType === "video" && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#8B5CF6", fontWeight: 500 }}>▶ Video</span>}{a.mediaType === "image" && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#0EA5E9", fontWeight: 500 }}>🖼 Image</span>}</div><span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: `${MC[a.maturity]}14`, color: MC[a.maturity] }}>{ML[a.maturity]}</span></div></div>; }
function ARow({ a, i, onClick }) { const [h, setH] = useState(false); const fm = getFamily(a.family); return <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ animation: `fadeUp .4s ease ${0.03 * i}s both`, position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 16, padding: "14px 22px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, cursor: "pointer", transition: "all .2s", transform: h ? "translateX(3px)" : "none", boxShadow: h ? "0 4px 14px rgba(0,0,0,.05)" : "none", borderLeft: `3px solid ${fm.color}` }}><span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#9CA3AF", minWidth: 55 }}>{a.id}</span><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div><div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.desc}</div></div><span style={{ fontSize: 10, fontWeight: 600, color: fm.color, whiteSpace: "nowrap" }}>{fm.name}</span><div style={{ display: "flex", gap: 3 }}>{a.clouds.map((c) => <span key={c} style={{ fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 4, background: `${CC[c]}12`, color: CC[c] }}>{CL[c]}</span>)}</div><span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: `${MC[a.maturity]}14`, color: MC[a.maturity], whiteSpace: "nowrap" }}>{ML[a.maturity]}</span>{a.demoReady && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E", flexShrink: 0 }} />}<span style={{ color: "#D1D5DB", fontSize: 14, transform: h ? "translateX(2px)" : "none", transition: "transform .2s" }}>→</span></div>; }

