import React, { useEffect, useState } from "react";
import axios from "axios";
import ContractDetailsPanel from "./ContractDetailsPanel";

const Reports = () => {
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [selectedContract, setSelectedContract] = useState(null);

    const totalValue = contracts.reduce(
        (sum, contract) => sum + Number(contract.price || 0),
        0
    );

    useEffect(() => {
        const fetchPurchased = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get(
                    "http://localhost:8080/api/contracts/purchased",
                    config
                );
                setContracts(res.data);
            } catch {
                setError("Failed to load purchased contracts.");
            }
        };
        fetchPurchased();
    }, []);

    return (
        <div className="relative p-8 text-white bg-black min-h-screen font-poppins">
            <h1 className="text-3xl font-bold mb-6">Purchased Contracts</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <table className="w-full table-auto border border-collapse border-gray-700 bg-gray-800 text-white shadow rounded">
                <thead>
                    <tr className="bg-gray-700 text-left">
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Seller</th>
                        <th className="border p-2">Price</th>
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
                            <td className="border p-2">{contract.deliveryDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="mt-4 text-lg font-semibold">
                Total Value: ${totalValue.toFixed(2)}
            </p>
            <ContractDetailsPanel
                contract={selectedContract}
                onClose={() => setSelectedContract(null)}
            />
        </div>
    );
};

export default Reports;
