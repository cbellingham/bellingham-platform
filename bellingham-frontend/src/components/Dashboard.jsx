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
