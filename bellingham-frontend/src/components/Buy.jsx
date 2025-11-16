// src/components/Buy.jsx

import React, { useCallback, useEffect, useMemo, useState, useContext } from "react";
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
    const [pinnedFilters, setPinnedFilters] = useState([]);
    const [pinnedError, setPinnedError] = useState("");
    const [newPinnedName, setNewPinnedName] = useState("");
    const [isSavingPinnedFilter, setIsSavingPinnedFilter] = useState(false);
    const [isLoadingPinnedFilters, setIsLoadingPinnedFilters] = useState(true);

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

    const fetchPinnedFilters = useCallback(async () => {
        try {
            setIsLoadingPinnedFilters(true);
            const response = await api.get(`/api/saved-searches`);
            setPinnedFilters(response?.data ?? []);
            setPinnedError("");
        } catch (err) {
            console.error(err);
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message || "Failed to load saved filters.";
            setPinnedError(status ? `Unable to load saved filters (${status}): ${message}` : message);
        } finally {
            setIsLoadingPinnedFilters(false);
        }
    }, []);

    useEffect(() => {
        fetchPinnedFilters();
    }, [fetchPinnedFilters]);

    const handleBuy = async (contractId, signatureData = null) => {
        setNotification(null);
        try {
            const payload = signatureData ? { signature: signatureData } : undefined;
            const response = await api.post(
                `/api/contracts/${contractId}/buy`,
                payload,
            );
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

    const handleSignatureConfirm = async (signatureData) => {
        if (!pendingContractId) {
            return;
        }

        await handleBuy(pendingContractId, signatureData);
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

    const saveCurrentFilters = async (event) => {
        event?.preventDefault();
        const trimmedName = newPinnedName.trim();

        if (!trimmedName) {
            setPinnedError("Please provide a name for your saved filter.");
            return;
        }

        setPinnedError("");
        setIsSavingPinnedFilter(true);

        try {
            const payload = {
                name: trimmedName,
                searchTerm: search.trim() || null,
                minPrice: minPrice !== "" ? minPrice : null,
                maxPrice: maxPrice !== "" ? maxPrice : null,
                seller: sellerFilter || null,
            };
            await api.post(`/api/saved-searches`, payload);
            setNewPinnedName("");
            await fetchPinnedFilters();
        } catch (err) {
            console.error(err);
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message || "Failed to save filters.";
            setPinnedError(status ? `Unable to save filter (${status}): ${message}` : message);
        } finally {
            setIsSavingPinnedFilter(false);
        }
    };

    const applyPinnedFilter = (saved) => {
        setSearch(saved.searchTerm ?? "");
        setMinPrice(saved.minPrice != null ? saved.minPrice.toString() : "");
        setMaxPrice(saved.maxPrice != null ? saved.maxPrice.toString() : "");
        setSellerFilter(saved.seller ?? "");
    };

    const removePinnedFilter = async (id) => {
        try {
            await api.delete(`/api/saved-searches/${id}`);
            await fetchPinnedFilters();
        } catch (err) {
            console.error(err);
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message || "Failed to remove filter.";
            setPinnedError(status ? `Unable to remove filter (${status}): ${message}` : message);
        }
    };

    const formatPinnedSummary = useCallback((saved) => {
        const parts = [];
        if (saved.searchTerm) {
            parts.push(`Search: “${saved.searchTerm}”`);
        }
        if (saved.minPrice != null || saved.maxPrice != null) {
            const minLabel = saved.minPrice != null ? `$${saved.minPrice}` : "Any";
            const maxLabel = saved.maxPrice != null ? `$${saved.maxPrice}` : "Any";
            parts.push(`Price: ${minLabel} - ${maxLabel}`);
        }
        if (saved.seller) {
            parts.push(`Seller: ${saved.seller}`);
        }
        return parts.length > 0 ? parts.join(" • ") : "No additional filters.";
    }, []);

    const activePinnedId = useMemo(() => {
        return pinnedFilters.find((saved) => {
            const normalizedSearch = (search || "").trim();
            const savedSearch = saved.searchTerm ?? "";
            const savedMin = saved.minPrice != null ? saved.minPrice.toString() : "";
            const savedMax = saved.maxPrice != null ? saved.maxPrice.toString() : "";
            const savedSeller = saved.seller ?? "";
            return (
                savedSearch === normalizedSearch &&
                savedMin === minPrice &&
                savedMax === maxPrice &&
                savedSeller === sellerFilter
            );
        })?.id;
    }, [pinnedFilters, search, minPrice, maxPrice, sellerFilter]);

    const STATUS_BADGE_STYLES = useMemo(
        () => ({
            available: "border-emerald-400/50 bg-emerald-500/10 text-emerald-300",
            open: "border-[#00D1FF]/50 bg-[#00D1FF]/10 text-[#00D1FF]",
            purchased: "border-[#7465A8]/50 bg-[#7465A8]/12 text-[#C5BEE4]",
            closed: "border-slate-500/40 bg-slate-600/10 text-slate-200",
            default: "border-slate-700/60 bg-slate-800/60 text-slate-200",
        }),
        []
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
            <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:flex-row xl:gap-8">
                <section className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 md:p-7 lg:p-8 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                    <div className="space-y-5 sm:space-y-6 lg:space-y-7">
                        <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Trading Desk</p>
                            <h1 className="text-3xl font-bold text-white">Available Contracts</h1>
                            <p className="text-sm text-slate-400">
                                Filter by counterparty, price range, or search by keyword to identify the right purchase opportunity.
                            </p>
                        </div>

                        {notification && (
                            <NotificationBanner
                                type={notification.type}
                                message={notification.message}
                                onDismiss={() => setNotification(null)}
                            />
                        )}
                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
                            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 max-w-xs">
                                Search
                                <input
                                    type="text"
                                    placeholder="Title or seller"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full max-w-xs rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none"
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 max-w-xs">
                                Min Price
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full max-w-xs rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none"
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 max-w-xs">
                                Max Price
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full max-w-xs rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none"
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 max-w-xs">
                                Seller
                                <select
                                    value={sellerFilter}
                                    onChange={(e) => setSellerFilter(e.target.value)}
                                    className="w-full max-w-xs rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none"
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

                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-100">Pinned filters</h3>
                                    <p className="text-xs text-slate-400">Save strategies to quickly reapply them.</p>
                                </div>
                                <form onSubmit={saveCurrentFilters} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <input
                                        type="text"
                                        value={newPinnedName}
                                        onChange={(e) => setNewPinnedName(e.target.value)}
                                        placeholder="Name this filter"
                                        className="w-full rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none sm:w-48"
                                    />
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isLoading={isSavingPinnedFilter}
                                        className="text-xs font-semibold uppercase tracking-[0.18em]"
                                    >
                                        Save current filters
                                    </Button>
                                </form>
                            </div>
                            <div className="mt-4 flex flex-col gap-3">
                                {isLoadingPinnedFilters ? (
                                    <p className="text-xs text-slate-400">Loading pinned filters…</p>
                                ) : pinnedFilters.length > 0 ? (
                                    pinnedFilters.map((saved) => {
                                        const isActive = activePinnedId === saved.id;
                                        return (
                                            <div
                                                key={saved.id}
                                                className={`flex flex-col gap-2 rounded-lg border px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                                                    isActive
                                                        ? "border-[#00D1FF]/50 bg-[#00D1FF]/10"
                                                        : "border-slate-800/60 bg-slate-950/70 hover:border-[#00D1FF]/40"
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => applyPinnedFilter(saved)}
                                                    className="flex-1 text-left"
                                                >
                                                    <span className="block text-sm font-semibold text-slate-100">{saved.name}</span>
                                                    <span className="mt-1 block text-xs text-slate-400">{formatPinnedSummary(saved)}</span>
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    {isActive && (
                                                        <span className="rounded-full bg-[#00D1FF]/20 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#00D1FF]">
                                                            Active
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removePinnedFilter(saved.id);
                                                        }}
                                                        className="rounded-md border border-transparent px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:border-rose-500/40 hover:text-rose-300"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-slate-400">Save a filter configuration to pin it here.</p>
                                )}
                                {pinnedError && (
                                    <p className="text-xs text-rose-400">{pinnedError}</p>
                                )}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-slate-800/80">
                            <table className="w-full table-auto divide-y divide-slate-800 text-left text-sm text-slate-200">
                                <thead className="sticky top-0 z-10 bg-slate-900/90 text-xs uppercase tracking-[0.18em] text-slate-400 backdrop-blur">
                                    <tr>
                                        <th className="px-4 py-3 md:px-5 md:py-3.5">Title</th>
                                        <th className="px-4 py-3 md:px-5 md:py-3.5">Seller</th>
                                        <th className="px-4 py-3 md:px-5 md:py-3.5">Ask Price</th>
                                        <th className="px-4 py-3 md:px-5 md:py-3.5">Delivery</th>
                                        <th className="px-4 py-3 md:px-5 md:py-3.5">Status</th>
                                        <th className="px-4 py-3 md:px-5 md:py-3.5">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {isLoading ? (
                                        <TableSkeleton columns={6} rows={5} />
                                    ) : (
                                        <>
                                            {filteredContracts.map((contract) => (
                                                <tr
                                                    key={contract.id}
                                                    className="cursor-pointer bg-slate-950/40 transition-colors hover:bg-[#00D1FF]/10"
                                                    onClick={() => setSelectedContract(contract)}
                                                >
                                                    <td className="px-4 py-3 md:px-5 md:py-3.5 font-semibold text-slate-100">{contract.title}</td>
                                                    <td className="px-4 py-3 md:px-5 md:py-3.5">{contract.seller}</td>
                                                    <td className="px-4 py-3 md:px-5 md:py-3.5 font-semibold text-[#3BAEAB] font-mono tabular-nums">${contract.price}</td>
                                                    <td className="px-4 py-3 md:px-5 md:py-3.5 text-slate-300">{contract.deliveryDate}</td>
                                                    <td className="px-4 py-3 md:px-5 md:py-3.5">
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                                                                STATUS_BADGE_STYLES[(contract.status || "").toLowerCase()] ||
                                                                STATUS_BADGE_STYLES.default
                                                            }`}
                                                        >
                                                            {contract.status || "Unknown"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 md:px-5 md:py-3.5">
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
                                                <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
                                                    No contracts match your current filters.
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
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
            {pendingContractId != null && (
                <SignatureModal
                    onConfirm={handleSignatureConfirm}
                    onCancel={handleSignatureCancel}
                />
            )}
        </Layout>
    );
};

export default Buy;
