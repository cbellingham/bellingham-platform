// src/components/Dashboard.jsx

import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import ContractDetailsPanel from "./ContractDetailsPanel";
import Layout from "./Layout";
import api from "../utils/api";
import { AuthContext } from "../context";
import TableSkeleton from "./ui/TableSkeleton";
import useMarketStream from "../hooks/useMarketStream";
import { mockContractsSnapshot } from "../data/mock-contracts";
import {
    aiRecommendations,
    marketStats,
    priceHistory,
    userPortfolio,
    volumeData,
} from "../data/dashboard";

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

    const maxVolume = Math.max(...volumeData.map((d) => d.value));

    return (
        <Layout onLogout={handleLogout}>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
                <main className="order-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 md:p-7 lg:p-8 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                    <div className="space-y-5 sm:space-y-6 lg:space-y-7">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00D1FF]/80">
                                            Portfolio
                                        </p>
                                        <h3 className="text-xl font-bold text-white">User Positions</h3>
                                    </div>
                                    <span className="rounded-full bg-[#00D1FF]/10 px-3 py-1 text-xs font-semibold text-[#00D1FF]">
                                        {formatPercentValue(userPortfolio.dayChange, { maximumFractionDigits: 1 })} today
                                    </span>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-200">
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total Value</p>
                                        <p className="text-xl font-semibold text-white">
                                            {formatCurrencyValue(userPortfolio.totalValue)}
                                        </p>
                                        <p className="text-xs text-slate-400">Invested: {formatCurrencyValue(userPortfolio.investedCapital)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Available Cash</p>
                                        <p className="text-xl font-semibold text-white">
                                            {formatCurrencyValue(userPortfolio.availableCash)}
                                        </p>
                                        <p className="text-xs text-slate-400">Liquid for bids</p>
                                    </div>
                                </div>
                                <div className="mt-5 space-y-3">
                                    {userPortfolio.allocations.map((allocation) => (
                                        <div key={allocation.segment} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm text-slate-200">
                                                <span className="font-semibold">{allocation.segment}</span>
                                                <span className="font-mono text-[#3BAEAB]">
                                                    {formatPercentValue(allocation.weight, { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-slate-400">
                                                <span>{formatCurrencyValue(allocation.value)}</span>
                                                <span className="text-[#00D1FF]">
                                                    {formatPercentValue(allocation.returnRate, { maximumFractionDigits: 1 })} return
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#00D1FF] via-[#3BAEAB] to-[#00D1FF]"
                                                    style={{ width: `${Math.min(Math.max(allocation.weight * 100, 0), 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 sm:p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00D1FF]/80">Market</p>
                                        <h3 className="text-xl font-bold text-white">Live Stats</h3>
                                    </div>
                                    <span className="rounded-full border border-[#00D1FF]/40 bg-[#00D1FF]/10 px-3 py-1 text-xs font-semibold text-[#00D1FF]">
                                        Sentiment {formatPercentValue(marketStats.sentimentScore, { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
                                    <div className="rounded-lg border border-slate-800/70 bg-slate-900/40 p-3 space-y-1">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Market Value</p>
                                        <p className="text-lg font-semibold text-white">{formatCurrencyValue(marketStats.totalMarketValue)}</p>
                                        <p className="text-xs text-slate-400">Across open energy contracts</p>
                                    </div>
                                    <div className="rounded-lg border border-slate-800/70 bg-slate-900/40 p-3 space-y-1">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Daily Volume</p>
                                        <p className="text-lg font-semibold text-white">{formatCurrencyValue(marketStats.dailyVolume)}</p>
                                        <p className="text-xs text-slate-400">Rolling 24h settlement</p>
                                    </div>
                                    <div className="rounded-lg border border-slate-800/70 bg-slate-900/40 p-3 space-y-1">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Open Interest</p>
                                        <p className="text-lg font-semibold text-white">{formatCurrencyValue(marketStats.openInterest)}</p>
                                        <p className="text-xs text-slate-400">Active positions</p>
                                    </div>
                                    <div className="rounded-lg border border-slate-800/70 bg-slate-900/40 p-3 space-y-1">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Avg. Yield</p>
                                        <p className="text-lg font-semibold text-[#3BAEAB]">{formatPercentValue(marketStats.averageYield)}</p>
                                        <p className="text-xs text-slate-400">Net of fees</p>
                                    </div>
                                </div>
                                <div className="rounded-lg border border-[#00D1FF]/20 bg-[#00D1FF]/5 p-3 text-sm text-slate-100">
                                    <p className="text-xs uppercase tracking-[0.18em] text-[#00D1FF]/90">Biggest Mover</p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">{marketStats.biggestMover.name}</span>
                                        <span className="font-mono text-[#00D1FF]">
                                            {formatPercentValue(marketStats.biggestMover.change, { maximumFractionDigits: 1 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 sm:p-5 lg:col-span-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00D1FF]/80">
                                            Price History
                                        </p>
                                        <h3 className="text-xl font-bold text-white">Spot Curve</h3>
                                    </div>
                                    <span className="text-xs text-slate-400">6-session window</span>
                                </div>
                                <div className="mt-4 space-y-3 text-sm text-slate-200">
                                    {priceHistory.map((entry) => (
                                        <div
                                            key={entry.date}
                                            className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/40 px-3 py-2"
                                        >
                                            <span className="font-semibold">{formatDeliveryDate(entry.date)}</span>
                                            <span className="font-mono text-[#3BAEAB]">{formatCurrencyValue(entry.price, { maximumFractionDigits: 1 })}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 sm:p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00D1FF]/80">Volume</p>
                                        <h3 className="text-xl font-bold text-white">5-Day Flow</h3>
                                    </div>
                                    <span className="text-xs text-slate-400">Market depth</span>
                                </div>
                                <div className="space-y-3">
                                    {volumeData.map((volumePoint) => (
                                        <div key={volumePoint.label} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm text-slate-200">
                                                <span className="font-semibold">{volumePoint.label}</span>
                                                <span className="font-mono text-[#3BAEAB]">{formatCurrencyValue(volumePoint.value)}</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                                <div
                                                    className="h-full bg-[#00D1FF]"
                                                    style={{
                                                        width: `${Math.min(Math.max((volumePoint.value / maxVolume) * 100, 0), 100)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-5">
                                <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Market Overview</p>
                                    <h2 className="text-3xl font-bold text-white">Open Contracts</h2>
                                    <p className="text-sm text-slate-400">
                                        Monitor current opportunities and select a contract to inspect the full trade details.
                                    </p>
                                </div>
                                <div className="overflow-hidden rounded-xl border border-slate-800/80">
                                    <table className="w-full table-auto divide-y divide-slate-800 text-left text-sm text-slate-200">
                                        <thead className="sticky top-0 z-10 bg-slate-900/90 text-xs uppercase tracking-[0.18em] text-slate-400 backdrop-blur">
                                            <tr>
                                                <th className="px-4 py-3 md:px-5 md:py-3.5">Title</th>
                                                <th className="px-4 py-3 md:px-5 md:py-3.5">Seller</th>
                                                <th className="px-4 py-3 md:px-5 md:py-3.5">Ask Price</th>
                                                <th className="px-4 py-3 md:px-5 md:py-3.5">Status</th>
                                                <th className="px-4 py-3 md:px-5 md:py-3.5">Delivery</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/70">
                                            {isLoading ? (
                                                <TableSkeleton columns={5} rows={5} />
                                            ) : (
                                                <>
                                                    {contracts.map((contract) => (
                                                        <tr
                                                            key={contract.id}
                                                            className="cursor-pointer bg-slate-950/40 transition-colors hover:bg-[#00D1FF]/10"
                                                            onClick={() => setSelectedContract(contract)}
                                                        >
                                                            <td className="px-4 py-3 md:px-5 md:py-3.5 font-semibold text-slate-100">
                                                                {contract.title}
                                                            </td>
                                                            <td className="px-4 py-3 md:px-5 md:py-3.5">{contract.seller}</td>
                                                            <td className="px-4 py-3 md:px-5 md:py-3.5 font-semibold text-[#3BAEAB] font-mono tabular-nums">
                                                                {formatContractPrice(contract)}
                                                            </td>
                                                            <td className="px-4 py-3 md:px-5 md:py-3.5">
                                                                <span className="rounded-full border border-[#00D1FF]/40 bg-[#00D1FF]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#00D1FF]">
                                                                    {contract.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 md:px-5 md:py-3.5 text-slate-300">
                                                                {formatDeliveryDate(contract.deliveryDate)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {contracts.length === 0 && (
                                                        <tr>
                                                            <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
                                                                No contracts available at the moment.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00D1FF]/80">AI Desk</p>
                                        <h3 className="text-xl font-bold text-white">Recommendations</h3>
                                    </div>
                                    <span className="text-xs text-slate-400">Model preview</span>
                                </div>
                                <div className="space-y-3">
                                    {aiRecommendations.map((item) => (
                                        <div key={item.title} className="rounded-lg border border-slate-800/70 bg-slate-900/40 p-3 space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-white">{item.title}</p>
                                                    <p className="text-xs text-slate-400">{item.summary}</p>
                                                </div>
                                                <span className="rounded-full bg-[#00D1FF]/10 px-3 py-1 text-[11px] font-semibold text-[#00D1FF]">
                                                    {formatPercentValue(item.confidence, { maximumFractionDigits: 0 })} conf.
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-slate-300">
                                                <span className="font-mono text-[#3BAEAB]">
                                                    {formatPercentValue(item.expectedImpact, { maximumFractionDigits: 1 })} impact
                                                </span>
                                                <span>{item.action}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <aside className="order-2 xl:order-2">
                    <ContractDetailsPanel
                        inline
                        inlineWidth="w-full"
                        contract={selectedContract}
                        onClose={() => setSelectedContract(null)}
                    />
                </aside>
            </div>
        </Layout>
    );
};

export default Dashboard;
