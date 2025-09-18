// src/components/Login.jsx

import React, { useState, useContext } from "react";
import LoginImage from "../assets/login.png";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from '../context';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await api.post(`/api/authenticate`, { username, password });
            const token = res.data.id_token;
            if (token) {
                login(token, username);
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


