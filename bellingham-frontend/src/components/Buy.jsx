// src/components/Buy.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import ContractDetailsPanel from "./ContractDetailsPanel";

const Buy = () => {
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/contracts/available`,
                    config
                );
                setContracts(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch contracts.");
            }
        };
        fetchContracts();
    }, []);

    const handleBuy = async (contractId) => {
        try {
            const token = localStorage.getItem("token");
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/contracts/${contractId}/buy`,
                {},
                config
            );
            alert("Contract purchased successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to purchase contract.");
        }
    };

    return (
        <div className="relative p-8 text-white bg-black min-h-screen font-poppins">
            <h1 className="text-3xl font-bold mb-6">Available Contracts</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contracts.map((contract) => (
                    <div
                        key={contract.id}
                        className="bg-gray-800 p-6 rounded shadow cursor-pointer"
                        onClick={() => setSelectedContract(contract)}
                    >
                        <h2 className="text-xl font-semibold mb-2">{contract.title}</h2>
                        <p className="text-sm text-gray-400 mb-1">Category: {contract.category}</p>
                        <p className="text-sm text-gray-400 mb-1">End Date: {contract.deliveryDate}</p>
                        <p className="text-sm text-gray-400 mb-4">Price: ${contract.price}</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleBuy(contract.id); }}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
                        >
                            Buy Contract
                        </button>
                    </div>
                ))}
            </div>
            <ContractDetailsPanel
                contract={selectedContract}
                onClose={() => setSelectedContract(null)}
            />
        </div>
    );
};

export default Buy;
