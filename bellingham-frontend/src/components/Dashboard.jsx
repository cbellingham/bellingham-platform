// src/components/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ContractDetailsPanel from "./ContractDetailsPanel";

const Dashboard = () => {
    const [contracts, setContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await axios.get("http://localhost:8080/api/contracts", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setContracts(res.data);
            } catch (err) {
                console.error("Error fetching contracts", err);
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        fetchContracts();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="flex flex-col h-screen font-poppins bg-black text-white">
            {/* Top Banner */}
            <header className="bg-gray-800 p-4">
                <h1 className="text-2xl font-bold">Bellingham Data Futures</h1>
            </header>
            <div className="flex flex-1 relative">
                {/* Sidebar */}
                <aside className="w-64 bg-gray-900 p-6 flex flex-col justify-between">
                    <nav className="flex flex-col space-y-4">
                        <button
                            onClick={() => navigate("/")}
                            className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => navigate("/buy")}
                            className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                        >
                            Buy
                        </button>
                        <button
                            onClick={() => navigate("/sell")}
                            className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                        >
                            Sell
                        </button>
                        <button
                            onClick={() => navigate("/reports")}
                            className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                        >
                            Reports
                        </button>
                        <button
                            onClick={() => alert("Settings screen not implemented yet")}
                            className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => alert("Account screen not implemented yet")}
                            className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                        >
                            Account
                        </button>
                    </nav>
                    <button
                        onClick={handleLogout}
                        className="mt-6 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
                    >
                        Log Out
                    </button>
                </aside>

                {/* Main Content */}
                <main
                    className={`flex-1 p-8 overflow-auto bg-black transition-all duration-300 ${
                        selectedContract ? "sm:mr-96" : ""
                    }`}
                >
                    <h2 className="text-3xl font-bold mb-6 text-white">Contracts</h2>
                    <table className="w-full table-auto border border-collapse border-gray-700 bg-gray-800 text-white shadow rounded">
                    <thead>
                    <tr className="bg-gray-700 text-left">
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Seller</th>
                        <th className="border p-2">Price</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Delivery</th>
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
                            <td className="border p-2">{contract.status}</td>
                            <td className="border p-2">{contract.deliveryDate}</td>
                        </tr>
                    ))}
                    </tbody>
                    </table>
                </main>
                <ContractDetailsPanel
                    contract={selectedContract}
                    onClose={() => setSelectedContract(null)}
                />
            </div>
        </div>
    );
};

export default Dashboard;
