import React, { useEffect, useState, useContext } from "react";
import Layout from "./Layout";
import ContractDetailsPanel from "./ContractDetailsPanel";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from '../context';

const Sales = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);

    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const res = await api.get(`/api/contracts/sold`);
                setContracts(res.data.content);
            } catch (err) {
                console.error(err);
                setError("Failed to load sold contracts.");
            }
        };
        fetchSales();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Layout onLogout={handleLogout}>
            <div className="flex flex-col gap-6 xl:flex-row">
                <section className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                    <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Seller Desk</p>
                        <h1 className="text-3xl font-bold text-white">Sold Contracts</h1>
                        <p className="text-sm text-slate-400">
                            Review recently executed sales and revisit the associated contract data for compliance.
                        </p>
                    </div>
                    {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
                    <div className="mt-6 overflow-hidden rounded-xl border border-slate-800/80">
                        <table className="w-full table-auto divide-y divide-slate-800 text-left text-sm text-slate-200">
                            <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Buyer</th>
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3">Delivery Date</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/70">
                                {contracts.map((c) => {
                                    const isSelected = selectedContract?.id === c.id;

                                    return (
                                        <tr
                                            key={c.id}
                                            className={`group cursor-pointer transition-colors ${isSelected ? "bg-emerald-500/15" : "bg-slate-950/40 hover:bg-emerald-500/10"}`}
                                            onClick={() => setSelectedContract(c)}
                                            aria-selected={isSelected}
                                        >
                                            <td className="px-4 py-3 font-semibold text-slate-100">
                                                <div className="flex items-center gap-2">
                                                    {isSelected && (
                                                        <span className="inline-flex items-center rounded-full border border-emerald-300/70 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
                                                            Selected
                                                        </span>
                                                    )}
                                                    <span>{c.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{c.buyerUsername}</td>
                                            <td className="px-4 py-3 font-semibold text-emerald-300">${c.price}</td>
                                            <td className="px-4 py-3 text-slate-300">{c.deliveryDate}</td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                                                    {c.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {contracts.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
                                            No sales have been recorded yet.
                                        </td>
                                    </tr>
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
        </Layout>
    );
};

export default Sales;
