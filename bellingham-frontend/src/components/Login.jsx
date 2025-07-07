// src/components/Login.jsx

import React, { useState } from "react";
import axios from "axios";
import LoginImage from "../assets/login.png";
import { safeSetItem } from "../utils/storage";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/authenticate`,
                {
                username,
                password,
                }
            );

            console.log("✅ Login API success:", res.data);

            const token = res.data.id_token;
            if (token) {
                if (!safeSetItem("token", token) || !safeSetItem("username", username)) {
                    console.error("Failed to store credentials");
                    setError("Login failed: unable to store credentials.");
                    return;
                }

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
        <div
            className="relative flex flex-col items-center justify-center h-screen"
            style={{
                backgroundImage: `url(${LoginImage})`,
                backgroundSize: "150px",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "bottom right",
            }}
        >
            <div className="absolute inset-0 bg-black opacity-60" />
            <form
                onSubmit={handleLogin}
                className="relative z-10 bg-white bg-opacity-90 shadow-lg rounded-2xl p-8 w-96"
            >
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
                <button
                    type="button"
                    className="w-full mt-2 text-blue-600"
                    onClick={() => (window.location.href = "/signup")}
                >
                    Create Account
                </button>
            </form>
        </div>
    );
};

export default Login;


