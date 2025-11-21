// src/components/Dashboard.jsx

import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import ContractDetailsPanel from "./ContractDetailsPanel";
import Layout from "./Layout";
import api from "../utils/api";
import { AuthContext } from "../context";
import useMarketStream from "../hooks/useMarketStream";
import { mockContractsSnapshot } from "../data/mock-contracts";
import Button from "./ui/Button";

const parseNumeric = (value) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
};

const normalizeContracts = (contracts = []) =>
    [...contracts]
        .map((contract) => {
            const numericPrice = parseNumeric(contract?.price);
            return {
                ...contract,
                numericPrice,
            };
        })
        .sort((a, b) => {
            const left = a.numericPrice;
            const right = b.numericPrice;
            if (left === null && right === null) return 0;
            if (left === null) return 1;
            if (right === null) return -1;
            return left - right;
        });

const formatCurrencyValue = (value, { maximumFractionDigits = 0 } = {}) => {
    const numeric = parseNumeric(value);
    if (numeric === null) {
        return "—";
    }
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits,
    }).format(numeric);
};

const formatPercentValue = (value, { maximumFractionDigits = 1 } = {}) => {
    const numeric = parseNumeric(value);
    if (numeric === null) {
        return "—";
    }

    return new Intl.NumberFormat("en-US", {
        style: "percent",
        maximumFractionDigits,
    }).format(numeric);
};

