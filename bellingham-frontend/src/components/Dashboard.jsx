// src/components/Dashboard.jsx

import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ContractDetailsPanel from "./ContractDetailsPanel";
import Layout from "./Layout";
import api from "../utils/api";
import { AuthContext } from '../context';

const Dashboard = () => {
    const [contracts, setContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const navigate = useNavigate();

    const { token, logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                if (!token) {
                    navigate("/login");
                    return;
                }
                const res = await api.get(`/api/contracts/available`);
                setContracts(res.data.content);
            } catch (err) {
                console.error("Error fetching contracts", err);
                logout();
                navigate("/login");
            }
        };

        fetchContracts();
    }, [navigate, token, logout]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Layout onLogout={handleLogout}>
            <main className="flex-1 p-8 overflow-auto">
                <h2 className="text-3xl font-bold mb-6 text-white">Open Contracts</h2>
                <table className="w-[90%] mx-auto table-auto border border-collapse border-gray-700 bg-gray-800 text-white shadow rounded">
                    <thead>
                    <tr className="bg-gray-700 text-left">
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Seller</th>
                        <th className="border p-2">Ask Price</th>
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
        </Layout>
    );
};

export default Dashboard;
