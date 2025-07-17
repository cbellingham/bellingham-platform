import React from "react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";

const Settings = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
    };

    return (
        <Layout onLogout={handleLogout}>
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold mb-6">Settings</h1>
                <p>Settings page coming soon.</p>
            </main>
        </Layout>
    );
};

export default Settings;
