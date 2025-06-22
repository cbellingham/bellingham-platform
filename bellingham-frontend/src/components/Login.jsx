// src/components/Login.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        try {
            const res = await axios.post("http://localhost:8080/api/authenticate", {
                username,
                password,
            });

            console.log("✅ Login API success:", res.data);

            const token = res.data.id_token;
            if (token) {
                localStorage.setItem("token", token);

                // Force full page reload to refresh state
                window.location.href = "/";
            } else {
                setError("Login failed: No token received.");
            }
        } catch (err) {
            console.error("❌ Login Error:", err);
            if (err.response && err.response.status === 403) {
                setError("Invalid username or password.");
            } else {
                setError("Login failed. Please try again.");
            }
        }
    };

    return (
        <div className="flex flex-col h-screen items-center justify-center bg-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Bellingham Data Futures
            </h1>
            <form
                onSubmit={handleLogin}
                className="bg-white shadow-lg rounded-2xl p-8 w-96"
            >
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
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
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                >
                    Sign In
                </button>
            </form>
        </div>
    );
};

export default Login;


