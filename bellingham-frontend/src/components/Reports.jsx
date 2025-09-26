import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import ContractDetailsPanel from "./ContractDetailsPanel";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from '../context';
import TableSkeleton from "./ui/TableSkeleton";

ChartJS.register(ArcElement, Tooltip, Legend);

const ACCESSIBLE_PALETTE = [
    "#2dd4bf",
    "#38bdf8",
    "#f97316",
    "#8b5cf6",
    "#facc15",
    "#f472b6",
    "#22d3ee",
    "#a3e635",
];

const hexToRgb = (hex) => {
    if (!hex) {
        return { r: 0, g: 0, b: 0 };
    }

    const normalized = hex.replace("#", "");
    const matches =
        normalized.length === 3
            ? normalized
                  .split("")
                  .map((char) => char + char)
                  .join("")
            : normalized.padEnd(6, "0");

    const value = parseInt(matches, 16);

    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
    };
};

const withAlpha = (hex, alpha = 1) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const PATTERN_DEFINITIONS = [
    {
        id: "diagonal-forward",
        css: (color) => ({
            backgroundColor: withAlpha(color, 0.78),
            backgroundImage: `repeating-linear-gradient(135deg, transparent 0 6px, rgba(15, 23, 42, 0.45) 6px 9px)`,
            backgroundSize: "12px 12px",
        }),
        createPattern: (ctx, color) => {
            const size = 32;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const patternCtx = canvas.getContext("2d");

            patternCtx.fillStyle = withAlpha(color, 0.8);
            patternCtx.fillRect(0, 0, size, size);

            patternCtx.strokeStyle = "rgba(15, 23, 42, 0.55)";
            patternCtx.lineWidth = 4;

            patternCtx.beginPath();
            patternCtx.moveTo(-size * 0.25, size);
            patternCtx.lineTo(size, -size * 0.25);
            patternCtx.moveTo(0, size * 1.25);
            patternCtx.lineTo(size * 1.25, 0);
            patternCtx.stroke();

            return ctx.createPattern(canvas, "repeat");
        },
    },
    {
        id: "diagonal-back",
        css: (color) => ({
            backgroundColor: withAlpha(color, 0.78),
            backgroundImage: `repeating-linear-gradient(45deg, transparent 0 6px, rgba(15, 23, 42, 0.4) 6px 9px)`,
            backgroundSize: "12px 12px",
        }),
        createPattern: (ctx, color) => {
            const size = 32;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const patternCtx = canvas.getContext("2d");

            patternCtx.fillStyle = withAlpha(color, 0.8);
            patternCtx.fillRect(0, 0, size, size);

            patternCtx.strokeStyle = "rgba(15, 23, 42, 0.55)";
            patternCtx.lineWidth = 4;

            patternCtx.beginPath();
            patternCtx.moveTo(-size * 0.25, 0);
            patternCtx.lineTo(size, size * 1.25);
            patternCtx.moveTo(0, -size * 0.25);
            patternCtx.lineTo(size * 1.25, size);
            patternCtx.stroke();

            return ctx.createPattern(canvas, "repeat");
        },
    },
    {
        id: "horizontal",
        css: (color) => ({
            backgroundColor: withAlpha(color, 0.78),
            backgroundImage: `repeating-linear-gradient(0deg, transparent 0 7px, rgba(15, 23, 42, 0.45) 7px 11px)`,
            backgroundSize: "14px 14px",
        }),
        createPattern: (ctx, color) => {
            const size = 32;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const patternCtx = canvas.getContext("2d");

            patternCtx.fillStyle = withAlpha(color, 0.8);
            patternCtx.fillRect(0, 0, size, size);

            patternCtx.fillStyle = "rgba(15, 23, 42, 0.5)";
            patternCtx.fillRect(0, 0, size, size / 4);

            return ctx.createPattern(canvas, "repeat");
        },
    },
    {
        id: "dots",
        css: (color) => ({
            backgroundColor: withAlpha(color, 0.78),
            backgroundImage: `radial-gradient(rgba(15, 23, 42, 0.55) 15%, transparent 16%)`,
            backgroundSize: "12px 12px",
        }),
        createPattern: (ctx, color) => {
            const size = 32;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const patternCtx = canvas.getContext("2d");

            patternCtx.fillStyle = withAlpha(color, 0.8);
            patternCtx.fillRect(0, 0, size, size);

            patternCtx.fillStyle = "rgba(15, 23, 42, 0.6)";
            const radius = size * 0.18;
            patternCtx.beginPath();
            patternCtx.arc(size * 0.35, size * 0.35, radius, 0, Math.PI * 2);
            patternCtx.arc(size * 0.85, size * 0.85, radius, 0, Math.PI * 2);
            patternCtx.fill();

            return ctx.createPattern(canvas, "repeat");
        },
    },
];

