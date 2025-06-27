import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
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
                { username, password }
            );
            setMessage("Registration successful. Please log in.");
            setUsername("");
            setPassword("");
        } catch (err) {
            console.error(err);
            setError("Registration failed.");
        }
    };

    return (
        <div className="flex flex-col h-screen items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-center">Bellingham Data Futures</h1>
            <form onSubmit={handleSignup} className="bg-white shadow-lg rounded-2xl p-8 w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
                {message && <div className="text-green-600 mb-2">{message}</div>}
                {error && <div className="text-red-600 mb-2">{error}</div>}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
