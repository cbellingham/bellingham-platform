import React, { useEffect, useState, useContext, useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import ContractDetailsPanel from "./ContractDetailsPanel";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from '../context';

ChartJS.register(ArcElement, Tooltip, Legend);

const Reports = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);

    const totalValue = contracts.reduce(
        (sum, contract) => sum + Number(contract.price || 0),
        0
    );

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return parsed.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const pieData = useMemo(() => {
        if (!contracts.length) {
            return {
                labels: [],
                datasets: [],
            };
        }

        const colors = [
            "#34d399",
            "#0ea5e9",
            "#a855f7",
            "#f97316",
            "#ef4444",
            "#22d3ee",
            "#facc15",
            "#14b8a6",
        ];

        return {
            labels: contracts.map((contract) => contract.title || "Untitled Contract"),
            datasets: [
                {
                    data: contracts.map((contract) => Number(contract.price || 0)),
                    backgroundColor: contracts.map((_, index) => colors[index % colors.length]),
                    borderColor: "#0f172a",
                    borderWidth: 2,
                },
            ],
        };
    }, [contracts]);

    const pieOptions = useMemo(() => ({
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "right",
                labels: {
                    color: "#e2e8f0",
                    boxWidth: 16,
                    padding: 16,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const contract = contracts[context.dataIndex];
                        const price = Number(contract?.price || 0);
                        const allocation = totalValue ? ((price / totalValue) * 100).toFixed(1) : "0.0";

                        return [
                            `${contract?.title || "Contract"}: ${allocation}% ($${price.toFixed(2)})`,
                            `Purchased: ${formatDate(contract?.purchaseDate)}`,
                            `Delivery: ${formatDate(contract?.deliveryDate)}`,
                        ];
                    },
                },
            },
        },
    }), [contracts, totalValue]);

    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchPurchased = async () => {
            try {
                const res = await api.get(`/api/contracts/purchased`);
                setContracts(res.data.content);
            } catch {
                setError("Failed to load purchased contracts.");
            }
        };
        fetchPurchased();
    }, []);

    const handleListForSale = async (id) => {
        try {
            await api.post(`/api/contracts/${id}/list`);
            setContracts((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to list contract for sale.");
        }
    };

    const handleCloseout = async (id) => {
        try {
            await api.post(`/api/contracts/${id}/closeout`);
            setContracts((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to closeout contract.");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Layout onLogout={handleLogout}>
            <div className="flex flex-col gap-6 xl:flex-row">
                <section className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                    <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Analytics</p>
                        <h1 className="text-3xl font-bold text-white">Purchased Contracts</h1>
                        <p className="text-sm text-slate-400">
                            Track portfolio allocation, performance, and lifecycle events across your acquired contracts.
                        </p>
                    </div>
                    {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

                    <div className="mt-6 grid gap-6">
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
                            {contracts.length ? (
                                <div className="flex flex-col gap-6 lg:flex-row">
                                    <div className="h-72 w-full lg:h-96 lg:flex-1">
                                        <Pie data={pieData} options={pieOptions} />
                                    </div>
                                    <div className="flex w-full flex-1 flex-col gap-4 text-sm text-slate-200">
                                        {contracts.map((contract) => {
                                            const price = Number(contract.price || 0);
                                            const allocation = totalValue ? ((price / totalValue) * 100).toFixed(1) : "0.0";

                                            return (
                                                <div
                                                    key={contract.id}
                                                    className="rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3"
                                                >
                                                    <p className="text-base font-semibold text-white">{contract.title}</p>
                                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                                        Allocation {allocation}%
                                                    </p>
                                                    <p className="text-sm text-slate-300">Value ${price.toFixed(2)}</p>
                                                    <p className="text-sm text-slate-300">Purchased {formatDate(contract.purchaseDate)}</p>
                                                    <p className="text-sm text-slate-300">Delivery {formatDate(contract.deliveryDate)}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-700/60 p-8 text-center text-slate-400">
                                    No purchased contracts yet. Acquired contracts will appear here.
                                </div>
                            )}
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-800/80">
                            <table className="w-full table-auto divide-y divide-slate-800 text-left text-sm text-slate-200">
                                <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3">Title</th>
                                        <th className="px-4 py-3">Seller</th>
                                        <th className="px-4 py-3">Ask Price</th>
                                        <th className="px-4 py-3">Delivery</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {contracts.map((contract) => (
                                        <tr
                                            key={contract.id}
                                            className="cursor-pointer bg-slate-950/40 transition-colors hover:bg-emerald-500/10"
                                            onClick={() => setSelectedContract(contract)}
                                        >
                                            <td className="px-4 py-3 font-semibold text-slate-100">{contract.title}</td>
                                            <td className="px-4 py-3">{contract.seller}</td>
                                            <td className="px-4 py-3 font-semibold text-emerald-300">${contract.price}</td>
                                            <td className="px-4 py-3 text-slate-300">{contract.deliveryDate}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleListForSale(contract.id);
                                                        }}
                                                        className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                                                    >
                                                        List for Sale
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCloseout(contract.id);
                                                        }}
                                                        className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                                                    >
                                                        Closeout
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {contracts.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
                                                No purchased contracts available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <p className="text-lg font-semibold text-emerald-200">
                            Portfolio Value ${totalValue.toFixed(2)}
                        </p>
                    </div>
                </section>
                <div className="xl:w-[360px]">
                    <ContractDetailsPanel
                        inline
                        inlineWidth="w-full"
                        contract={selectedContract}
                        onClose={() => setSelectedContract(null)}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default Reports;
