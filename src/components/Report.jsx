import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { fmt, fmtShort, buildProjection } from "../utils";
import Benchmarks from "./Benchmarks";

function StatCard({ label, value, sub, highlight, delay }) {
  return (
    <div className={`fade-up fade-up-${delay}`} style={{
      background: highlight ? "var(--brand)" : "var(--white)",
      borderRadius: "var(--radius)", padding: "20px 24px",
      border: highlight ? "none" : "1.5px solid var(--gray-5)",
      boxShadow: highlight ? "0 8px 24px rgba(232,96,28,0.25)" : "var(--shadow)",
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: highlight ? "rgba(255,255,255,0.7)" : "#888", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: highlight ? "var(--white)" : "#111", fontFamily: "'Lora', serif", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: highlight ? "rgba(255,255,255,0.8)" : "#666", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function CarRow({ car, i }) {
  const pct = Math.round((car.monthlyGain / car.netDirect) * 100);
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto auto auto",
      alignItems: "center", gap: 16, padding: "16px 20px",
      borderRadius: "var(--radius-sm)",
      background: i % 2 === 0 ? "var(--gray-7)" : "var(--white)",
      border: "1px solid var(--gray-5)"
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{car.name}</div>
        <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>
          {car.type} · ${car.rate}/day · {car.utilizationScore}% utilization
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 11, color: "#888", letterSpacing: 0.5 }}>TURO NET</div>
        <div style={{ fontWeight: 700, color: "var(--red)", fontFamily: "'DM Mono'" }}>{fmt(car.netOnTuro)}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 11, color: "#888", letterSpacing: 0.5 }}>DIRECT NET</div>
        <div style={{ fontWeight: 700, color: "var(--green)", fontFamily: "'DM Mono'" }}>{fmt(car.netDirect)}</div>
      </div>
      <div style={{
        background: "var(--green-light)", color: "var(--green)",
        padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 800, fontFamily: "'DM Mono'"
      }}>+{pct}%</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--black)", borderRadius: "var(--radius-sm)", padding: "12px 16px", boxShadow: "var(--shadow-lg)" }}>
      <div style={{ color: "var(--gray-4)", fontSize: 12, marginBottom: 8 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono'" }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
      {payload.length === 2 && (
        <div style={{ color: "var(--brand)", fontSize: 13, fontWeight: 800, marginTop: 6, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 6, fontFamily: "'DM Mono'" }}>
          Gap: {fmt(payload[1].value - payload[0].value)}
        </div>
      )}
    </div>
  );
};

