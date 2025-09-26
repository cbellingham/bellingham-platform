// src/components/Buy.jsx

import React, { useCallback, useEffect, useState, useContext } from "react";
import api from "../utils/api";
import { AuthContext } from '../context';
import ContractDetailsPanel from "./ContractDetailsPanel";
import Layout from "./Layout";
import Button from "./ui/Button";
import { useNavigate } from "react-router-dom";
import NotificationBanner from "./NotificationBanner";
import SignatureModal from "./SignatureModal";
import TableSkeleton from "./ui/TableSkeleton";

const Buy = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sellerFilter, setSellerFilter] = useState("");
    const [pendingContractId, setPendingContractId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const { logout } = useContext(AuthContext);

    const fetchContracts = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/api/contracts/available`);
            setContracts(res.data.content);
            setError("");
        } catch (err) {
            console.error(err);
            if (err.response) {
                const status = err.response.status;
                const message = err.response.data?.message || err.message || "";
                setError(
                    `Failed to fetch contracts (${status}${message ? `: ${message}` : ""})`
                );
            } else {
                setError("Failed to fetch contracts");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    const handleBuy = async (contractId) => {
        setNotification(null);
        try {
            const response = await api.post(`/api/contracts/${contractId}/buy`, {});
            const purchased = response?.data;
            setNotification({
                type: "success",
                message: purchased?.title
                    ? `Contract "${purchased.title}" purchased successfully!`
                    : "Contract purchased successfully!",
            });
            await fetchContracts();
            setSelectedContract((prev) => (prev && prev.id === contractId ? null : prev));
        } catch (err) {
            console.error(err);
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message || "Failed to purchase contract.";
            setNotification({
                type: "error",
                message: status ? `Unable to complete purchase (${status}): ${message}` : message,
            });
        }
    };

    const openSignatureModal = (contractId) => {
        setPendingContractId(contractId);
    };

    const handleSignatureConfirm = async () => {
        if (!pendingContractId) {
            return;
        }

        await handleBuy(pendingContractId);
        setPendingContractId(null);
    };

    const handleSignatureCancel = () => {
        setPendingContractId(null);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const sellers = Array.from(
        new Set(contracts.map((c) => c.seller).filter(Boolean))
    );

    const filteredContracts = contracts.filter((contract) => {
        const term = search.toLowerCase();
        const matchesSearch =
            contract.title.toLowerCase().includes(term) ||
            (contract.seller || "").toLowerCase().includes(term);
        const price = Number(contract.price || 0);
        const matchesMin = !minPrice || price >= Number(minPrice);
        const matchesMax = !maxPrice || price <= Number(maxPrice);
        const matchesSeller = !sellerFilter || contract.seller === sellerFilter;
        return matchesSearch && matchesMin && matchesMax && matchesSeller;
    });

    return (
        <Layout onLogout={handleLogout}>
            <div className="flex flex-col gap-6 xl:flex-row">
                <section className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                    <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Trading Desk</p>
                        <h1 className="text-3xl font-bold text-white">Available Contracts</h1>
                        <p className="text-sm text-slate-400">
                            Filter by counterparty, price range, or search by keyword to identify the right purchase opportunity.
                        </p>
                    </div>

                    {notification && (
                        <div className="mt-6">
                            <NotificationBanner
                                type={notification.type}
                                message={notification.message}
                                onDismiss={() => setNotification(null)}
                            />
                        </div>
                    )}
                    {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

                    <div className="mt-6 grid gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
                        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Search
                            <input
                                type="text"
                                placeholder="Title or seller"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Min Price
                            <input
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Max Price
                            <input
                                type="number"
                                placeholder="0"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Seller
                            <select
                                value={sellerFilter}
                                onChange={(e) => setSellerFilter(e.target.value)}
                                className="rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none"
                            >
                                <option value="">All Sellers</option>
                                {sellers.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-xl border border-slate-800/80">
                        <table className="w-full table-auto divide-y divide-slate-800 text-left text-sm text-slate-200">
                            <thead className="sticky top-0 z-10 bg-slate-900/90 text-xs uppercase tracking-[0.18em] text-slate-400 backdrop-blur">
                                <tr>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Seller</th>
                                    <th className="px-4 py-3">Ask Price</th>
                                    <th className="px-4 py-3">Delivery</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/70">
                                {isLoading ? (
                                    <TableSkeleton columns={5} rows={5} />
                                ) : (
                                    <>
                                        {filteredContracts.map((contract) => (
                                            <tr
                                                key={contract.id}
                                                className="cursor-pointer bg-slate-950/40 transition-colors hover:bg-[#00D1FF]/10"
                                                onClick={() => setSelectedContract(contract)}
                                            >
                                                <td className="px-4 py-3 font-semibold text-slate-100">{contract.title}</td>
                                                <td className="px-4 py-3">{contract.seller}</td>
                                                <td className="numeric-text px-4 py-3 font-semibold text-[#3BAEAB]">${contract.price}</td>
                                                <td className="px-4 py-3 text-slate-300">{contract.deliveryDate}</td>
                                                <td className="px-4 py-3">
                                                    <Button
                                                        variant="success"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openSignatureModal(contract.id);
                                                        }}
                                                        className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                                                    >
                                                        Buy
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredContracts.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
                                                    No contracts match your current filters.
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
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
            {pendingContractId && (
                <SignatureModal
                    onConfirm={handleSignatureConfirm}
                    onCancel={handleSignatureCancel}
                />
            )}
        </Layout>
    );
};

export default Buy;
