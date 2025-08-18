// src/components/Login.jsx

import React, { useState } from "react";
import axios from "axios";
import LoginImage from "../assets/login.png";
import { safeSetItem } from "../utils/storage";
import Button from "./ui/Button";

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
        <div className="flex flex-col min-h-screen items-center justify-center">
            <div className="flex flex-col items-center justify-center">
                <img
                    src={LoginImage}
                    alt="Bellingham Data Futures logo"
                    className="h-32 w-32 mb-4"
                />
                <form
                    onSubmit={handleLogin}
                    className="bg-white bg-opacity-90 shadow-lg rounded-2xl p-8 w-96 flex flex-col items-center"
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
                <Button type="submit" className="w-full rounded-lg" variant="primary">
                    Sign In
                </Button>
                <Button
                    type="button"
                    variant="link"
                    className="w-full mt-2"
                    onClick={() => (window.location.href = "/signup")}
                >
                    Create Account
                </Button>
            </form>
        </div>
    </div>
        );
};

export default Login;


