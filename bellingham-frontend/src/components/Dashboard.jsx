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
import TableSkeleton from "./ui/TableSkeleton";
import useMarketStream from "../hooks/useMarketStream";

const KPI_KEYS = [
    "openContracts",
    "marketDepth",
    "totalVolume",
    "averageAsk",
    "activeSellers",
    "spread",
    "bestAsk",
    "executionsLastHour",
];

const createEmptyKpis = () =>
    KPI_KEYS.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
    }, {});

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

const computeKpisFromContracts = (contracts = []) => {
    const kpis = createEmptyKpis();
    if (!contracts.length) {
        return kpis;
    }

    kpis.openContracts = contracts.length;
    kpis.marketDepth = contracts.length;

    const prices = contracts
        .map((contract) => contract.numericPrice)
        .filter((price) => price !== null);

    if (prices.length) {
        const totalVolume = prices.reduce((sum, price) => sum + price, 0);
        kpis.totalVolume = totalVolume;
        kpis.averageAsk = totalVolume / prices.length;
        const best = Math.min(...prices);
        const tail = Math.max(...prices);
        kpis.bestAsk = best;
        kpis.spread = tail - best;
    }

    const sellers = new Set(
        contracts
            .map((contract) => contract?.seller?.trim())
            .filter((seller) => seller)
    );
    kpis.activeSellers = sellers.size;

    return kpis;
};

const normalizeKpis = (kpis, contracts = []) => {
    if (!kpis || !Object.keys(kpis).length) {
        return computeKpisFromContracts(contracts);
    }

    const normalized = createEmptyKpis();
    KPI_KEYS.forEach((key) => {
        const numeric = parseNumeric(kpis[key]);
        if (numeric === null) {
            if (key === "openContracts" || key === "marketDepth") {
                normalized[key] = contracts.length;
            }
            return;
        }
        normalized[key] = numeric;
    });

    const bestAskValue = parseNumeric(kpis.bestAsk);
    if (bestAskValue === null && contracts.length) {
        const best = contracts
            .map((contract) => contract.numericPrice)
            .filter((price) => price !== null)
            .reduce((acc, price) => (acc === null ? price : Math.min(acc, price)), null);
        if (best !== null) {
            normalized.bestAsk = best;
        }
    }

    const spreadValue = parseNumeric(kpis.spread);
    if (spreadValue === null && contracts.length > 1) {
        const pricedContracts = contracts
            .map((contract) => contract.numericPrice)
            .filter((price) => price !== null);
        if (pricedContracts.length > 1) {
            const best = Math.min(...pricedContracts);
            const tail = Math.max(...pricedContracts);
            normalized.spread = tail - best;
        }
    }

    return normalized;
};

const normalizeDelta = (delta) => {
    const normalized = createEmptyKpis();
    if (!delta || !Object.keys(delta).length) {
        return normalized;
    }

    KPI_KEYS.forEach((key) => {
        const numeric = parseNumeric(delta[key]);
        if (numeric !== null) {
            normalized[key] = numeric;
        }
    });

    return normalized;
};

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

const formatNumberValue = (value, { maximumFractionDigits = 0 } = {}) => {
    const numeric = parseNumeric(value);
    if (numeric === null) {
        return "—";
    }
    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits,
    }).format(numeric);
};

const renderDelta = (value, { currency = false, fractionDigits = 0 } = {}) => {
    const numeric = parseNumeric(value);
    if (numeric === null || numeric === 0) {
        return <span className="text-xs text-slate-500">No change</span>;
    }

    const absValue = Math.abs(numeric);
    const formatted = currency
        ? formatCurrencyValue(absValue, { maximumFractionDigits: fractionDigits })
        : formatNumberValue(absValue, { maximumFractionDigits: fractionDigits });
    const className = numeric > 0 ? "text-emerald-400" : "text-rose-400";
    const prefix = numeric > 0 ? "+" : "−";
    return <span className={`text-xs font-semibold ${className}`}>{`${prefix}${formatted}`}</span>;
};

