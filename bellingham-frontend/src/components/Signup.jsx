import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/login.png";

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
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/register`,
                form
            );
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
        <div className="relative flex flex-col h-screen items-center justify-center bg-black text-white font-poppins">
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
            >
                Back
            </button>
            <img
                src={logoImage}
                alt="Bellingham Data Futures logo"
                className="h-[150px] w-[150px] mb-6"
            />
            <form onSubmit={handleSignup} className="bg-white shadow-lg rounded-2xl p-8 w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
                {message && <div className="text-green-600 mb-2">{message}</div>}
                {error && <div className="text-red-600 mb-2">{error}</div>}
                <input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Legal Business Name"
                    value={form.legalBusinessName}
                    onChange={(e) => setForm({ ...form, legalBusinessName: e.target.value })}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Country of Incorporation"
                    value={form.countryOfIncorporation}
                    onChange={(e) => setForm({ ...form, countryOfIncorporation: e.target.value })}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="UK or US Tax ID Code"
                    value={form.taxId}
                    onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Company Registration Number"
                    value={form.companyRegistrationNumber}
                    onChange={(e) => setForm({ ...form, companyRegistrationNumber: e.target.value })}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Primary Contact Name"
                    value={form.primaryContactName}
                    onChange={(e) => setForm({ ...form, primaryContactName: e.target.value })}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="email"
                    placeholder="Primary Contact Email"
                    value={form.primaryContactEmail}
                    onChange={(e) => setForm({ ...form, primaryContactEmail: e.target.value })}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Primary Contact Phone"
                    value={form.primaryContactPhone}
                    onChange={(e) => setForm({ ...form, primaryContactPhone: e.target.value })}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Technical Contact Name"
                    value={form.technicalContactName}
                    onChange={(e) => setForm({ ...form, technicalContactName: e.target.value })}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="email"
                    placeholder="Technical Contact Email"
                    value={form.technicalContactEmail}
                    onChange={(e) => setForm({ ...form, technicalContactEmail: e.target.value })}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="Technical Contact Phone"
                    value={form.technicalContactPhone}
                    onChange={(e) => setForm({ ...form, technicalContactPhone: e.target.value })}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="text"
                    placeholder="One line company description"
                    value={form.companyDescription}
                    onChange={(e) => setForm({ ...form, companyDescription: e.target.value })}
                    className="w-full p-2 mb-6 border rounded-lg"
                />
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                    Register
                </button>
                <button
                    type="button"
                    className="w-full mt-2 text-blue-600"
                    onClick={() => navigate("/login")}
                >
                    Back to Login
                </button>
            </form>
        </div>
    );
};

export default Signup;