const formatDeliveryDate = (value) => {
    if (!value) {
        return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const Dashboard = () => {
    const [contracts, setContracts] = useState([]);
    const contractsRef = useRef([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const { isAuthenticated, logout } = useContext(AuthContext);

    const resolveSnapshot = useCallback((snapshot) => {
        if (snapshot?.contracts && snapshot.contracts.length > 0) {
            return snapshot;
        }

        console.warn("Market data unavailable; using mock contracts for continuity.");
        return mockContractsSnapshot;
    }, []);

    const applySnapshot = useCallback((snapshot) => {
        const resolvedSnapshot = resolveSnapshot(snapshot);
        if (!resolvedSnapshot) {
            return;
        }

        const normalizedContracts = normalizeContracts(resolvedSnapshot.contracts);
        const previousById = new Map(
            (contractsRef.current || []).map((contract) => [contract.id, contract])
        );

        const mergedContracts = normalizedContracts.map((contract) => {
            const previous = previousById.get(contract.id);
            return previous ? { ...previous, ...contract } : contract;
        });

        contractsRef.current = mergedContracts;
        setContracts(mergedContracts);

        setSelectedContract((current) => {
            if (!current) {
                return current;
            }
            return mergedContracts.find((contract) => contract.id === current.id) || null;
        });

        setIsLoading(false);
    }, [resolveSnapshot]);

    useEffect(() => {
        const fetchContracts = async () => {
            if (!isAuthenticated) {
                navigate("/login");
                return;
            }

            setIsLoading(true);
            try {
                const res = await api.get(`/api/contracts/market`);
                applySnapshot(resolveSnapshot(res.data));
            } catch (err) {
                console.error("Error fetching contracts", err);
                if (err?.response?.status === 401) {
                    setIsLoading(false);
                    logout();
                    navigate("/login");
                    return;
                }

                applySnapshot(mockContractsSnapshot);
            }
        };

        fetchContracts();
    }, [applySnapshot, isAuthenticated, logout, navigate, resolveSnapshot]);

    useMarketStream({
        enabled: isAuthenticated,
        onSnapshot: applySnapshot,
    });

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const formatContractPrice = useCallback(
        (contract) => {
            if (!contract) {
                return "—";
            }
            if (contract.numericPrice === null) {
                return contract.price ?? "—";
            }
            return formatCurrencyValue(contract.numericPrice);
        },
        []
    );

    const activeContracts = useMemo(
        () =>
            contracts.filter(
                (contract) => (contract.status || "").toLowerCase() !== "closed"
            ),
        [contracts]
    );

    const totalMarketValue = useMemo(
        () =>
            activeContracts.reduce((sum, contract) => {
                const numeric = contract.numericPrice ?? parseNumeric(contract.price) ?? 0;
                return sum + numeric;
            }, 0),
        [activeContracts]
    );

    const summaryCards = useMemo(
        () => [
            {
                title: "Active Contracts",
                value: activeContracts.length,
                helper: "Live listings across your marketplace",
                accent: "from-[#00D1FF] to-[#3BAEAB]",
            },
            {
                title: "Total Market Value",
                value: formatCurrencyValue(totalMarketValue, { maximumFractionDigits: 0 }),
                helper: "Aggregate price across visible offers",
                accent: "from-[#4F46E5] to-[#22D3EE]",
            },
            {
                title: "Purchased",
                value: activeContracts.filter(
                    (contract) => (contract.status || "").toLowerCase() === "purchased"
                ).length,
                helper: "Ready for delivery handoff",
                accent: "from-[#10B981] to-[#34D399]",
            },
        ],
        [activeContracts, totalMarketValue]
    );

    const contractTrendPoints = useMemo(() => {
        const pricedContracts = activeContracts
            .map((contract, index) => ({
                label: contract.seller || `Contract ${index + 1}`,
                value: contract.numericPrice ?? parseNumeric(contract.price) ?? 0,
            }))
            .filter((point) => point.value > 0);

        if (pricedContracts.length > 0) {
            return pricedContracts.slice(0, 6);
        }

        return [
            { label: "Week 1", value: 120000 },
            { label: "Week 2", value: 148000 },
            { label: "Week 3", value: 132000 },
            { label: "Week 4", value: 160000 },
            { label: "Week 5", value: 172500 },
        ];
    }, [activeContracts]);

    const maxTrendValue = useMemo(
        () =>
            contractTrendPoints.reduce(
                (max, point) => Math.max(max, point.value || 0),
                1
            ),
        [contractTrendPoints]
    );

    const trendPointDenominator = Math.max(contractTrendPoints.length - 1, 1);
    const trendPolyline = contractTrendPoints
        .map((point, index) => {
            const x = (index / trendPointDenominator) * 100;
            const y = 100 - (point.value / maxTrendValue) * 100;
            return `${x},${y}`;
        })
        .join(" ");
    const trendArea = `0,100 ${trendPolyline} 100,100`;

    const sectorVolumes = useMemo(() => {
        const counts = activeContracts.reduce((acc, contract) => {
            const sector = contract.sellerEntityType || "Independent";
            acc[sector] = (acc[sector] || 0) + 1;
            return acc;
        }, {});

        const entries = Object.entries(counts).map(([sector, count]) => ({ sector, count }));

        if (entries.length === 0) {
            return [
                { sector: "Energy", count: 3 },
                { sector: "Climate", count: 2 },
                { sector: "Market Ops", count: 1 },
            ];
        }

        return entries.sort((a, b) => b.count - a.count);
    }, [activeContracts]);

    const sectorMaxVolume = Math.max(
        ...sectorVolumes.map((entry) => entry.count),
        1
    );

    const featuredContracts = useMemo(
        () => activeContracts.slice(0, 4),
        [activeContracts]
    );

    const recommendations = useMemo(() => {
        const topValued = [...activeContracts]
            .filter((contract) => contract.numericPrice !== null)
            .sort((a, b) => (b.numericPrice ?? 0) - (a.numericPrice ?? 0))[0];

        return [
            {
                title: "AI deal flow",
                detail:
                    "Route high-signal contracts into pre-approval to compress diligence cycles.",
                badge: "Strategy",
            },
            {
                title: "Stabilize pricing",
                detail:
                    "Use rolling averages on volatile listings to anchor negotiations.",
                badge: "Pricing",
            },
            {
                title: "Focus on value",
                detail:
                    topValued
                        ? `Prioritize ${topValued.title} while buyer interest is elevated.`
                        : "Highlight the highest-value listing to accelerate buy-in.",
                badge: "AI Assist",
            },
        ];
    }, [activeContracts]);

    const handleViewAllContracts = () => {
        navigate("/buy");
    };

    const handleViewContract = (contract) => {
        if (!contract) return;
        navigate(`/buy?contractId=${encodeURIComponent(contract.id)}`);
    };

    return (
        <Layout onLogout={handleLogout}>
            <div className="space-y-6 sm:space-y-7 lg:space-y-8">
                <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Market Overview</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Mission Control</h2>
                            <p className="text-sm text-slate-400">
                                Track live contracts, spot price shifts, and move on the most actionable recommendations.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="ghost" onClick={() => navigate("/sell")}>Create listing</Button>
                            <Button onClick={() => navigate("/reports")}>View reports</Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {summaryCards.map((card) => (
                        <div
                            key={card.title}
                            className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_18px_40px_rgba(5,10,25,0.55)]"
                        >
                            <div className={`absolute inset-y-0 right-0 w-1/3 bg-gradient-to-br ${card.accent} opacity-50 blur-3xl`} />
                            <div className="relative space-y-2">
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{card.title}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-white">{card.value}</span>
                                    <span className="text-xs uppercase tracking-[0.18em] text-emerald-300">Live</span>
                                </div>
                                <p className="text-sm text-slate-400">{card.helper}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 shadow-[0_22px_50px_rgba(5,10,25,0.55)] xl:col-span-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Price Trend</p>
                                <h3 className="text-xl font-semibold text-white">Marketplace heat</h3>
                                <p className="text-sm text-slate-400">Smoothed view of current listings</p>
                            </div>
                            <Button variant="ghost" onClick={() => navigate("/reports")}>Export</Button>
                        </div>
                        <div className="mt-6 h-64 rounded-xl border border-slate-800/60 bg-gradient-to-b from-slate-900/60 to-slate-950/80 p-4">
                            <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#00D1FF" stopOpacity="0.35" />
                                        <stop offset="100%" stopColor="#0B1224" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <polygon points={trendArea} fill="url(#trendGradient)" stroke="none" />
                                <polyline
                                    points={trendPolyline}
                                    fill="none"
                                    stroke="#00D1FF"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {contractTrendPoints.map((point, index) => {
                                    const x = (index / trendPointDenominator) * 100;
                                    const y = 100 - (point.value / maxTrendValue) * 100;
                                    return (
                                        <circle
                                            key={`${point.label}-${index}`}
                                            cx={x}
                                            cy={y}
                                            r="1.8"
                                            fill="#3BAEAB"
                                        />
                                    );
                                })}
                            </svg>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-300 sm:grid-cols-3">
                                {contractTrendPoints.map((point) => (
                                    <div key={point.label} className="flex items-center justify-between rounded-lg bg-slate-950/40 px-3 py-2">
                                        <span className="font-semibold text-white/90">{point.label}</span>
                                        <span className="font-mono text-[#00D1FF]">{formatCurrencyValue(point.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_18px_40px_rgba(5,10,25,0.55)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Sector volume</p>
                                    <h3 className="text-lg font-semibold text-white">Where momentum is building</h3>
                                </div>
                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                                    Live feed
                                </span>
                            </div>
                            <div className="mt-4 space-y-3">
                                {sectorVolumes.map((entry) => (
                                    <div key={entry.sector} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm text-slate-300">
                                            <span className="font-semibold text-white">{entry.sector}</span>
                                            <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                                                {entry.count} listings
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-800/80">
                                            <div
                                                className="h-2 rounded-full bg-gradient-to-r from-[#00D1FF] to-[#3BAEAB]"
                                                style={{ width: `${Math.max((entry.count / sectorMaxVolume) * 100, 6)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.8fr_1.2fr]">
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_22px_55px_rgba(5,10,25,0.55)]">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Your active contracts</p>
                                    <h3 className="text-xl font-semibold text-white">Curated for action</h3>
                                    <p className="text-sm text-slate-400">Mapped from the latest marketplace snapshot.</p>
                                </div>
                                <Button variant="ghost" onClick={handleViewAllContracts}>
                                    View all contracts
                                </Button>
                            </div>
                            <div className="mt-4 divide-y divide-slate-800/80">
                                {isLoading ? (
                                    <div className="space-y-3 py-2">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-800/40" />
                                        ))}
                                    </div>
                                ) : featuredContracts.length > 0 ? (
                                    featuredContracts.map((contract) => (
                                        <div
                                            key={contract.id}
                                            className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ${
                                                        (contract.status || "").toLowerCase() === "purchased"
                                                            ? "border border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
                                                            : "border border-[#00D1FF]/40 bg-[#00D1FF]/10 text-[#00D1FF]"
                                                    }`}>
                                                        {contract.status || "Open"}
                                                    </span>
                                                    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 font-semibold text-slate-200">
                                                        {formatDeliveryDate(contract.deliveryDate)}
                                                    </span>
                                                </div>
                                                <h4 className="text-lg font-semibold text-white">{contract.title}</h4>
                                                <p className="text-sm text-slate-400">Seller: {contract.seller || "Unlisted"}</p>
                                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                                    <span className="font-mono text-[#3BAEAB]">{formatContractPrice(contract)}</span>
                                                    <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                                                        {contract.sellerEntityType || "Independent"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 md:min-w-[200px]">
                                                <Button variant="ghost" onClick={() => setSelectedContract(contract)}>
                                                    Inspect inline
                                                </Button>
                                                <Button onClick={() => handleViewContract(contract)}>
                                                    Open contract
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-sm text-slate-400">No active contracts available right now.</div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_18px_40px_rgba(5,10,25,0.55)]">
                            <h3 className="text-lg font-semibold text-white">AI recommendations</h3>
                            <p className="text-sm text-slate-400">Guidance tuned to the latest market snapshot.</p>
                            <div className="mt-4 space-y-3">
                                {recommendations.map((rec) => (
                                    <div
                                        key={rec.title}
                                        className="rounded-xl border border-slate-800/70 bg-slate-950/50 p-4 shadow-inner shadow-slate-950/70"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-base font-semibold text-white">{rec.title}</span>
                                            <span className="rounded-full bg-[#00D1FF]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#00D1FF]">
                                                {rec.badge}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-300">{rec.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <ContractDetailsPanel
                            inline
                            inlineWidth="w-full"
                            contract={selectedContract}
                            onClose={() => setSelectedContract(null)}
                        />

                        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_18px_40px_rgba(5,10,25,0.55)]">
                            <h3 className="text-lg font-semibold text-white">Take action</h3>
                            <p className="text-sm text-slate-400">Move quickly on the insights above.</p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <Button onClick={() => navigate("/buy")}>Open marketplace</Button>
                                <Button variant="ghost" onClick={() => navigate("/notifications")}>Create alert</Button>
                                <Button variant="ghost" onClick={() => navigate("/history")}>View audit trail</Button>
                                <Button variant="ghost" onClick={() => navigate("/settings")}>Configure routing</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
