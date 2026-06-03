import { getBenchmark } from "../benchmarks";
import { fmt } from "../utils";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

export default function Benchmarks({ city, metrics, totals }) {
  const bench = getBenchmark(city);
  if (!bench) return null;

  const avgRate = metrics.reduce((a, c) => a + c.rate, 0) / metrics.length;
  const vsAvg = Math.round(((avgRate - bench.avgADR) / bench.avgADR) * 100);
  const vsTop = Math.round(((avgRate - bench.topADR) / bench.topADR) * 100);

  const radarData = [
    { subject: "Daily Rate", operator: Math.min(100, Math.round((avgRate / bench.topADR) * 100)), market: Math.round((bench.avgADR / bench.topADR) * 100) },
    { subject: "Utilization", operator: Math.min(100, metrics[0]?.utilizationScore || 70), market: 65 },
    { subject: "Fleet Size", operator: Math.min(100, metrics.length * 10), market: 40 },
    { subject: "Revenue/Car", operator: Math.min(100, Math.round((totals.totalNetDirect / metrics.length / 2000) * 100)), market: 55 },
    { subject: "Demand Score", operator: bench.demandScore, market: 60 },
  ];

  return (
    <div className="fade-up fade-up-3" style={{
      background: "var(--white)", borderRadius: "var(--radius)",
      border: "1.5px solid var(--gray-5)", padding: "24px 28px",
      marginBottom: 24, boxShadow: "var(--shadow)"
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#555", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>
        Market Benchmarks
      </div>
      <div style={{ fontSize: 13, color: "#777", marginBottom: 24 }}>
        How your fleet compares to {bench.market} operators
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }}>
        {/* Stats */}
        <div>
          <div style={{ display: "grid", gap: 16 }}>
            {[
              {
                label: "Your Avg Daily Rate",
                value: fmt(avgRate),
                sub: `${bench.market} avg: ${fmt(bench.avgADR)}`,
                delta: vsAvg,
              },
              {
                label: "Top Operator Rate",
                value: fmt(bench.topADR),
                sub: "What the best operators charge",
                delta: null,
              },
              {
                label: "Market Demand Score",
                value: `${bench.demandScore}/100`,
                sub: "Rental demand index for your city",
                delta: null,
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "14px 16px", borderRadius: "var(--radius-sm)",
                background: "var(--gray-7)", border: "1px solid var(--gray-5)"
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#111", fontFamily: "'Lora', serif" }}>{item.value}</span>
                  {item.delta !== null && (
                    <span style={{
                      fontSize: 13, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: item.delta >= 0 ? "var(--green-light)" : "var(--red-light)",
                      color: item.delta >= 0 ? "var(--green)" : "var(--red)"
                    }}>
                      {item.delta >= 0 ? "+" : ""}{item.delta}%
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#777", marginTop: 3 }}>{item.sub}</div>
              </div>
            ))}

            {vsTop < 0 && (
              <div style={{
                padding: "12px 16px", borderRadius: "var(--radius-sm)",
                background: "rgba(232,96,28,0.06)", border: "1px solid rgba(232,96,28,0.2)"
              }}>
                <span style={{ fontSize: 13, color: "var(--brand)", fontWeight: 600, lineHeight: 1.5 }}>
                  💡 Top {bench.market} operators charge {fmt(bench.topADR - avgRate)}/day more than you. Going direct unlocks pricing flexibility Turo's algorithm limits.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Radar chart */}
        <div>
          <div style={{ fontSize: 12, color: "#777", textAlign: "center", marginBottom: 8 }}>
            Your fleet vs market average
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--gray-5)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#555" }} />
              <Radar name="You" dataKey="operator" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Market Avg" dataKey="market" stroke="var(--gray-4)" fill="var(--gray-4)" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
              <Tooltip formatter={(v) => `${v}/100`} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
            {[{ color: "var(--brand)", label: "Your Fleet" }, { color: "var(--gray-4)", label: "Market Avg" }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555" }}>
                <div style={{ width: 12, height: 2, background: l.color, borderRadius: 2 }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}