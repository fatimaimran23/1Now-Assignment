export function calcMetrics(fleet, turoFee, tripsPerMonth) {
  const feeDecimal = turoFee / 100;

  return fleet.map(car => {
    const grossMonthly = car.rate * tripsPerMonth * car.avgTripDays;
    const turoTake = grossMonthly * feeDecimal;
    const netOnTuro = grossMonthly - turoTake;
    const netDirect = grossMonthly; // keep 100%
    const monthlyGain = netDirect - netOnTuro;
    const annualGain = monthlyGain * 12;
    const utilizationScore = Math.min(100, Math.round((tripsPerMonth * car.avgTripDays / 30) * 100));

    return {
      ...car,
      grossMonthly,
      turoTake,
      netOnTuro,
      netDirect,
      monthlyGain,
      annualGain,
      utilizationScore,
    };
  });
}

export function calcTotals(metrics) {
  return {
    totalGross: metrics.reduce((a, c) => a + c.grossMonthly, 0),
    totalTuroTake: metrics.reduce((a, c) => a + c.turoTake, 0),
    totalNetTuro: metrics.reduce((a, c) => a + c.netOnTuro, 0),
    totalNetDirect: metrics.reduce((a, c) => a + c.netDirect, 0),
    totalMonthlyGain: metrics.reduce((a, c) => a + c.monthlyGain, 0),
    totalAnnualGain: metrics.reduce((a, c) => a + c.annualGain, 0),
  };
}

export function buildProjection(totals, months = 12) {
  return Array.from({ length: months }, (_, i) => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    turo: Math.round(totals.totalNetTuro),
    direct: Math.round(totals.totalNetDirect),
    gap: Math.round(totals.totalMonthlyGain),
  }));
}

export const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
export const fmtShort = (n) => n >= 1000 ? `$${(n/1000).toFixed(1)}k` : `$${Math.round(n)}`;