const Reports = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const patternCache = useRef({});

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

        return {
            labels: contracts.map((contract) => contract.title || "Untitled Contract"),
            datasets: [
                {
                    data: contracts.map((contract) => Number(contract.price || 0)),
                    backgroundColor: (context) => {
                        const dataIndex = context.dataIndex ?? 0;
                        const baseColor = ACCESSIBLE_PALETTE[dataIndex % ACCESSIBLE_PALETTE.length];
                        const pattern = PATTERN_DEFINITIONS[dataIndex % PATTERN_DEFINITIONS.length];
                        const cacheKey = `${pattern.id}-${baseColor}`;
                        const chartCtx = context?.chart?.ctx;

                        if (!chartCtx || typeof document === "undefined") {
                            return baseColor;
                        }

                        if (!patternCache.current[cacheKey]) {
                            patternCache.current[cacheKey] = pattern.createPattern(chartCtx, baseColor);
                        }

                        return patternCache.current[cacheKey];
                    },
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
                display: false,
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
                setIsLoading(true);
                const res = await api.get(`/api/contracts/purchased`);
                setContracts(res.data.content);
                setError("");
            } catch {
                setError("Failed to load purchased contracts.");
            } finally {
                setIsLoading(false);
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
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Analytics</p>
                            <h1 className="text-3xl font-bold text-white">Purchased Contracts</h1>
                            <p className="text-sm text-slate-400">
                                Track portfolio allocation, performance, and lifecycle events across your acquired contracts.
                            </p>
                        </div>
                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <div className="grid gap-6">
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
                                {isLoading ? (
                                    <div className="flex h-72 items-center justify-center lg:h-96">
                                        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#00D1FF] border-t-transparent" />
                                    </div>
                            ) : contracts.length ? (
                                <div className="flex flex-col gap-6 lg:flex-row">
                                    <div className="flex w-full flex-col gap-4 lg:flex-1">
                                        <div className="h-72 w-full lg:h-96">
                                            <Pie data={pieData} options={pieOptions} />
                                        </div>
                                        <div className="grid gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-sm text-slate-200 sm:grid-cols-2">
                                            {contracts.map((contract, index) => {
                                                const baseColor = ACCESSIBLE_PALETTE[index % ACCESSIBLE_PALETTE.length];
                                                const pattern = PATTERN_DEFINITIONS[index % PATTERN_DEFINITIONS.length];
                                                const price = Number(contract.price || 0);
                                                const allocation = totalValue ? ((price / totalValue) * 100).toFixed(1) : "0.0";

                                                return (
                                                    <div key={contract.id ?? index} className="flex items-start gap-3 rounded-lg border border-slate-800/60 bg-slate-900/60 p-3">
                                                        <span
                                                            aria-hidden="true"
                                                            className="mt-1 h-10 w-10 flex-shrink-0 rounded-md border border-slate-800/80 shadow-inner"
                                                            style={{
                                                                ...pattern.css(baseColor),
                                                                borderColor: "rgba(15, 23, 42, 0.55)",
                                                            }}
                                                        />
                                                        <div className="flex flex-1 flex-col gap-1">
                                                            <p className="text-sm font-semibold text-white">
                                                                <span className="sr-only">Slice {index + 1}: </span>
                                                                {contract.title || "Untitled Contract"}
                                                            </p>
                                                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                                                <span className="numeric-text">{allocation}%</span> of portfolio
                                                            </p>
                                                            <p className="text-xs text-slate-300">
                                                                Value <span className="numeric-text">${price.toFixed(2)}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex w-full flex-1 flex-col gap-4 text-sm text-slate-200">
                                        {contracts.map((contract, index) => {
                                            const price = Number(contract.price || 0);
                                            const allocation = totalValue ? ((price / totalValue) * 100).toFixed(1) : "0.0";
                                            const baseColor = ACCESSIBLE_PALETTE[index % ACCESSIBLE_PALETTE.length];
                                            const pattern = PATTERN_DEFINITIONS[index % PATTERN_DEFINITIONS.length];

                                            return (
                                                <div
                                                    key={contract.id}
                                                    className="rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3"
                                                >
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <span
                                                            aria-hidden="true"
                                                            className="h-9 w-9 flex-shrink-0 rounded-md border border-slate-800/70 shadow-inner"
                                                            style={{
                                                                ...pattern.css(baseColor),
                                                                borderColor: "rgba(15, 23, 42, 0.45)",
                                                            }}
                                                        />
                                                        <p className="text-base font-semibold text-white">{contract.title}</p>
                                                    </div>
                                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                                        Allocation <span className="numeric-text">{allocation}%</span>
                                                    </p>
                                                    <p className="text-sm text-slate-300">
                                                        Value <span className="numeric-text">${price.toFixed(2)}</span>
                                                    </p>
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

                        <div className="space-y-6">
                            <div className="overflow-hidden rounded-2xl border border-slate-800/80">
                                <table className="w-full table-auto divide-y divide-slate-800 text-left text-sm text-slate-200">
                                    <thead className="sticky top-0 z-10 bg-slate-900/90 text-xs uppercase tracking-[0.18em] text-slate-400 backdrop-blur">
                                        <tr>
                                            <th className="px-4 py-3 md:px-5 md:py-3.5">Title</th>
                                            <th className="px-4 py-3 md:px-5 md:py-3.5">Seller</th>
                                            <th className="px-4 py-3 md:px-5 md:py-3.5">Ask Price</th>
                                            <th className="px-4 py-3 md:px-5 md:py-3.5">Delivery</th>
                                            <th className="px-4 py-3 md:px-5 md:py-3.5">Actions</th>
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
                                                        <td className="px-4 py-3 md:px-5 md:py-3.5 font-semibold text-slate-100">{contract.title}</td>
                                                        <td className="px-4 py-3 md:px-5 md:py-3.5">{contract.seller}</td>
                                                        <td className="numeric-text px-4 py-3 md:px-5 md:py-3.5 font-semibold text-[#3BAEAB]">${contract.price}</td>
                                                        <td className="px-4 py-3 md:px-5 md:py-3.5 text-slate-300">{contract.deliveryDate}</td>
                                                        <td className="px-4 py-3 md:px-5 md:py-3.5">
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
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <p className="text-lg font-semibold text-[#00D1FF]">
                                Portfolio Value <span className="numeric-text">${totalValue.toFixed(2)}</span>
                            </p>
                        </div>
                        </div>
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
