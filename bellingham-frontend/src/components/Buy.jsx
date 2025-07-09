// src/components/Buy.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import ContractDetailsPanel from "./ContractDetailsPanel";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const Buy = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);
    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sellerFilter, setSellerFilter] = useState("");

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/contracts/available`,
                    config
                );
                setContracts(res.data.content);
            } catch (err) {
                console.error(err);
                if (err.response) {
                    const status = err.response.status;
                    const message = err.response.data?.message || err.message || "";
                    setError(
                        `Failed to fetch contracts (${status}${message ? `: ${message}` : ""})`
                    );
                } else {
                    setError("Failed to fetch contracts");
                }
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

    const handleBid = async (contractId) => {
        const price = prompt("Enter your bid price");
        if (!price) return;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must sign in to place a bid.");
            navigate("/login");
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/contracts/${contractId}/bids`,
                { amount: parseFloat(price) },
                config
            );
            alert("Bid submitted!");
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 400) {
                alert("Failed to submit bid: contract is not available.");
            } else if (err.response && err.response.status === 401) {
                alert("Session expired. Please sign in again.");
                navigate("/login");
            } else {
                alert("Failed to submit bid.");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
    };

    const sellers = Array.from(
        new Set(contracts.map((c) => c.seller).filter(Boolean))
    );

    const filteredContracts = contracts.filter((contract) => {
        const term = search.toLowerCase();
        const matchesSearch =
            contract.title.toLowerCase().includes(term) ||
            (contract.seller || "").toLowerCase().includes(term);
        const price = Number(contract.price || 0);
        const matchesMin = !minPrice || price >= Number(minPrice);
        const matchesMax = !maxPrice || price <= Number(maxPrice);
        const matchesSeller = !sellerFilter || contract.seller === sellerFilter;
        return matchesSearch && matchesMin && matchesMax && matchesSeller;
    });

    return (
        <div className="flex flex-col min-h-screen font-poppins bg-black text-white">
            <Header />
            <div className="flex flex-1 relative gap-6">
                <Sidebar onLogout={handleLogout} />
                <main className="flex-1 p-8 overflow-auto bg-black">
                    <h1 className="text-3xl font-bold mb-6">Available Contracts</h1>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="mb-4 flex flex-wrap gap-4">
                        <input
                            type="text"
                            placeholder="Search by title or seller"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="p-2 bg-gray-800 rounded"
                        />
                        <input
                            type="number"
                            placeholder="Min Price"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="p-2 bg-gray-800 rounded w-24"
                        />
                        <input
                            type="number"
                            placeholder="Max Price"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="p-2 bg-gray-800 rounded w-24"
                        />
                        <select
                            value={sellerFilter}
                            onChange={(e) => setSellerFilter(e.target.value)}
                            className="p-2 bg-gray-800 rounded"
                        >
                            <option value="">All Sellers</option>
                            {sellers.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                    <table className="w-full table-auto border border-collapse border-gray-700 bg-gray-800 text-white shadow rounded">
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
                            {filteredContracts.map((contract) => (
                                <tr
                                    key={contract.id}
                                    className="hover:bg-gray-600 cursor-pointer"
                                    onClick={() => setSelectedContract(contract)}
                                >
                                    <td className="border p-2">{contract.title}</td>
                                    <td className="border p-2">{contract.seller}</td>
                                    <td className="border p-2">${contract.price}</td>
                                    <td className="border p-2">{contract.deliveryDate}</td>
                                    <td className="border p-2 space-x-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBuy(contract.id);
                                            }}
                                            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                                        >
                                            Buy
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBid(contract.id);
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                                        >
                                            Bid
                                        </button>
                                    </td>
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
            </div>
        </div>
    );
};

export default Buy;
