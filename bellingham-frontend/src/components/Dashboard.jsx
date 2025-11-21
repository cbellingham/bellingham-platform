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
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

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

    const numericContracts = contracts.filter(
        (contract) => contract.numericPrice !== null
    );
    const averagePrice =
        numericContracts.length > 0
            ? numericContracts.reduce(
                  (total, contract) => total + contract.numericPrice,
                  0
              ) / numericContracts.length
            : null;
    const priceMomentum =
        numericContracts.length > 1
            ? numericContracts[numericContracts.length - 1].numericPrice -
              numericContracts[0].numericPrice
            : null;

    const sparklineData =
        numericContracts.length > 0
            ? numericContracts.slice(0, 8).map((contract, index) => ({
                  name: contract.title || `Contract ${index + 1}`,
                  price: contract.numericPrice,
              }))
            : [];

    const sellerVolumes = contracts.reduce((acc, contract) => {
        const seller = contract.seller || "Unknown";
        acc[seller] = (acc[seller] || 0) + 1;
        return acc;
    }, {});

    const sellerVolumeData = Object.entries(sellerVolumes)
        .map(([seller, total]) => ({ seller, total }))
        .slice(0, 6);

    return (
        <Layout onLogout={handleLogout}>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
                <main className="order-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 md:p-7 lg:p-8 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                    <div className="space-y-5 sm:space-y-6 lg:space-y-7">
                        <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Market Overview</p>
                            <h2 className="text-3xl font-bold text-white">Open Contracts</h2>
                            <p className="text-sm text-slate-400">
                                Monitor current opportunities and select a contract to inspect the full trade details.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1.1fr]">
                            <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-[0_15px_40px_rgba(2,12,32,0.45)]">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Average Ask</p>
                                        <p className="text-2xl font-semibold text-white">
                                            {formatCurrencyValue(averagePrice, {
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                                            {priceMomentum !== null && priceMomentum >= 0 ? (
                                                <span className="flex items-center gap-1 text-emerald-400">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Trending Up
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-rose-400">
                                                    <TrendingDown className="h-4 w-4" />
                                                    Trending Down
                                                </span>
                                            )}
                                            <span className="text-slate-500">• live market curve</span>
                                        </div>
                                    </div>
                                    <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                                        {numericContracts.length} Active
                                    </div>
                                </div>
                                <div className="mt-6 h-52">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={sparklineData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
                                                    <stop offset="60%" stopColor="#2563eb" stopOpacity={0.18} />
                                                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                            <XAxis dataKey="name" hide tick={{ fill: "#94a3b8" }} tickLine={false} axisLine={{ stroke: "#1f2937" }} />
                                            <YAxis tick={{ fill: "#94a3b8" }} tickLine={false} axisLine={{ stroke: "#1f2937" }} tickFormatter={(value) => `$${value}`} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#0f172a",
                                                    border: "1px solid #1e293b",
                                                    borderRadius: "12px",
                                                    color: "#e2e8f0",
                                                    boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
                                                }}
                                                labelStyle={{ color: "#94a3b8", fontSize: "12px" }}
                                                formatter={(value) => formatCurrencyValue(value, { maximumFractionDigits: 2 })}
                                            />
                                            <Area type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={2.5} fill="url(#priceGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-[0_15px_40px_rgba(2,12,32,0.45)]">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Seller Activity</p>
                                        <p className="text-2xl font-semibold text-white">Top Contributors</p>
                                    </div>
                                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                                        Live
                                    </span>
                                </div>
                                <div className="mt-6 h-52">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={sellerVolumeData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                                                    <stop offset="70%" stopColor="#10b981" stopOpacity={0.5} />
                                                    <stop offset="100%" stopColor="#0f172a" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                            <XAxis dataKey="seller" tick={{ fill: "#94a3b8" }} tickLine={false} axisLine={{ stroke: "#1f2937" }} />
                                            <YAxis allowDecimals={false} tick={{ fill: "#94a3b8" }} tickLine={false} axisLine={{ stroke: "#1f2937" }} />
                                            <Tooltip
                                                cursor={{ fill: "rgba(16,185,129,0.08)" }}
                                                contentStyle={{
                                                    backgroundColor: "#0f172a",
                                                    border: "1px solid #1e293b",
                                                    borderRadius: "12px",
                                                    color: "#e2e8f0",
                                                    boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
                                                }}
                                                labelStyle={{ color: "#94a3b8", fontSize: "12px" }}
                                            />
                                            <Bar dataKey="total" radius={[10, 10, 8, 8]} fill="url(#barGradient)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
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
