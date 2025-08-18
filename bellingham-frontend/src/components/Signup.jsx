import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import api from "../utils/api";

const Signup = () => {
    const [form, setForm] = useState({
        username: "",
        password: "",
        legalBusinessName: "",
        name: "",
        countryOfIncorporation: "",
        taxId: "",
        companyRegistrationNumber: "",
        primaryContactName: "",
        primaryContactEmail: "",
        primaryContactPhone: "",
        technicalContactName: "",
        technicalContactEmail: "",
        technicalContactPhone: "",
        companyDescription: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();


    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        try {
            await api.post(`/api/register`, form);
            setMessage("Registration successful. Please log in.");
            setForm({
                username: "",
                password: "",
                legalBusinessName: "",
                name: "",
                countryOfIncorporation: "",
                taxId: "",
                companyRegistrationNumber: "",
                primaryContactName: "",
                primaryContactEmail: "",
                primaryContactPhone: "",
                technicalContactName: "",
                technicalContactEmail: "",
                technicalContactPhone: "",
                companyDescription: "",
            });
        } catch (err) {
            console.error(err);
            setError("Registration failed.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-base text-contrast font-sans">
            <Header />
            <div className="relative flex flex-col flex-1 items-center justify-center">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                >
                    Back
                </button>
                <form onSubmit={handleSignup} className="bg-white shadow-lg rounded-2xl p-8 w-1/2">
                <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
                {message && <div className="text-green-600 mb-2">{message}</div>}
                {error && <div className="text-red-600 mb-2">{error}</div>}
                <input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-1/2 p-2 mb-4 border rounded-lg"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-1/2 p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Legal Business Name"
                    value={form.legalBusinessName}
                    onChange={(e) => setForm({ ...form, legalBusinessName: e.target.value })}
                    className="w-1/2 p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-1/2 p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Country of Incorporation"
                    value={form.countryOfIncorporation}
                    onChange={(e) => setForm({ ...form, countryOfIncorporation: e.target.value })}
                    className="w-1/2 p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="UK or US Tax ID Code"
                    value={form.taxId}
                    onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                    className="w-1/2 p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Company Registration Number"
                    value={form.companyRegistrationNumber}
                    onChange={(e) => setForm({ ...form, companyRegistrationNumber: e.target.value })}
                    className="w-1/2 p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Primary Contact Name"
                    value={form.primaryContactName}
                    onChange={(e) => setForm({ ...form, primaryContactName: e.target.value })}
                    className="w-1/2 p-2 mb-4 border rounded-lg"
                />
                <input
                    type="email"
                    placeholder="Primary Contact Email"
                    value={form.primaryContactEmail}
                    onChange={(e) => setForm({ ...form, primaryContactEmail: e.target.value })}
                    className="w-1/2 p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Primary Contact Phone"
                    value={form.primaryContactPhone}
                    onChange={(e) => setForm({ ...form, primaryContactPhone: e.target.value })}
                    className="w-1/2 p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Technical Contact Name"
                    value={form.technicalContactName}
                    onChange={(e) => setForm({ ...form, technicalContactName: e.target.value })}
                    className="w-1/2 p-2 mb-4 border rounded-lg"
                />
                <input
                    type="email"
                    placeholder="Technical Contact Email"
                    value={form.technicalContactEmail}
                    onChange={(e) => setForm({ ...form, technicalContactEmail: e.target.value })}
                    className="w-1/2 p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Technical Contact Phone"
                    value={form.technicalContactPhone}
                    onChange={(e) => setForm({ ...form, technicalContactPhone: e.target.value })}
                    className="w-1/2 p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="One line company description"
                    value={form.companyDescription}
                    onChange={(e) => setForm({ ...form, companyDescription: e.target.value })}
                    className="w-1/2 p-2 mb-6 border rounded-lg"
                />
                <button type="submit" className="w-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                    Register
                </button>
                <button
                    type="button"
                    className="w-1/2 mt-2 text-blue-600"
                    onClick={() => navigate("/login")}
                >
                    Back to Login
                </button>
            </form>
            </div>
        </div>
    );
};

export default Signup;