export default function Report({ metrics, totals, aiReport, fleetData, onReset }) {
  const projection = buildProjection(totals);

  const handlePDF = async () => {
    const projection = buildProjection(totals);
    const filename = `1Now-Profit-Report-${fleetData.businessName.replace(/\s+/g, "-")}`;

    // Build chart SVGs manually so they render in the print window without Recharts/DOM
    const projMax = Math.max(...projection.map(p => Math.max(p.turo, p.direct))) * 1.15;
    const chartW = 380, chartH = 180, padL = 48, padB = 28, padT = 10, padR = 10;
    const innerW = chartW - padL - padR;
    const innerH = chartH - padB - padT;
    const px = (i) => padL + (i / (projection.length - 1)) * innerW;
    const py = (v) => padT + innerH - (v / projMax) * innerH;
    const turoPath = projection.map((p, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(p.turo).toFixed(1)}`).join(" ");
    const directPath = projection.map((p, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(p.direct).toFixed(1)}`).join(" ");
    const turoFill = turoPath + ` L${px(projection.length-1).toFixed(1)},${(padT+innerH).toFixed(1)} L${padL},${(padT+innerH).toFixed(1)} Z`;
    const directFill = directPath + ` L${px(projection.length-1).toFixed(1)},${(padT+innerH).toFixed(1)} L${padL},${(padT+innerH).toFixed(1)} Z`;
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: projMax * f, y: py(projMax * f) }));

    const gainMax = Math.max(...metrics.map(m => m.monthlyGain)) * 1.2;
    const barsData = metrics.map(c => ({ name: c.name.split(" ").slice(-2).join(" "), gain: Math.round(c.monthlyGain) }));
    const barChartW = 380, barChartH = 180, bPadL = 48, bPadB = 28, bPadT = 10, bPadR = 10;
    const bInnerW = barChartW - bPadL - bPadR;
    const bInnerH = barChartH - bPadB - bPadT;
    const barW = Math.min(40, (bInnerW / barsData.length) * 0.6);
    const bYTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: gainMax * f, y: bPadT + bInnerH - f * bInnerH }));

    const projSVG = `
      <svg viewBox="0 0 ${chartW} ${chartH}" xmlns="http://www.w3.org/2000/svg" width="${chartW}" height="${chartH}">
        <defs>
          <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6b6762" stop-opacity="0.12"/><stop offset="100%" stop-color="#6b6762" stop-opacity="0"/></linearGradient>
          <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8601c" stop-opacity="0.18"/><stop offset="100%" stop-color="#e8601c" stop-opacity="0"/></linearGradient>
        </defs>
        ${yTicks.map(t => `<line x1="${padL}" y1="${t.y.toFixed(1)}" x2="${chartW-padR}" y2="${t.y.toFixed(1)}" stroke="#e8e4e0" stroke-width="1" stroke-dasharray="3 3"/>`).join("")}
        ${yTicks.map(t => `<text x="${(padL-6).toFixed(0)}" y="${(t.y+4).toFixed(1)}" text-anchor="end" font-size="9" fill="#999">$${(t.v/1000).toFixed(0)}k</text>`).join("")}
        ${projection.map((p, i) => i % 2 === 0 ? `<text x="${px(i).toFixed(1)}" y="${chartH}" text-anchor="middle" font-size="9" fill="#999">${p.month}</text>` : "").join("")}
        <path d="${turoFill}" fill="url(#gT)"/>
        <path d="${directFill}" fill="url(#gD)"/>
        <path d="${turoPath}" fill="none" stroke="#9e9890" stroke-width="2"/>
        <path d="${directPath}" fill="none" stroke="#e8601c" stroke-width="2.5"/>
        <circle cx="20" cy="12" r="4" fill="#9e9890"/><text x="28" y="16" font-size="10" fill="#666">Turo</text>
        <circle cx="75" cy="12" r="4" fill="#e8601c"/><text x="83" y="16" font-size="10" fill="#666">Direct</text>
      </svg>`;

    const barSVG = `
      <svg viewBox="0 0 ${barChartW} ${barChartH}" xmlns="http://www.w3.org/2000/svg" width="${barChartW}" height="${barChartH}">
        ${bYTicks.map(t => `<line x1="${bPadL}" y1="${t.y.toFixed(1)}" x2="${barChartW-bPadR}" y2="${t.y.toFixed(1)}" stroke="#e8e4e0" stroke-width="1" stroke-dasharray="3 3"/>`).join("")}
        ${bYTicks.map(t => `<text x="${(bPadL-6)}" y="${(t.y+4).toFixed(1)}" text-anchor="end" font-size="9" fill="#999">$${Math.round(t.v)}</text>`).join("")}
        ${barsData.map((b, i) => {
          const bx = bPadL + (i + 0.5) * (bInnerW / barsData.length);
          const bh = (b.gain / gainMax) * bInnerH;
          const by = bPadT + bInnerH - bh;
          return `<rect x="${(bx - barW/2).toFixed(1)}" y="${by.toFixed(1)}" width="${barW}" height="${bh.toFixed(1)}" fill="#e8601c" rx="3"/>
                  <text x="${bx.toFixed(1)}" y="${(bPadT+bInnerH+14).toFixed(1)}" text-anchor="middle" font-size="8" fill="#999">${b.name}</text>`;
        }).join("")}
      </svg>`;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${filename}</title>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@700;800&family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@500;700&display=swap" rel="stylesheet"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Inter',sans-serif;background:#f8f6f3;color:#111;padding:32px;max-width:860px;margin:0 auto;}
  h1{font-family:'Lora',serif;}
  .mono{font-family:'DM Mono',monospace;}
  @media print{
    @page{margin:12mm 10mm;size:A4;}
    body{padding:0;background:#f8f6f3!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .no-print{display:none!important;}
    section{page-break-inside:avoid;}
  }
  /* Header */
  .hdr{background:#1a1714;border-radius:12px;padding:32px 36px;margin-bottom:18px;position:relative;overflow:hidden;}
  .hdr-circle{position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:rgba(232,96,28,0.15);}
  .hdr-badge{font-size:11px;font-weight:700;color:#e8601c;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;}
  .hdr h1{font-size:24px;font-weight:800;color:#fff;margin-bottom:8px;line-height:1.25;}
  .hdr p{color:#b0a89e;font-size:14px;line-height:1.6;max-width:580px;}
  .tags{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;}
  .tag{background:rgba(255,255,255,0.09);color:#c5bdb7;padding:4px 14px;border-radius:20px;font-size:12px;}
  /* Insight */
  .insight{background:#fff3ed;border:1.5px solid rgba(232,96,28,0.22);border-radius:10px;padding:14px 20px;margin-bottom:18px;display:flex;align-items:center;gap:12px;}
  .insight p{font-size:14px;color:#7a2d08;font-weight:600;line-height:1.5;}
  /* Stat grid */
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px;}
  .stat{background:#fff;border-radius:10px;padding:18px 22px;border:1.5px solid #e8e4e0;}
  .stat.hi{background:#e8601c;border:none;}
  .stat-lbl{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#888;margin-bottom:6px;}
  .stat.hi .stat-lbl{color:rgba(255,255,255,0.7);}
  .stat-val{font-size:28px;font-weight:800;color:#111;font-family:'Lora',serif;line-height:1;}
  .stat.hi .stat-val{color:#fff;}
  .stat-sub{font-size:12px;color:#666;margin-top:4px;}
  .stat.hi .stat-sub{color:rgba(255,255,255,0.8);}
  /* Charts */
  .charts{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}
  .chart-box{background:#fff;border-radius:10px;border:1.5px solid #e8e4e0;padding:20px;}
  .chart-title{font-size:11px;font-weight:700;color:#555;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:2px;}
  .chart-sub{font-size:12px;color:#777;margin-bottom:14px;}
  /* Car rows */
  .cars-box{background:#fff;border-radius:10px;border:1.5px solid #e8e4e0;padding:22px;margin-bottom:18px;}
  .section-title{font-size:11px;font-weight:700;color:#555;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:14px;}
  .car-row{display:grid;grid-template-columns:1fr auto auto auto;align-items:center;gap:14px;padding:14px 18px;border-radius:8px;border:1px solid #e8e4e0;margin-bottom:6px;}
  .car-row.alt{background:#f8f6f3;}
  .car-name{font-weight:700;font-size:14px;}
  .car-meta{font-size:11px;color:#777;margin-top:2px;}
  .col-lbl{font-size:10px;color:#888;letter-spacing:0.5px;margin-bottom:2px;}
  .turo-net{font-weight:700;color:#c0392b;font-family:'DM Mono',monospace;}
  .direct-net{font-weight:700;color:#27ae60;font-family:'DM Mono',monospace;}
  .pct-badge{background:#e8f8ee;color:#27ae60;padding:5px 11px;border-radius:20px;font-size:12px;font-weight:800;font-family:'DM Mono',monospace;white-space:nowrap;}
  /* AI insights */
  .insights-box{padding:14px 18px;background:#f8f6f3;border-radius:8px;margin-top:14px;}
  .insights-lbl{font-size:10px;font-weight:700;color:#e8601c;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;}
  .insight-row{display:flex;gap:8px;margin-bottom:8px;align-items:flex-start;}
  .insight-arrow{color:#e8601c;margin-top:2px;flex-shrink:0;}
  .insight-text{font-size:13px;color:#333;line-height:1.5;}
  /* Recommendation */
  .rec{background:#1a1714;border-radius:12px;padding:26px 30px;margin-bottom:18px;page-break-inside:avoid;break-inside:avoid;}
  .rec-badge{font-size:10px;font-weight:700;color:#e8601c;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;}
  .rec p{color:#fff;font-size:15px;line-height:1.7;margin-bottom:14px;text-align:left;word-spacing:normal;}
  .rec-urgency{border-top:1px solid rgba(255,255,255,0.1);padding-top:14px;color:#e8601c;font-size:13px;font-weight:700;font-style:italic;}
  /* Footer */
  .footer{text-align:center;font-size:11px;color:#bbb;padding-bottom:24px;}
  /* No justified text anywhere */
  body{text-align:left;word-spacing:normal;}
  p,div{word-spacing:normal;}
  section{page-break-inside:avoid;break-inside:avoid;}
  .cars-box{page-break-inside:avoid;break-inside:avoid;}
  .hdr{page-break-inside:avoid;break-inside:avoid;}
</style>
</head>
<body>

<section class="hdr">
  <div class="hdr-circle"></div>
  <div class="hdr-badge">◆ Profit Intelligence Report</div>
  <h1>${aiReport.headline}</h1>
  <p>${aiReport.executiveSummary}</p>
  <div class="tags">
    ${[fleetData.businessName, fleetData.city, `${metrics.length} vehicles`].map(t => `<span class="tag">${t}</span>`).join("")}
  </div>
</section>

<section class="insight">
  <span style="font-size:18px">💡</span>
  <p>${aiReport.topInsight}</p>
</section>

<section class="stats">
  <div class="stat">
    <div class="stat-lbl">Monthly Turo Bleed</div>
    <div class="stat-val">${fmtShort(totals.totalTuroTake)}</div>
    <div class="stat-sub">Fees paid every month</div>
  </div>
  <div class="stat">
    <div class="stat-lbl">Current Net</div>
    <div class="stat-val">${fmtShort(totals.totalNetTuro)}</div>
    <div class="stat-sub">What you keep on Turo</div>
  </div>
  <div class="stat">
    <div class="stat-lbl">Net Going Direct</div>
    <div class="stat-val">${fmtShort(totals.totalNetDirect)}</div>
    <div class="stat-sub">What you'd keep</div>
  </div>
  <div class="stat hi">
    <div class="stat-lbl">Annual Gain</div>
    <div class="stat-val">${fmtShort(totals.totalAnnualGain)}</div>
    <div class="stat-sub">Going direct with 1Now</div>
  </div>
</section>

<section class="charts">
  <div class="chart-box">
    <div class="chart-title">12-Month Projection</div>
    <div class="chart-sub">Turo vs Direct — monthly net</div>
    ${projSVG}
  </div>
  <div class="chart-box">
    <div class="chart-title">Monthly Gain Per Vehicle</div>
    <div class="chart-sub">Extra revenue going direct</div>
    ${barSVG}
  </div>
</section>

<section class="cars-box">
  <div class="section-title">Vehicle-by-Vehicle Breakdown</div>
  ${metrics.map((car, i) => {
    const pct = Math.round((car.monthlyGain / car.netDirect) * 100);
    return `<div class="car-row ${i % 2 === 1 ? "alt" : ""}">
      <div>
        <div class="car-name">${car.name}</div>
        <div class="car-meta">${car.type} · $${car.rate}/day · ${car.utilizationScore}% utilization</div>
      </div>
      <div style="text-align:right">
        <div class="col-lbl">TURO NET</div>
        <div class="turo-net">${fmt(car.netOnTuro)}</div>
      </div>
      <div style="text-align:right">
        <div class="col-lbl">DIRECT NET</div>
        <div class="direct-net">${fmt(car.netDirect)}</div>
      </div>
      <div class="pct-badge">+${pct}%</div>
    </div>`;
  }).join("")}
  ${aiReport.carInsights ? `
  <div class="insights-box">
    <div class="insights-lbl">AI Insights Per Vehicle</div>
    ${aiReport.carInsights.map(ci => `
      <div class="insight-row">
        <span class="insight-arrow">→</span>
        <div class="insight-text"><strong>${ci.name}:</strong> ${ci.insight}</div>
      </div>`).join("")}
  </div>` : ""}
</section>

<section class="rec">
  <div class="rec-badge">◆ Recommendation</div>
  <p>${aiReport.recommendation}</p>
  <div class="rec-urgency">${aiReport.urgencyNote}</div>
</section>

<div class="footer">Built for 1Now · Powered by Gemini AI</div>

</body>
</html>`;

    // Strip the print-bar button from the HTML before rendering
    const cleanHtml = html.replace(/<div class="print-bar no-print">[\s\S]*?<\/div>/, "");

    // Render into a hidden iframe — all colors are hardcoded so html2canvas works perfectly
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:0;left:0;width:860px;height:1px;opacity:0;pointer-events:none;border:none;";
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(cleanHtml);
    iframe.contentDocument.close();

    // Wait for fonts + layout to settle
    await new Promise(r => setTimeout(r, 1200));

    const { default: html2canvas } = await import("html2canvas");
    const { default: jsPDF } = await import("jspdf");

    const body = iframe.contentDocument.body;
    const fullH = body.scrollHeight;
    iframe.style.height = fullH + "px";

    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#f8f6f3",
      scrollX: 0,
      scrollY: 0,
      width: 860,
      height: fullH,
      windowWidth: 860,
      windowHeight: fullH,
    });

    document.body.removeChild(iframe);

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height * pageW) / canvas.width;
    let yPos = 0;
    while (yPos < imgH) {
      if (yPos > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, -yPos, pageW, imgH);
      yPos += pageH;
    }
    pdf.save(`${filename}.pdf`);
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      {/* Action bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onReset}
          style={{ background: "none", border: "none", color: "var(--gray-3)", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: 0 }}>
          ← New Report
        </button>
        <button onClick={handlePDF}
          style={{
            padding: "10px 22px", borderRadius: "var(--radius-sm)",
            background: "var(--black)", color: "var(--white)",
            border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8
          }}>
          ↓ Download PDF
        </button>
      </div>

      <div>
        {/* Header */}
        <div className="fade-up" style={{
          background: "var(--black)", borderRadius: "var(--radius)", padding: "32px 36px",
          marginBottom: 20, position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(232,96,28,0.15)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>◆ Profit Intelligence Report</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--white)", marginBottom: 8, lineHeight: 1.2, fontFamily: "'Lora', serif" }}>
              {aiReport.headline}
            </h1>
            <p style={{ color: "var(--gray-4)", fontSize: 15, lineHeight: 1.6, maxWidth: 600 }}>{aiReport.executiveSummary}</p>
            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[fleetData.businessName, fleetData.city, `${metrics.length} vehicles`].map(tag => (
                <span key={tag} style={{ background: "rgba(255,255,255,0.08)", color: "var(--gray-5)", padding: "5px 14px", borderRadius: 20, fontSize: 13 }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Top insight */}
        <div className="fade-up fade-up-1" style={{
          background: "var(--brand-light)", border: "1.5px solid rgba(232,96,28,0.2)",
          borderRadius: "var(--radius)", padding: "14px 22px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12
        }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <p style={{ fontSize: 15, color: "var(--brand-dark)", fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{aiReport.topInsight}</p>
        </div>

        {/* Key stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          <StatCard label="Monthly Turo Bleed" value={fmtShort(totals.totalTuroTake)} sub="Fees paid every month" delay={1} />
          <StatCard label="Current Net" value={fmtShort(totals.totalNetTuro)} sub="What you keep on Turo" delay={2} />
          <StatCard label="Net Going Direct" value={fmtShort(totals.totalNetDirect)} sub="What you'd keep" delay={3} />
          <StatCard label="Annual Gain" value={fmtShort(totals.totalAnnualGain)} sub="Going direct with 1Now" highlight delay={4} />
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div className="fade-up fade-up-2" style={{
            background: "var(--white)", borderRadius: "var(--radius)",
            border: "1.5px solid var(--gray-5)", padding: "24px", boxShadow: "var(--shadow)"
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#555", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>12-Month Projection</div>
            <div style={{ fontSize: 13, color: "#777", marginBottom: 20 }}>Turo vs Direct — monthly net</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={projection}>
                <defs>
                  <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8601c" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#e8601c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTuro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b6762" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6b6762" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-6)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--gray-4)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--gray-4)" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="turo" name="Turo" stroke="var(--gray-4)" fill="url(#colorTuro)" strokeWidth={2} />
                <Area type="monotone" dataKey="direct" name="Direct" stroke="var(--brand)" fill="url(#colorDirect)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="fade-up fade-up-3" style={{
            background: "var(--white)", borderRadius: "var(--radius)",
            border: "1.5px solid var(--gray-5)", padding: "24px", boxShadow: "var(--shadow)"
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#555", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>Monthly Gain Per Vehicle</div>
            <div style={{ fontSize: 13, color: "#777", marginBottom: 20 }}>Extra revenue going direct</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.map(c => ({ name: c.name.split(" ").slice(-2).join(" "), gain: Math.round(c.monthlyGain) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-6)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--gray-4)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--gray-4)" }} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="gain" name="Monthly Gain" fill="var(--brand)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Benchmarks */}
        <Benchmarks city={fleetData.city} metrics={metrics} totals={totals} />

        {/* Per car breakdown */}
        <div className="fade-up fade-up-3" style={{
          background: "var(--white)", borderRadius: "var(--radius)",
          border: "1.5px solid var(--gray-5)", padding: "24px", marginBottom: 20, boxShadow: "var(--shadow)"
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 16 }}>Vehicle-by-Vehicle Breakdown</div>
          <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
            {metrics.map((car, i) => <CarRow key={car.id} car={car} i={i} />)}
          </div>
          {aiReport.carInsights && (
            <div style={{ padding: "16px 20px", background: "var(--gray-7)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>AI Insights Per Vehicle</div>
              {aiReport.carInsights.map((ci, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--brand)", marginTop: 2, flexShrink: 0 }}>→</span>
                  <div style={{ fontSize: 14, color: "#333", lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700 }}>{ci.name}: </span>{ci.insight}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendation */}
        <div className="fade-up fade-up-4" style={{
          background: "var(--black)", borderRadius: "var(--radius)", padding: "28px 32px",
          marginBottom: 20, boxShadow: "var(--shadow-lg)"
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>◆ Recommendation</div>
          <p style={{ color: "var(--white)", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>{aiReport.recommendation}</p>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, color: "var(--brand)", fontSize: 14, fontWeight: 700, fontStyle: "italic" }}>
            {aiReport.urgencyNote}
          </div>
        </div>

        {/* CTA */}
        <div className="fade-up fade-up-5" style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
          <button onClick={handlePDF}
            style={{
              padding: "14px 28px", borderRadius: "var(--radius)",
              background: "var(--black)", color: "var(--white)",
              border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer"
            }}>
            ↓ Download PDF Report
          </button>
          <a href="https://1now.ai" target="_blank" rel="noreferrer"
            style={{
              padding: "14px 32px", borderRadius: "var(--radius)",
              background: "var(--brand)", color: "var(--white)",
              fontSize: 14, fontWeight: 800, cursor: "pointer", textDecoration: "none"
            }}>
            Go Direct with 1Now →
          </a>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "var(--gray-5)", paddingBottom: 32 }}>
          Built for 1Now · Powered by Gemini AI
        </div>
      </div>
    </div>
  );
}