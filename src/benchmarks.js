// Market benchmarks by city — avg daily rates for direct bookings
// Sources based on 1Now customer data and industry averages
export const CITY_BENCHMARKS = {
  "atlanta": { avgADR: 88, topADR: 124, market: "Atlanta, GA", demandScore: 78 },
  "miami": { avgADR: 112, topADR: 165, market: "Miami, FL", demandScore: 92 },
  "orlando": { avgADR: 95, topADR: 140, market: "Orlando, FL", demandScore: 88 },
  "los angeles": { avgADR: 118, topADR: 180, market: "Los Angeles, CA", demandScore: 85 },
  "new york": { avgADR: 130, topADR: 195, market: "New York, NY", demandScore: 90 },
  "houston": { avgADR: 82, topADR: 115, market: "Houston, TX", demandScore: 72 },
  "dallas": { avgADR: 85, topADR: 120, market: "Dallas, TX", demandScore: 75 },
  "phoenix": { avgADR: 78, topADR: 110, market: "Phoenix, AZ", demandScore: 70 },
  "las vegas": { avgADR: 105, topADR: 155, market: "Las Vegas, NV", demandScore: 87 },
  "chicago": { avgADR: 98, topADR: 145, market: "Chicago, IL", demandScore: 80 },
  "san francisco": { avgADR: 125, topADR: 185, market: "San Francisco, CA", demandScore: 83 },
  "seattle": { avgADR: 108, topADR: 158, market: "Seattle, WA", demandScore: 79 },
  "denver": { avgADR: 92, topADR: 130, market: "Denver, CO", demandScore: 76 },
  "nashville": { avgADR: 96, topADR: 138, market: "Nashville, TN", demandScore: 82 },
  "tampa": { avgADR: 88, topADR: 125, market: "Tampa, FL", demandScore: 77 },
  "charlotte": { avgADR: 80, topADR: 112, market: "Charlotte, NC", demandScore: 71 },
  "austin": { avgADR: 94, topADR: 135, market: "Austin, TX", demandScore: 81 },
};

export function getBenchmark(city) {
  if (!city) return null;
  const key = city.toLowerCase().split(",")[0].trim();
  for (const [k, v] of Object.entries(CITY_BENCHMARKS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  // Default fallback
  return { avgADR: 88, topADR: 128, market: city, demandScore: 74 };
}
