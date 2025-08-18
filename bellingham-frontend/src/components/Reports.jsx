import React, { useEffect, useState, useContext } from "react";
import ContractDetailsPanel from "./ContractDetailsPanel";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const Reports = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);

    const totalValue = contracts.reduce(
        (sum, contract) => sum + Number(contract.price || 0),
        0
    );

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
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleListForSale(contract.id);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                                >
                                    List for Sale
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCloseout(contract.id);
                                    }}
                                    className="ml-2 bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                                >
                                    Closeout
                                </button>
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
