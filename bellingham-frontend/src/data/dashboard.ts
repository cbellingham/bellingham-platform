export const userPortfolio = {
    totalValue: 1285000,
    dayChange: 0.013,
    investedCapital: 1024000,
    availableCash: 261000,
    allocations: [
        { segment: "Grid Reliability", weight: 0.36, value: 463000, returnRate: 0.094 },
        { segment: "Renewables", weight: 0.28, value: 359000, returnRate: 0.072 },
        { segment: "Demand Response", weight: 0.19, value: 244000, returnRate: 0.081 },
        { segment: "Carbon Markets", weight: 0.17, value: 219000, returnRate: 0.065 },
    ],
};

export const marketStats = {
    totalMarketValue: 18750000,
    dailyVolume: 2380000,
    openInterest: 8250000,
    averageYield: 0.082,
    sentimentScore: 0.67,
    biggestMover: {
        name: "Renewables Curtailment Ledger",
        change: 0.041,
    },
};

export const priceHistory = [
    { date: "2025-01-27", price: 108.2 },
    { date: "2025-01-30", price: 111.4 },
    { date: "2025-02-03", price: 114.1 },
    { date: "2025-02-06", price: 116.9 },
    { date: "2025-02-10", price: 119.5 },
    { date: "2025-02-12", price: 121.1 },
];

export const volumeData = [
    { label: "Mon", value: 420000 },
    { label: "Tue", value: 505000 },
    { label: "Wed", value: 612000 },
    { label: "Thu", value: 498000 },
    { label: "Fri", value: 550000 },
];

export const aiRecommendations = [
    {
        title: "Increase Pacific Northwest exposure",
        summary:
            "Grid reliability feeds are trending up with low counter-party risk. Add exposure before the next NOAA storm cycle.",
        expectedImpact: 0.048,
        confidence: 0.86,
        action: "Allocate $150k toward NorthGrid outage forecasts at current ask.",
    },
    {
        title: "Rotate out of carbon heavy issuers",
        summary:
            "Curtailment ledgers show tightening margins for older assets. Reduce position size to lock recent gains.",
        expectedImpact: 0.031,
        confidence: 0.74,
        action: "Trim Flux Carbon holdings by 15% over the next two sessions.",
    },
    {
        title: "Capture DR benchmark momentum",
        summary:
            "Demand response performance benchmarks are outperforming baseline expectations across PJM and NYISO.",
        expectedImpact: 0.055,
        confidence: 0.69,
        action: "Increase Gridwise benchmark allocation with a $95k laddered entry.",
    },
];
