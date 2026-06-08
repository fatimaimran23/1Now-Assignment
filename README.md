# 1Now Profit Intelligence Report

## The Problem
Independent Turo operators have no clear picture of how much marketplace fees are bleeding them. They know Turo takes 25–35%, but they've never seen it laid out per car, per month, projected over a year — alongside what they'd make going direct.

## What This Does
Operators enter their fleet details (or paste their Turo listing text for AI auto-fill). The app:
1. Calculates exact monthly/annual Turo fee bleed per vehicle
2. Projects 12-month revenue: Turo vs going direct
3. Benchmarks their rates against their city's market averages
4. Uses Groq AI to write a personalized insight report with per-vehicle analysis
5. Exports the full report as a downloadable PDF

## Why It Matters for 1Now
This is a **sales weapon**. 1Now's pitch is "go direct, make more money." This report makes that case in real numbers, personalized to each operator's actual fleet. A 1Now salesperson could use this on every cold call or send it to cold leads to get them on a call.

## Stack
- React 18 + Vite
- Recharts (area chart, bar chart, radar chart)
- jsPDF + html2canvas (PDF export)
- Groq API (free at aistudio.google.com)

## Setup
1. Get a free Gemini API key at `aistudio.google.com`
2. Paste it in `src/config.js`
3. Run:
```bash
npm install
npm run dev
```
Open http://localhost:5173

## What I'd Do Next
- Pre-fill from Turo URL via a lightweight proxy/scraper
- Save reports so operators can track improvement over time
- White-label it for 1Now's sales team to send branded reports to leads
- Add seasonal demand data per city
- Connect to 1Now's actual booking data for real utilization scores
