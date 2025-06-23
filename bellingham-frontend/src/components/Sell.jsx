import React, { useState } from "react";
import axios from "axios";

const Sell = () => {
    const [form, setForm] = useState({
        deliveryDate: "",
        title: "",
        price: "",
        dataDescription: "",
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

        const data = {
            title: form.title,
            deliveryDate: form.deliveryDate,
            price: parseFloat(form.price || 0),
            dataDescription: form.dataDescription,
        };
        if (snippet) {
            data.termsFileName = snippet.name;
        }

        try {
            await axios.post("http://localhost:8080/api/contracts", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessage("✅ Data contract submitted!");
            setForm({ deliveryDate: "", title: "", price: "", dataDescription: "" });
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
