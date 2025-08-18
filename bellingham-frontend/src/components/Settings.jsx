import React, { useContext } from "react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Settings = () => {
    const navigate = useNavigate();

    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
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
