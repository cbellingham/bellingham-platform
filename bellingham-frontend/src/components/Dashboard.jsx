// src/components/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
    const [contracts, setContracts] = useState([]);
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
        <div className="flex h-screen font-poppins bg-black text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 p-6 flex flex-col justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-poppins">Bellingham Data Forwards</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Hedge Against Data Cost Volatility
                    </p>
                    <nav className="flex flex-col space-y-4 mt-8">
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
                            onClick={() => navigate("/")}
                            className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                        >
                            Existing Contracts
                        </button>
                        <button
                            onClick={() => alert("Reports screen not implemented yet")}
                            className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                        >
                            Reports
                        </button>
                        <button
                            onClick={() => alert("Account screen not implemented yet")}
                            className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                        >
                            Account
                        </button>
                        <button
                            onClick={() => alert("Settings screen not implemented yet")}
                            className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                        >
                            Settings
                        </button>
                    </nav>
                </div>
                <button
                    onClick={handleLogout}
                    className="mt-6 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
                >
                    Log Out
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto bg-black">
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
                        <tr key={contract.id} className="hover:bg-gray-600">
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
        </div>
    );
};

export default Dashboard;