const describeBestAsk = (bestAsk) => {
    const numeric = parseNumeric(bestAsk);
    if (numeric === null) {
        return "Order book is currently empty";
    }
    return `Top of book ask at ${formatCurrencyValue(numeric)}`;
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
    const [kpis, setKpis] = useState(() => createEmptyKpis());
    const [kpiDeltas, setKpiDeltas] = useState(() => createEmptyKpis());
    const previousKpisRef = useRef(createEmptyKpis());
    const navigate = useNavigate();

    const { isAuthenticated, logout } = useContext(AuthContext);

    const applySnapshot = useCallback((snapshot, { baseline = false } = {}) => {
        if (!snapshot) {
            return;
        }

        const normalizedContracts = normalizeContracts(snapshot.contracts);
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

        const nextKpis = normalizeKpis(snapshot.kpis, mergedContracts);
        setKpis(nextKpis);

        if (baseline) {
            setKpiDeltas(createEmptyKpis());
            previousKpisRef.current = nextKpis;
        } else {
            if (snapshot.delta && Object.keys(snapshot.delta).length > 0) {
                setKpiDeltas(normalizeDelta(snapshot.delta));
            } else {
                const previous = previousKpisRef.current || createEmptyKpis();
                const computed = createEmptyKpis();
                KPI_KEYS.forEach((key) => {
                    computed[key] = nextKpis[key] - (previous[key] ?? 0);
                });
                setKpiDeltas(computed);
            }
            previousKpisRef.current = nextKpis;
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        const fetchContracts = async () => {
            if (!isAuthenticated) {
                navigate("/login");
                return;
            }

            setIsLoading(true);
            try {
                const res = await api.get(`/api/contracts/market`);
                applySnapshot(res.data, { baseline: true });
            } catch (err) {
                console.error("Error fetching contracts", err);
                setIsLoading(false);
                logout();
                navigate("/login");
            }
        };

        fetchContracts();
    }, [applySnapshot, isAuthenticated, logout, navigate]);

    useMarketStream({
        enabled: isAuthenticated,
        onSnapshot: applySnapshot,
    });

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const kpiCards = useMemo(
        () => [
            {
                key: "marketDepth",
                title: "Market Depth",
                value: formatNumberValue(kpis.marketDepth),
                delta: renderDelta(kpiDeltas.marketDepth),
                description: describeBestAsk(kpis.bestAsk),
                accent: "text-[#00D1FF]",
            },
            {
                key: "totalVolume",
                title: "Total Ask Volume",
                value: formatCurrencyValue(kpis.totalVolume),
                delta: renderDelta(kpiDeltas.totalVolume, { currency: true }),
                description: "Aggregate notional value across open listings",
                accent: "text-[#3BAEAB]",
            },
            {
                key: "averageAsk",
                title: "Average Ask",
                value: formatCurrencyValue(kpis.averageAsk),
                delta: renderDelta(kpiDeltas.averageAsk, { currency: true }),
                description: "Mean price across available contracts",
                accent: "text-[#00D1FF]",
            },
            {
                key: "activeSellers",
                title: "Active Sellers",
                value: formatNumberValue(kpis.activeSellers),
                delta: renderDelta(kpiDeltas.activeSellers),
                description: `${formatNumberValue(kpis.openContracts)} live listings`,
                accent: "text-[#7465A8]",
            },
            {
                key: "spread",
                title: "Spread",
                value: formatCurrencyValue(kpis.spread),
                delta: renderDelta(kpiDeltas.spread, { currency: true }),
                description: "Range between best and tail asks",
                accent: "text-[#3BAEAB]",
            },
            {
                key: "executionsLastHour",
                title: "Execution Velocity",
                value: formatNumberValue(kpis.executionsLastHour),
                delta: renderDelta(kpiDeltas.executionsLastHour),
                description: "Contracts settled in the past hour",
                accent: "text-[#00D1FF]",
            },
        ],
        [kpis, kpiDeltas]
    );

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

    return (
        <Layout onLogout={handleLogout}>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:grid-cols-[260px_minmax(0,1fr)_320px] xl:gap-8">
                <main className="order-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 md:p-7 lg:p-8 shadow-[0_20px_45px_rgba(2,12,32,0.55)] xl:order-2">
                    <div className="space-y-5 sm:space-y-6 lg:space-y-7">
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
                                                    <td className="numeric-text px-4 py-3 md:px-5 md:py-3.5 font-semibold text-[#3BAEAB]">
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
                </main>
                <aside className="order-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 md:p-7 lg:p-8 shadow-[0_20px_45px_rgba(2,12,32,0.45)] xl:order-1">
                    <div className="space-y-5 sm:space-y-6 lg:space-y-7">
                        <div className="border-b border-slate-800 pb-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3BAEAB]/80">Analytics</p>
                            <h3 className="text-2xl font-semibold text-white">Marketplace KPIs</h3>
                            <p className="mt-2 text-sm text-slate-400">
                                Track headline performance metrics alongside the live order book.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={`kpi-skeleton-${index}`}
                                        className="min-h-[7.5rem] animate-pulse rounded-xl border border-slate-800/70 bg-slate-950/40"
                                    />
                                ))
                            ) : (
                                kpiCards.map(({ key, title, value, delta, description, accent }) => (
                                    <div
                                        key={key}
                                        className="flex min-h-[7.5rem] flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 shadow-inner"
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                                            {title}
                                        </p>
                                        <div className="mt-3 flex items-end justify-between gap-2">
                                            <p className={`numeric-text text-3xl font-bold ${accent}`}>{value}</p>
                                            {delta}
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">{description}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>
                <aside className="order-3 xl:order-3">
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
