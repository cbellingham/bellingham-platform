// src/components/Buy.jsx

import React, { useCallback, useEffect, useState, useContext } from "react";
import api from "../utils/api";
import { AuthContext } from '../context';
import ContractDetailsPanel from "./ContractDetailsPanel";
import Layout from "./Layout";
import Button from "./ui/Button";
import { useNavigate } from "react-router-dom";
import SignatureModal from "./SignatureModal";
import BidModal from "./BidModal";
import NotificationBanner from "./NotificationBanner";

const Buy = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [notification, setNotification] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sellerFilter, setSellerFilter] = useState("");

    const { logout } = useContext(AuthContext);

    const fetchContracts = useCallback(async () => {
        try {
            const res = await api.get(`/api/contracts/available`);
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
    }, []);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    const [showSignature, setShowSignature] = useState(false);
    const [pendingBuyId, setPendingBuyId] = useState(null);
    const [showBidModal, setShowBidModal] = useState(false);
    const [pendingBidId, setPendingBidId] = useState(null);

    const handleBuy = (contractId) => {
        setNotification(null);
        setPendingBuyId(contractId);
        setShowSignature(true);
    };

    const confirmBuy = async (signature) => {
        const contractId = pendingBuyId;
        if (!contractId) {
            setNotification({ type: "error", message: "We couldn't determine which contract to purchase." });
            setShowSignature(false);
            setPendingBuyId(null);
            return;
        }

        try {
            const response = await api.post(`/api/contracts/${contractId}/buy`, { signature });
            const purchased = response?.data;
            setNotification({
                type: "success",
                message: purchased?.title
                    ? `Contract "${purchased.title}" purchased successfully!`
                    : "Contract purchased successfully!",
            });
            await fetchContracts();
            setSelectedContract((prev) => (prev && prev.id === contractId ? null : prev));
        } catch (err) {
            console.error(err);
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message || "Failed to purchase contract.";
            setNotification({
                type: "error",
                message: status ? `Unable to complete purchase (${status}): ${message}` : message,
            });
        } finally {
            setShowSignature(false);
            setPendingBuyId(null);
        }
    };

    const handleBid = (contractId) => {
        setNotification(null);
        setPendingBidId(contractId);
        setShowBidModal(true);
    };

    const submitBid = async (amount) => {
        const contractId = pendingBidId;

        if (!contractId) {
            setNotification({ type: "error", message: "We couldn't determine which contract to bid on." });
            setShowBidModal(false);
            setPendingBidId(null);
            return;
        }

        try {
            await api.post(`/api/contracts/${contractId}/bid`, { amount });
            setNotification({
                type: "success",
                message: `Bid of $${amount} submitted successfully.`,
            });
            await fetchContracts();
        } catch (err) {
            console.error(err);
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message || "Failed to submit bid.";
            setNotification({
                type: "error",
                message: status ? `Unable to submit bid (${status}): ${message}` : message,
            });
        } finally {
            setShowBidModal(false);
            setPendingBidId(null);
        }
    };

    const handleLogout = () => {
        logout();
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
        <>
        <Layout onLogout={handleLogout}>
            <main className="flex-1 p-8 overflow-auto">
                <h1 className="text-3xl font-bold mb-6">Available Contracts</h1>
                {notification && (
                    <NotificationBanner
                        type={notification.type}
                        message={notification.message}
                        onDismiss={() => setNotification(null)}
                    />
                )}
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
                                    <td className="border p-2">
                                        <Button
                                            variant="success"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBuy(contract.id);
                                            }}
                                            className="px-2 py-1"
                                        >
                                            Buy
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBid(contract.id);
                                            }}
                                            className="ml-2 px-2 py-1"
                                        >
                                            Bid
                                        </Button>
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
        </Layout>
        {showSignature && (
            <SignatureModal
                onConfirm={confirmBuy}
                onCancel={() => setShowSignature(false)}
            />
        )}
        {showBidModal && (
            <BidModal
                onConfirm={submitBid}
                onCancel={() => setShowBidModal(false)}
            />
        )}
        </>
    );
};

export default Buy;
