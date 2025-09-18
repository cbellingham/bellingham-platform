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
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold mb-6">Contract History</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <table className="w-[90%] mx-auto table-auto border border-collapse border-gray-700 bg-gray-800 text-white shadow rounded">
                    <thead>
                        <tr className="bg-gray-700 text-left">
                            <th className="border p-2">Title</th>
                            <th className="border p-2">Seller</th>
                            <th className="border p-2">Buyer</th>
                            <th className="border p-2">Price</th>
                            <th className="border p-2">Delivery</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.map((c) => (
                            <tr
                                key={c.id}
                                className="hover:bg-gray-600 cursor-pointer"
                                onClick={() => setSelectedContract(c)}
                            >
                                <td className="border p-2">{c.title}</td>
                                <td className="border p-2">{c.seller}</td>
                                <td className="border p-2">{c.buyerUsername || "-"}</td>
                                <td className="border p-2">${c.price}</td>
                                <td className="border p-2">{c.deliveryDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <ContractDetailsPanel
                    inline
                    contract={selectedContract}
                    onClose={() => setSelectedContract(null)}
                />
            </main>
        </Layout>
    );
};

export default History;
