// src/components/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ContractDetailsPanel from "./ContractDetailsPanel";
import Header from "./Header";
import Sidebar from "./Sidebar";

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

                const config = token
                    ? { headers: { Authorization: `Bearer ${token}` } }
                    : {};
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/contracts/available`,
                    config
                );

                setContracts(res.data.content);
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
        localStorage.removeItem("username");
        navigate("/login");
    };

    return (
        <div className="flex flex-col h-screen font-poppins bg-black text-white">
            <Header />
            <div className="flex flex-1 relative gap-6">
                {/* Sidebar */}
                <Sidebar onLogout={handleLogout} />

                {/* Main Content */}
                <main className="flex-1 p-8 overflow-auto bg-black">
                    <h2 className="text-3xl font-bold mb-6 text-white">Open Contracts</h2>
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
                    inline
                    inlineWidth="w-full sm:w-1/3"
                    contract={selectedContract}
                    onClose={() => setSelectedContract(null)}
                />
            </div>
        </div>
    );
};

export default Dashboard;
