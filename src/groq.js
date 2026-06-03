import { GROQ_API_KEY } from "./config";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

async function callGroq(prompt) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Groq API error");
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return text.replace(/```json|```/g, "").trim();
}

export async function parseTuroListing(rawText) {
  const prompt = `You are parsing a Turo car listing page. Extract all vehicles listed.

RAW TEXT FROM TURO PAGE:
${rawText.slice(0, 6000)}

Return ONLY valid JSON, no markdown:
{
  "businessName": "host name if found, else empty string",
  "city": "city if found, else empty string",
  "cars": [
    {
      "name": "Year Make Model",
      "type": "Sedan|SUV|Luxury|Truck|Van|Electric|Convertible|Minivan",
      "rate": daily_rate_as_number,
      "avgTripDays": 3
    }
  ]
}

If you can't find rate, estimate based on car type (sedan ~65, SUV ~85, luxury ~120, electric ~95).
Only include cars you're confident about.`;

  const json = await callGroq(prompt);
  return JSON.parse(json);
}

export async function generateReport(fleetData, totals, metrics) {
  const prompt = `You are a fleet business analyst. Write a sharp, personalized profit intelligence report for a car rental operator.

FLEET DATA:
- Business name: ${fleetData.businessName || "This fleet"}
- Location: ${fleetData.city || "their market"}
- Total vehicles: ${metrics.length}
- Cars: ${metrics.map(c => c.name).join(', ')}
- Monthly trips per car: ${fleetData.tripsPerMonth}
- Turo fee they're paying: ${fleetData.turoFee}%

FINANCIAL REALITY:
- Total gross revenue/month: $${Math.round(totals.totalGross).toLocaleString()}
- What Turo takes/month: $${Math.round(totals.totalTuroTake).toLocaleString()}
- What they keep on Turo/month: $${Math.round(totals.totalNetTuro).toLocaleString()}
- What they'd keep going direct/month: $${Math.round(totals.totalNetDirect).toLocaleString()}
- Monthly gain going direct: $${Math.round(totals.totalMonthlyGain).toLocaleString()}
- Annual gain going direct: $${Math.round(totals.totalAnnualGain).toLocaleString()}

PER CAR BREAKDOWN:
${metrics.map(c => `- ${c.name} (${c.type}): $${Math.round(c.turoTake).toLocaleString()}/mo lost to Turo, $${Math.round(c.monthlyGain).toLocaleString()}/mo gain going direct`).join('\n')}

Return ONLY valid JSON, no markdown:
{
  "headline": "one punchy sentence summarizing their situation (mention actual dollar amount)",
  "executiveSummary": "2-3 sentences. Be direct. Mention their city, fleet size, and the exact annual number they're losing.",
  "topInsight": "The single most important thing they should know. One sentence, sharp.",
  "carInsights": [
    { "name": "car name", "insight": "1 sentence specific insight about this car" }
  ],
  "recommendation": "3-4 sentences on exactly what they should do. Reference 1Now specifically. Be concrete.",
  "urgencyNote": "One punchy closing line about why waiting costs them money. Mention a specific dollar figure."
}`;

  const json = await callGroq(prompt);
  return JSON.parse(json);
}
