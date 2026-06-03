import { useState } from "react";
import FleetForm from "./components/FleetForm";
import Report from "./components/Report";
import { calcMetrics, calcTotals } from "./utils";
import { generateReport } from "./groq";

export default function App() {
  const [state, setState] = useState("form");
  const [metrics, setMetrics] = useState(null);
  const [totals, setTotals] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [fleetData, setFleetData] = useState(null);
  const [error, setError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");

  const handleSubmit = async (formData, fleet) => {
    setState("loading");
    setError("");
    const msgs = [
      "Analyzing your fleet economics...",
      "Calculating Turo fee impact...",
      "Projecting direct booking potential...",
      "Writing your personalized report...",
    ];
    let idx = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % msgs.length;
      setLoadingMsg(msgs[idx]);
    }, 1800);
    try {
      const m = calcMetrics(fleet, formData.turoFee, formData.tripsPerMonth);
      const t = calcTotals(m);
      const ai = await generateReport(formData, t, m);
      setMetrics(m); setTotals(t); setAiReport(ai); setFleetData(formData);
      setState("report");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setState("error");
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      {/* Nav */}
      <nav style={{
        background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 40px", height: 64, display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, background: "var(--brand)", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, boxShadow: "0 0 16px rgba(232,96,28,0.4)"
          }}>🚀</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 18, color: "var(--white)" }}>1Now</span>
            <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 8 }}>Profit Intelligence</span>
          </div>
        </div>
        <a href="https://1now.ai" target="_blank" rel="noreferrer"
          style={{ fontSize: 13, color: "var(--brand)", fontWeight: 700, textDecoration: "none", letterSpacing: 0.3 }}>
          1now.ai →
        </a>
      </nav>

      {state === "form" && (
        <div>
          {/* Hero section */}
          <div style={{
            position: "relative", overflow: "hidden",
            background: "linear-gradient(160deg, #0f0f0f 0%, #1a0f08 50%, #0f0f0f 100%)",
            padding: "100px 40px 80px",
            borderBottom: "1px solid var(--border)",
          }}>
            {/* Background glow */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600, height: 300,
              background: "radial-gradient(ellipse, rgba(232,96,28,0.12) 0%, transparent 70%)",
              pointerEvents: "none"
            }} />
            <div className="fade-up" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto", position: "relative" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--brand-light)", border: "1px solid var(--brand-border)",
                color: "var(--brand)", fontSize: 11, fontWeight: 700,
                letterSpacing: 2, textTransform: "uppercase",
                padding: "7px 18px", borderRadius: 20, marginBottom: 28
              }}>Free Tool for Turo Operators</div>
              <h1 style={{
                fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
                color: "var(--white)", lineHeight: 1.1, marginBottom: 24,
                fontFamily: "'Lora', serif"
              }}>
                How much is Turo<br /><em style={{ color: "var(--brand)" }}>actually</em> costing you?
              </h1>
              <p className="fade-up fade-up-1" style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 0" }}>
                Enter your fleet details. Get a personalized AI report showing exactly what you're losing in fees — and what you'd make going direct.
              </p>
            </div>
          </div>

          {/* Form section */}
          <div style={{ padding: "64px 40px 80px", maxWidth: 900, margin: "0 auto" }}>
            <FleetForm onSubmit={handleSubmit} loading={false} />
          </div>
        </div>
      )}

      {state === "loading" && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "70vh", gap: 28, padding: "40px 24px"
        }}>
          <div style={{
            width: 64, height: 64, border: "3px solid var(--surface-3)",
            borderTop: "3px solid var(--brand)", borderRadius: "50%",
            animation: "spin 0.9s linear infinite",
            boxShadow: "0 0 24px rgba(232,96,28,0.2)"
          }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--white)", marginBottom: 10, fontFamily: "'Lora', serif" }}>
              {loadingMsg}
            </div>
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>This takes about 10 seconds</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%", background: "var(--brand)",
                animation: "pulse 1.2s ease infinite", animationDelay: `${i * 0.2}s`
              }} />
            ))}
          </div>
        </div>
      )}

      {state === "error" && (
        <div style={{ maxWidth: 480, margin: "100px auto", textAlign: "center", padding: "0 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: "var(--white)" }}>Something went wrong</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.6 }}>{error}</p>
          <button onClick={() => setState("form")} style={{
            padding: "14px 36px", borderRadius: "var(--radius)",
            background: "var(--brand)", color: "var(--white)",
            border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer"
          }}>Try Again</button>
        </div>
      )}

      {state === "report" && metrics && totals && aiReport && (
        <Report metrics={metrics} totals={totals} aiReport={aiReport} fleetData={fleetData} onReset={() => setState("form")} />
      )}
    </div>
  );
}
