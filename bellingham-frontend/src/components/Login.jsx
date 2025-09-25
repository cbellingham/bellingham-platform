// src/components/Login.jsx

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from "../context";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState(false);

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setAuthError(false);

        try {
            const res = await api.post(`/api/authenticate`, { username, password });
            const { username: responseUsername, expiresAt } = res.data || {};
            if (responseUsername && expiresAt) {
                login({ username: responseUsername, expiresAt });
                navigate("/");
            } else {
                setError("Login failed: Invalid session response.");
            }
        } catch (err) {
            console.error("❌ Login Error:", err);
            if (err.response && err.response.status === 403) {
                setError("Invalid username or password.");
                setAuthError(true);
            } else {
                setError("Login failed. Please try again.");
            }
        }
    };

    const inputBaseClasses =
        "w-full rounded-lg border bg-slate-900/70 px-4 py-3 text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2";
    const inputStateClasses = authError
        ? "border-red-500/70 focus:border-red-400 focus:ring-red-500/40"
        : "border-slate-700/80 focus:border-sky-400 focus:ring-sky-500/50";

    return (
        <div
            className="min-h-screen text-contrast"
            style={{
                backgroundColor: 'var(--bg-color)',
                backgroundImage: 'var(--bg-gradient)',
            }}
        >
            <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
                <div className="relative w-full overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/70 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.9)] backdrop-blur">
                    <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
                        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-600/40 blur-3xl" />
                        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl" />
                    </div>
                    <div className="relative grid gap-12 p-10 md:grid-cols-2 lg:p-16">
                        <div className="flex flex-col justify-between gap-8">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                                    Bellingham Data Futures
                                </p>
                                <h1 className="text-3xl font-semibold text-slate-50 sm:text-4xl">
                                    Welcome back.
                                </h1>
                            </div>
                            <div className="space-y-4 text-slate-300">
                                <p className="text-base leading-relaxed">
                                    Sign in to access your energy market dashboards, manage live bids, and
                                    collaborate with your team in real time.
                                </p>
                                <ul className="space-y-3 text-sm text-slate-400">
                                    <li className="flex items-start gap-3">
                                        <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-400" />
                                        <span>Track portfolio performance with high-contrast visualisations.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-cyan-400" />
                                        <span>Coordinate bids and settlements securely from a single control room.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-400" />
                                        <span>Receive proactive alerts before market deadlines hit.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="text-sm text-slate-500">
                                Need a trading workspace for your organisation?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/signup")}
                                    className="font-medium text-sky-400 transition hover:text-sky-300"
                                >
                                    Request access
                                </button>
                            </div>
                        </div>
                        <form
                            onSubmit={handleLogin}
                            className="flex flex-col gap-6 rounded-2xl border border-slate-800/60 bg-slate-950/70 p-8 shadow-lg"
                        >
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-50">Sign in</h2>
                                <p className="mt-2 text-sm text-slate-400">
                                    Use your Bellingham credentials to continue.
                                </p>
                            </div>
                            {error && <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
                            <div className="space-y-2">
                                <label htmlFor="username" className="text-sm font-medium text-slate-300">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        if (authError) {
                                            setAuthError(false);
                                        }
                                    }}
                                    className={`${inputBaseClasses} ${inputStateClasses}`}
                                    aria-invalid={authError || undefined}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (authError) {
                                                setAuthError(false);
                                            }
                                        }}
                                        className={`${inputBaseClasses} ${inputStateClasses} pr-12`}
                                        aria-invalid={authError || undefined}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-3 inline-flex items-center text-xs font-semibold uppercase tracking-wide text-slate-400 transition hover:text-slate-200 focus:outline-none"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full rounded-lg py-3 text-base font-semibold shadow-lg shadow-sky-500/20" variant="primary">
                                Sign In
                            </Button>
                            <Button
                                type="button"
                                variant="link"
                                className="text-center text-sm text-sky-300 hover:text-sky-200"
                                onClick={() => navigate("/signup")}
                            >
                                Create Account
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;


