import React, { useEffect, useState, useContext, useMemo } from "react";
import Layout from "./Layout";
import ContractDetailsPanel from "./ContractDetailsPanel";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from '../context';
import TableSkeleton from "./ui/TableSkeleton";

const Sales = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                setIsLoading(true);
                const res = await api.get(`/api/contracts/sold`);
                setContracts(res.data.content);
            } catch (err) {
                console.error(err);
                setError("Failed to load sold contracts.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSales();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const statuses = useMemo(
        () =>
            Array.from(
                new Set(contracts.map((contract) => contract.status).filter(Boolean))
            ),
        [contracts]
    );

    const filteredContracts = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return contracts.filter((contract) => {
            const matchesSearch =
                !normalizedSearch ||
                contract.title.toLowerCase().includes(normalizedSearch) ||
                (contract.buyerUsername || "")
                    .toLowerCase()
                    .includes(normalizedSearch);

            const matchesStatus = !statusFilter || contract.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [contracts, searchTerm, statusFilter]);

    return (
        <Layout onLogout={handleLogout}>
            <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:flex-row xl:gap-8">
                <section className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 md:p-7 lg:p-8 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                    <div className="space-y-5 sm:space-y-6 lg:space-y-7">
                        <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Seller Desk</p>
                            <h1 className="text-3xl font-bold text-white">Sold Contracts</h1>
                            <p className="text-sm text-slate-400">
                                Review recently executed sales and revisit the associated contract data for compliance.
                            </p>
                        </div>
                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
                            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 max-w-xs">
                                Search
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Title or buyer"
                                    className="w-full max-w-xs rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none"
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 max-w-xs">
                                Status
                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="w-full max-w-xs rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none"
                                >
                                    <option value="">All Statuses</option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-slate-800/80">
                            <table className="w-full table-auto divide-y divide-slate-800 text-left text-sm text-slate-200">
                                <thead className="sticky top-0 z-10 bg-slate-900/90 text-xs uppercase tracking-[0.18em] text-slate-400 backdrop-blur">
                                    <tr>
                                        <th className="px-4 py-3 md:px-5 md:py-3.5">Title</th>
                                        <th className="px-4 py-3 md:px-5 md:py-3.5">Buyer</th>
                                        <th className="px-4 py-3 md:px-5 md:py-3.5">Price</th>
                                        <th className="px-4 py-3 md:px-5 md:py-3.5">Delivery Date</th>
                                        <th className="px-4 py-3 md:px-5 md:py-3.5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {isLoading ? (
                                        <TableSkeleton columns={5} rows={5} />
                                    ) : (
                                        filteredContracts.map((c) => {
                                            const isSelected = selectedContract?.id === c.id;

                                            return (
                                                <tr
                                                    key={c.id}
                                                    className={`group cursor-pointer transition-colors ${
                                                        isSelected
                                                            ? "bg-[#00D1FF]/15"
                                                            : "bg-slate-950/40 hover:bg-[#7465A8]/12"
                                                    }`}
                                                    onClick={() => setSelectedContract(c)}
                                                    aria-selected={isSelected}
                                                >
                                                    <td className="px-4 py-3 md:px-5 md:py-3.5 font-semibold text-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            {isSelected && (
                                                                <span className="inline-flex items-center rounded-full border border-[#00D1FF]/60 bg-[#00D1FF]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00D1FF]">
                                                                    Selected
                                                                </span>
                                                            )}
                                                            <span>{c.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 md:px-5 md:py-3.5">{c.buyerUsername}</td>
                                                    <td className="px-4 py-3 md:px-5 md:py-3.5 font-semibold text-[#3BAEAB] font-mono tabular-nums">${c.price}</td>
                                                    <td className="px-4 py-3 md:px-5 md:py-3.5 text-slate-300">{c.deliveryDate}</td>
                                                    <td className="px-4 py-3 md:px-5 md:py-3.5">
                                                        <span className="rounded-full border border-[#00D1FF]/40 bg-[#00D1FF]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#00D1FF]">
                                                            {c.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    {!isLoading && filteredContracts.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
                                                No contracts match your current filters.
                                            </td>
                                        </tr>
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
        </Layout>
    );
};

export default Sales;
