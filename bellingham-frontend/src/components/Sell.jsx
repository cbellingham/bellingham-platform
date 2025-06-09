import React, { useState } from "react";
import axios from "axios";

const Sell = () => {
    const [form, setForm] = useState({
        deliveryDate: "",
        type: "",
        price: "",
        size: "",
    });
    const [snippet, setSnippet] = useState(null);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setSnippet(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const data = new FormData();
        data.append("deliveryDate", form.deliveryDate);
        data.append("type", form.type);
        data.append("price", form.price);
        data.append("size", form.size);
        if (snippet) data.append("snippet", snippet);

        try {
            await axios.post("http://localhost:8080/api/contracts", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            setMessage("✅ Data contract submitted!");
            setForm({ deliveryDate: "", type: "", price: "", size: "" });
            setSnippet(null);
        } catch (err) {
            setMessage("❌ Submission failed.");
            console.error(err);
        }
    };

    return (
        <div className="p-8 bg-black min-h-screen text-white font-poppins">
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
                    <label>Type of Data</label>
                    <input
                        type="text"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
                    />
                </div>
                <div>
                    <label>Initial Price ($)</label>
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
                    <label>Size of Data (e.g. MB/GB)</label>
                    <input
                        type="text"
                        name="size"
                        value={form.size}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 bg-gray-800 rounded"
                        required
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
        </div>
    );
};

export default Sell;
