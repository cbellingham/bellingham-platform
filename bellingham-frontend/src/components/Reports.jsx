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
            "#4f46e5",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#6366f1",
            "#ec4899",
            "#22d3ee",
            "#a855f7",
        ];

        return {
            labels: contracts.map((contract) => contract.title || "Untitled Contract"),
            datasets: [
                {
                    data: contracts.map((contract) => Number(contract.price || 0)),
                    backgroundColor: contracts.map((_, index) => colors[index % colors.length]),
                    borderColor: "#111827",
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
                    color: "#f9fafb",
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
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold mb-6">Purchased Contracts</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="w-full max-w-4xl mx-auto mb-8">
                    {contracts.length ? (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Allocation Overview</h2>
                            <div className="flex flex-col lg:flex-row items-center gap-6">
                                <div className="w-full lg:w-1/2 max-w-lg lg:max-w-2xl mx-auto h-96">
                                    <Pie data={pieData} options={pieOptions} />
                                </div>
                                <div className="w-full lg:w-1/2 space-y-2 text-sm text-gray-200">
                                    {contracts.map((contract) => {
                                        const price = Number(contract.price || 0);
                                        const allocation = totalValue ? ((price / totalValue) * 100).toFixed(1) : "0.0";

                                        return (
                                            <div
                                                key={contract.id}
                                                className="bg-gray-900/60 border border-gray-700 rounded px-4 py-3"
                                            >
                                                <p className="font-semibold text-base">{contract.title}</p>
                                                <p>Allocation: {allocation}% (${price.toFixed(2)})</p>
                                                <p>Purchased: {formatDate(contract.purchaseDate)}</p>
                                                <p>Delivery: {formatDate(contract.deliveryDate)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-300 border border-dashed border-gray-600 rounded-lg p-8">
                            <p>No purchased contracts yet. Acquired contracts will appear here.</p>
                        </div>
                    )}
                </div>
                <table className="w-[90%] mx-auto table-auto border border-collapse border-gray-700 bg-gray-800 text-white shadow rounded">
                    <thead>
                        <tr className="bg-gray-700 text-left">
                            <th className="border p-2">Title</th>
                            <th className="border p-2">Seller</th>
                            <th className="border p-2">Ask Price</th>
                            <th className="border p-2">Delivery</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.map((contract) => (
                            <tr
                                key={contract.id}
                                className="hover:bg-gray-600 cursor-pointer"
                                onClick={() => setSelectedContract(contract)}
                            >
                                <td className="border p-2">{contract.title}</td>
                                <td className="border p-2">{contract.seller}</td>
                                <td className="border p-2">${contract.price}</td>
                                <td className="border p-2">{contract.deliveryDate}</td>
                                <td className="border p-2">
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleListForSale(contract.id);
                                        }}
                                        className="px-2 py-1"
                                    >
                                        List for Sale
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCloseout(contract.id);
                                        }}
                                        className="ml-2 px-2 py-1"
                                    >
                                        Closeout
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="mt-4 text-lg font-semibold">
                    Total Value: ${totalValue.toFixed(2)}
                </p>
                <ContractDetailsPanel
                    inline
                    contract={selectedContract}
                    onClose={() => setSelectedContract(null)}
                />
            </main>
        </Layout>
    );
};

export default Reports;
