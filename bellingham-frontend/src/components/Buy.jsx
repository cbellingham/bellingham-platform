// src/components/Buy.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const Buy = () => {
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:8080/api/contracts/available", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setContracts(res.data);
            } catch (err) {
                setError("Failed to fetch contracts.");
            }
        };
        fetchContracts();
    }, []);

    const handleBuy = async (contractId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:8080/api/contracts/${contractId}/buy`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Contract purchased successfully!");
        } catch (err) {
            alert("Failed to purchase contract.");
        }
    };

    return (
        <div className="p-8 text-white bg-black min-h-screen font-poppins">
            <h1 className="text-3xl font-bold mb-6">Available Contracts</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contracts.map((contract) => (
                    <div key={contract.id} className="bg-gray-800 p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">{contract.title}</h2>
                        <p className="text-sm text-gray-400 mb-1">Category: {contract.category}</p>
                        <p className="text-sm text-gray-400 mb-1">End Date: {contract.deliveryDate}</p>
                        <p className="text-sm text-gray-400 mb-4">Price: ${contract.price}</p>
                        <button
                            onClick={() => handleBuy(contract.id)}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
                        >
                            Buy Contract
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Buy;
