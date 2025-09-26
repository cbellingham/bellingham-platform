import React, { useEffect, useState, useContext } from "react";
import Layout from "./Layout";
import ContractDetailsPanel from "./ContractDetailsPanel";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from '../context';

const History = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);

    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/api/contracts/history`);
                setContracts(res.data.content);
            } catch (err) {
                console.error(err);
                setError("Failed to load contract history.");
            }
        };
        fetchHistory();
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
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Audit Trail</p>
                        <h1 className="text-3xl font-bold text-white">Contract History</h1>
                        <p className="text-sm text-slate-400">
                            A complete ledger of executed contracts across the platform with buyer and seller visibility.
                        </p>
                    </div>
                    {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
                    <div className="mt-6 overflow-hidden rounded-xl border border-slate-800/80">
                        <table className="w-full table-auto divide-y divide-slate-800 text-left text-sm text-slate-200">
                            <thead className="sticky top-0 z-10 bg-slate-900/90 text-xs uppercase tracking-[0.18em] text-slate-400 backdrop-blur">
                                <tr>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Seller</th>
                                    <th className="px-4 py-3">Buyer</th>
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3">Delivery</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/70">
                                {contracts.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="cursor-pointer bg-slate-950/40 transition-colors hover:bg-[#00D1FF]/10"
                                        onClick={() => setSelectedContract(c)}
                                    >
                                        <td className="px-4 py-3 font-semibold text-slate-100">{c.title}</td>
                                        <td className="px-4 py-3">{c.seller}</td>
                                        <td className="px-4 py-3">{c.buyerUsername || "-"}</td>
                                        <td className="px-4 py-3 font-semibold text-[#3BAEAB]">${c.price}</td>
                                        <td className="px-4 py-3 text-slate-300">{c.deliveryDate}</td>
                                    </tr>
                                ))}
                                {contracts.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
                                            No historical contracts are available right now.
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

export default History;
