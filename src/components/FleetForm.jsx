import { useState } from "react";
import { parseTuroListing } from "../groq";

const CAR_TYPES = ["Sedan", "SUV", "Luxury", "Truck", "Van", "Electric", "Convertible", "Minivan"];
const defaultCar = () => ({ id: Date.now() + Math.random(), name: "", type: "Sedan", rate: "", avgTripDays: 3 });

const inputStyle = {
  width: "100%", padding: "14px 18px", borderRadius: "var(--radius)",
  border: "1.5px solid var(--border)", background: "var(--surface-2)",
  fontSize: 15, fontFamily: "'Syne', sans-serif", color: "var(--text-primary)",
  outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", boxSizing: "border-box"
};
const labelStyle = {
  fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
  letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8, display: "block"
};

export default function FleetForm({ onSubmit, loading }) {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [turoFee, setTuroFee] = useState(25);
  const [tripsPerMonth, setTripsPerMonth] = useState(8);
  const [fleet, setFleet] = useState([defaultCar()]);

  const [showTuroPaste, setShowTuroPaste] = useState(false);
  const [turoText, setTuroText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  const addCar = () => setFleet(f => [...f, defaultCar()]);
  const removeCar = (id) => setFleet(f => f.filter(c => c.id !== id));
  const updateCar = (id, field, value) => setFleet(f => f.map(c => c.id === id ? { ...c, [field]: value } : c));

  const canProceed1 = businessName.trim() && city.trim();
  const canSubmit = fleet.every(c => c.name.trim() && c.rate > 0) && fleet.length > 0;

  const handleParseTuro = async () => {
    if (!turoText.trim()) return;
    setParsing(true); setParseError("");
    try {
      const parsed = await parseTuroListing(turoText);
      if (parsed.cars && parsed.cars.length > 0) {
        setFleet(parsed.cars.map(c => ({ ...c, id: Date.now() + Math.random() })));
        if (parsed.businessName) setBusinessName(parsed.businessName);
        if (parsed.city) setCity(parsed.city);
        setShowTuroPaste(false); setTuroText("");
      } else {
        setParseError("Couldn't find any cars in that text. Try selecting more of the page.");
      }
    } catch (e) {
      setParseError("Parsing failed. Try again or add cars manually.");
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = () => {
    onSubmit(
      { businessName, city, turoFee, tripsPerMonth },
      fleet.map(c => ({ ...c, rate: parseFloat(c.rate), avgTripDays: parseFloat(c.avgTripDays) }))
    );
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = "var(--brand)";
    e.target.style.boxShadow = "var(--shadow-brand)";
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: "flex", gap: 0, marginBottom: 48, alignItems: "center", justifyContent: "center" }}>
        {[{ n: 1, label: "Business Info" }, { n: 2, label: "Your Fleet" }].map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: s.n < step ? "pointer" : "default" }}
              onClick={() => s.n < step && setStep(s.n)}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: step >= s.n ? "var(--brand)" : "var(--surface-2)",
                border: step >= s.n ? "none" : "1.5px solid var(--border)",
                color: step >= s.n ? "var(--white)" : "var(--text-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, transition: "all 0.2s",
                boxShadow: step === s.n ? "0 0 20px rgba(232,96,28,0.35)" : "none"
              }}>{s.n}</div>
              <span style={{
                fontSize: 14, fontWeight: step === s.n ? 700 : 400,
                color: step === s.n ? "var(--white)" : "var(--text-muted)"
              }}>{s.label}</span>
            </div>
            {i < 1 && (
              <div style={{
                width: 80, height: 1,
                background: step > s.n ? "var(--brand)" : "var(--border)",
                margin: "0 20px", transition: "background 0.3s"
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="fade-up">
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", overflow: "hidden"
          }}>
            {/* Card header */}
            <div style={{
              padding: "28px 36px", borderBottom: "1px solid var(--border)",
              background: "linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)"
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--white)", marginBottom: 4 }}>Business Info</h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Tell us about your rental operation</p>
            </div>

            <div style={{ padding: "36px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
                <div>
                  <label style={labelStyle}>Business Name</label>
                  <input placeholder="Empire City Rides" value={businessName}
                    onChange={e => setBusinessName(e.target.value)} style={inputStyle}
                    onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                  <label style={labelStyle}>City / Market</label>
                  <input placeholder="Atlanta, GA" value={city}
                    onChange={e => setCity(e.target.value)} style={inputStyle}
                    onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 36 }}>
                <div>
                  <label style={labelStyle}>Turo Fee You Pay (%)</label>
                  <div style={{ position: "relative" }}>
                    <input type="number" min={15} max={40} value={turoFee}
                      onChange={e => setTuroFee(parseFloat(e.target.value))}
                      style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                    <span style={{
                      position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                      fontSize: 14, color: "var(--brand)", fontWeight: 700, fontFamily: "'DM Mono', monospace",
                      pointerEvents: "none"
                    }}>{turoFee}%</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Turo charges 25–35% typically</p>
                </div>
                <div>
                  <label style={labelStyle}>Avg Trips Per Car / Month</label>
                  <input type="number" min={1} max={30} value={tripsPerMonth}
                    onChange={e => setTripsPerMonth(parseFloat(e.target.value))}
                    style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>National average is 6–10 trips/month</p>
                </div>
              </div>

              <button onClick={() => setStep(2)} disabled={!canProceed1} style={{
                width: "100%", padding: "18px 24px", borderRadius: "var(--radius)",
                background: canProceed1 ? "var(--brand)" : "var(--surface-3)",
                color: canProceed1 ? "var(--white)" : "var(--text-muted)",
                border: "none", fontSize: 16, fontWeight: 800,
                cursor: canProceed1 ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                boxShadow: canProceed1 ? "0 4px 20px rgba(232,96,28,0.3)" : "none",
                letterSpacing: 0.3
              }}>
                Next: Add Your Fleet →
              </button>
            </div>
          </div>

          {/* Info strip */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 24
          }}>
            {[
              { label: "Average fee saved", value: "28%", sub: "by going direct" },
              { label: "Extra monthly revenue", value: "$800+", sub: "per car, avg operator" },
              { label: "Report time", value: "~10s", sub: "AI-powered analysis" },
            ].map((stat, i) => (
              <div key={i} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--radius)", padding: "20px 24px", textAlign: "center"
              }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--brand)", fontFamily: "'Lora', serif" }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, fontWeight: 600 }}>{stat.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="fade-up">
          {/* Import from Turo */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--brand-border)",
            borderRadius: "var(--radius-lg)", padding: "24px 28px", marginBottom: 20,
            position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: "linear-gradient(90deg, var(--brand), transparent)"
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--brand)", marginBottom: 4 }}>
                  Import from Turo
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Paste your Turo listing text — AI fills your fleet automatically
                </div>
              </div>
              <button onClick={() => setShowTuroPaste(!showTuroPaste)} style={{
                padding: "10px 20px", borderRadius: "var(--radius-sm)",
                background: showTuroPaste ? "var(--surface-3)" : "var(--brand)",
                color: "var(--white)", border: showTuroPaste ? "1px solid var(--border)" : "none",
                fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                boxShadow: !showTuroPaste ? "0 2px 12px rgba(232,96,28,0.3)" : "none"
              }}>
                {showTuroPaste ? "Cancel" : "Use This →"}
              </button>
            </div>
            {showTuroPaste && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.7 }}>
                  1. Go to your Turo profile page · 2. Select all text (Ctrl+A) · 3. Copy & paste below
                </div>
                <textarea placeholder="Paste your Turo listing page text here..."
                  value={turoText} onChange={e => setTuroText(e.target.value)} rows={5}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 1.6 }}
                  onFocus={focusStyle} onBlur={blurStyle} />
                {parseError && (
                  <div style={{ fontSize: 13, color: "var(--red)", marginTop: 8 }}>{parseError}</div>
                )}
                <button onClick={handleParseTuro} disabled={!turoText.trim() || parsing} style={{
                  marginTop: 12, padding: "12px 22px", borderRadius: "var(--radius-sm)",
                  background: turoText.trim() && !parsing ? "var(--brand)" : "var(--surface-3)",
                  color: "var(--white)", border: "none", fontSize: 14,
                  fontWeight: 700, cursor: turoText.trim() && !parsing ? "pointer" : "not-allowed"
                }}>
                  {parsing ? "Parsing with AI..." : "Parse & Fill Fleet →"}
                </button>
              </div>
            )}
          </div>

          {/* Fleet cards */}
          <div style={{ display: "grid", gap: 14, marginBottom: 16 }}>
            {fleet.map((car, i) => (
              <div key={car.id} className="fade-up" style={{
                background: "var(--surface)", borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)", overflow: "hidden"
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 24px", borderBottom: "1px solid var(--border)",
                  background: "var(--surface-2)"
                }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--brand)", letterSpacing: 1.5 }}>
                    CAR {i + 1}
                  </span>
                  {fleet.length > 1 && (
                    <button onClick={() => removeCar(car.id)} style={{
                      background: "none", border: "none", color: "var(--text-muted)",
                      cursor: "pointer", fontSize: 22, lineHeight: 1, padding: 0,
                      transition: "color 0.15s"
                    }} onMouseEnter={e => e.target.style.color = "var(--red)"}
                      onMouseLeave={e => e.target.style.color = "var(--text-muted)"}>×</button>
                  )}
                </div>
                <div style={{ padding: "22px 24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Car Name</label>
                      <input placeholder="2023 Tesla Model 3" value={car.name}
                        onChange={e => updateCar(car.id, "name", e.target.value)} style={inputStyle}
                        onFocus={focusStyle} onBlur={blurStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Type</label>
                      <select value={car.type} onChange={e => updateCar(car.id, "type", e.target.value)}
                        style={{ ...inputStyle, cursor: "pointer" }}>
                        {CAR_TYPES.map(t => <option key={t} style={{ background: "#1a1a1a" }}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Daily Rate ($)</label>
                      <input type="number" placeholder="85" value={car.rate}
                        onChange={e => updateCar(car.id, "rate", e.target.value)} style={inputStyle}
                        onFocus={focusStyle} onBlur={blurStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Avg Trip Days</label>
                      <input type="number" min={1} max={30} value={car.avgTripDays}
                        onChange={e => updateCar(car.id, "avgTripDays", e.target.value)} style={inputStyle}
                        onFocus={focusStyle} onBlur={blurStyle} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={addCar} style={{
            width: "100%", padding: 15, borderRadius: "var(--radius)",
            background: "transparent", color: "var(--brand)",
            border: "1.5px dashed var(--brand-border)", fontSize: 14,
            fontWeight: 700, cursor: "pointer", marginBottom: 20,
            transition: "all 0.2s"
          }}
            onMouseEnter={e => { e.target.style.borderColor = "var(--brand)"; e.target.style.background = "var(--brand-light)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "var(--brand-border)"; e.target.style.background = "transparent"; }}>
            + Add Another Car
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
            <button onClick={() => setStep(1)} style={{
              padding: "18px 24px", borderRadius: "var(--radius)",
              background: "var(--surface-2)", color: "var(--text-secondary)",
              border: "1px solid var(--border)", fontSize: 14,
              fontWeight: 700, cursor: "pointer"
            }}>← Back</button>
            <button onClick={handleSubmit} disabled={!canSubmit || loading} style={{
              padding: "18px 24px", borderRadius: "var(--radius)",
              background: canSubmit && !loading ? "var(--brand)" : "var(--surface-3)",
              color: canSubmit && !loading ? "var(--white)" : "var(--text-muted)",
              border: "none", fontSize: 16, fontWeight: 800,
              cursor: canSubmit && !loading ? "pointer" : "not-allowed",
              boxShadow: canSubmit && !loading ? "0 4px 20px rgba(232,96,28,0.3)" : "none",
              transition: "all 0.2s"
            }}>
              {loading ? "Generating..." : "Generate My Report →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
