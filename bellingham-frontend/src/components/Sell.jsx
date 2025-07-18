import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";

const defaultAgreement = `DATA PURCHASE AGREEMENT

Seller: [Seller's Full Legal Name], a [Entity Type] with a principal place of business at [Seller's Address]
Buyer: [Buyer’s Full Legal Name], a [Entity Type] with a principal place of business at [Buyer’s Address]

1. DEFINITIONS
1.1 "Data" means the dataset(s) or information described in Exhibit A.

1.2 "Confidential Information" means any non-public, proprietary information disclosed in connection with this Agreement.

2. SALE AND TRANSFER OF DATA
2.1 Data Transfer. Seller agrees to sell, and Buyer agrees to purchase, the Data described in Exhibit A.
2.2 Delivery. The Data will be delivered in [format] via [delivery method] within [number] business days of execution.
2.3 Acceptance. Buyer will have [X] business days to inspect and accept the Data.

3. PAYMENT TERMS
3.1 Purchase Price. Buyer shall pay Seller a total amount of $[amount] (the "Purchase Price").
3.2 Payment Schedule. Payment shall be made in full upon execution / [installments with milestones].
3.3 Taxes. Each Party shall be responsible for its own tax obligations.

4. WARRANTIES AND REPRESENTATIONS
4.1 Seller Warranties. Seller represents and warrants that it has full rights and authority to sell the Data; the Data is accurate to the best of its knowledge; the Data does not infringe upon any third-party rights.
4.2 Buyer Acknowledgement. Buyer understands the Data is provided "as-is," except as otherwise stated.

5. CONFIDENTIALITY
5.1 Non-Disclosure. Each Party agrees not to disclose any Confidential Information without the other Party's prior written consent.
5.2 Exceptions. Disclosure is permitted if required by law or with prior written approval.

6. LIMITATIONS AND LIABILITY
6.1 Limitation of Liability. Neither Party shall be liable for indirect, incidental, or consequential damages.
6.2 Indemnification. Each Party agrees to indemnify the other for any claims arising from a breach of this Agreement.

7. TERM AND TERMINATION
7.1 Term. This Agreement shall commence on the Effective Date and remain in effect unless terminated in accordance with this section.
7.2 Termination for Cause. Either Party may terminate this Agreement upon written notice in case of material breach.

8. MISCELLANEOUS
8.1 Governing Law. This Agreement shall be governed by the laws of the State of [State].
8.2 Entire Agreement. This document contains the entire agreement between the Parties.
8.3 Amendments. Any changes to this Agreement must be in writing and signed by both Parties.
8.4 Assignment. Neither Party may assign its rights under this Agreement without the other Party's written consent.`;
import axios from "axios";

const Sell = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        deliveryDate: "",
        title: "",
        price: "",
        dataDescription: "",
        agreementText: defaultAgreement,
    });
    const [snippet, setSnippet] = useState(null);
    const [message, setMessage] = useState("");
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/contracts/my`,
                    config
                );
                setContracts(res.data.content);
            } catch (err) {
                console.error(err);
                setError("Failed to load contracts.");
            }
        };
        fetchContracts();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setSnippet(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        const data = {
            title: form.title,
            deliveryDate: form.deliveryDate,
            price: parseFloat(form.price || 0),
            dataDescription: form.dataDescription,
            agreementText: form.agreementText,
        };
        if (snippet) {
            data.termsFileName = snippet.name;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/contracts`,
                data,
                config
            );
            setMessage("✅ Data contract submitted!");
            setForm({
                deliveryDate: "",
                title: "",
                price: "",
                dataDescription: "",
                agreementText: defaultAgreement,
            });
            setSnippet(null);
        } catch (err) {
            setMessage("❌ Submission failed.");
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
    };

    const fetchBids = async (contractId) => {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/contracts/${contractId}/bids`,
            config
        );
        return res.data;
    };

    const handleViewBids = async (contract) => {
        try {
            const bids = await fetchBids(contract.id);
            if (bids.length === 0) {
                alert("No bids yet.");
                return;
            }
            const list = bids.map((b) => `${b.id}: ${b.bidderUsername} $${b.amount} [${b.status}]`).join("\n");
            const selected = prompt(`Bids for ${contract.title}:\n${list}\nEnter bid id to accept`);
            if (!selected) return;
            await handleAcceptBid(contract.id, selected);
        } catch (err) {
            console.error(err);
            alert("Failed to load bids");
        }
    };

    const handleAcceptBid = async (contractId, bidId) => {
        try {
            const token = localStorage.getItem("token");
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/contracts/${contractId}/bids/${bidId}/accept`,
                {},
                config
            );
            alert("Bid accepted");
        } catch (err) {
            console.error(err);
            alert("Failed to accept bid");
        }
    };

    return (
        <Layout onLogout={handleLogout}>
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold mb-6">Sell Your Data Contract</h1>
                    {message && <p className="mb-4">{message}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                <div>
                    <label>Delivery Date</label>
                    <input
                        type="date"
                        name="deliveryDate"
                        value={form.deliveryDate}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Title</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Ask Price ($)</label>
                    <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Data Description</label>
                    <input
                        type="text"
                        name="dataDescription"
                        value={form.dataDescription}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Data Purchase Agreement</label>
                    <textarea
                        name="agreementText"
                        value={form.agreementText}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        rows="10"
                    />
                </div>
                <div>
                    <label>Upload Data Snippet</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        accept=".csv,.json,.txt"
                    />
                </div>
                <button type="submit" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
                    Submit Contract
                </button>
            </form>

            <h2 className="text-2xl font-bold mt-10 mb-4">My Contracts</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <table className="w-full table-auto border border-collapse border-gray-700 bg-gray-800 text-white shadow rounded">
                <thead>
                    <tr className="bg-gray-700 text-left">
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Buyer</th>
                        <th className="border p-2">Ask Price</th>
                        <th className="border p-2">Delivery</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {contracts.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-600">
                            <td className="border p-2">{c.title}</td>
                            <td className="border p-2">{c.buyerUsername || "-"}</td>
                            <td className="border p-2">${c.price}</td>
                            <td className="border p-2">{c.deliveryDate}</td>
                            <td className="border p-2">{c.status}</td>
                            <td className="border p-2">
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                                    onClick={() => handleViewBids(c)}
                                >
                                    View Bids
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
        </Layout>
    );
};

export default Sell;
