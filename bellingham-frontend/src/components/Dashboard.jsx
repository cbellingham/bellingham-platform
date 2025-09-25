// src/components/Dashboard.jsx

import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ContractDetailsPanel from "./ContractDetailsPanel";
import Layout from "./Layout";
import api from "../utils/api";
import { AuthContext } from '../context';
import TableSkeleton from "./ui/TableSkeleton";

const Dashboard = () => {
    const [contracts, setContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const { isAuthenticated, logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                if (!isAuthenticated) {
                    navigate("/login");
                    return;
                }
                setIsLoading(true);
                const res = await api.get(`/api/contracts/available`);
                setContracts(res.data.content);
            } catch (err) {
                console.error("Error fetching contracts", err);
                logout();
                navigate("/login");
            } finally {
                setIsLoading(false);
            }
        };

        fetchContracts();
    }, [isAuthenticated, logout, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Layout onLogout={handleLogout}>
            <div className="flex flex-col gap-6 xl:flex-row">
                <main className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                    <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Market Overview</p>
                        <h2 className="text-3xl font-bold text-white">Open Contracts</h2>
                        <p className="text-sm text-slate-400">
                            Monitor current opportunities and select a contract to inspect the full trade details.
                        </p>
                    </div>
                    <div className="mt-6 overflow-hidden rounded-xl border border-slate-800/80">
                        <table className="w-full table-auto divide-y divide-slate-800 text-left text-sm text-slate-200">
                            <thead className="sticky top-0 z-10 bg-slate-900/90 text-xs uppercase tracking-[0.18em] text-slate-400 backdrop-blur">
                                <tr>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Seller</th>
                                    <th className="px-4 py-3">Ask Price</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Delivery</th>
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
                                                className="cursor-pointer bg-slate-950/40 transition-colors hover:bg-emerald-500/10"
                                                onClick={() => setSelectedContract(contract)}
                                            >
                                                <td className="px-4 py-3 font-semibold text-slate-100">{contract.title}</td>
                                                <td className="px-4 py-3">{contract.seller}</td>
                                                <td className="px-4 py-3 font-semibold text-emerald-300">
                                                    ${contract.price}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                                                        {contract.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">{contract.deliveryDate}</td>
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
                </main>
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

export default Dashboard;
