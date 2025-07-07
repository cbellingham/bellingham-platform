import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const Settings = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
    };

    return (
        <div className="flex flex-col min-h-screen font-poppins bg-black text-white">
            <Header />
            <div className="flex flex-1 relative gap-6">
                <Sidebar onLogout={handleLogout} />
                <main className="flex-1 p-8">
                    <h1 className="text-3xl font-bold mb-6">Settings</h1>
                    <p>Settings page coming soon.</p>
                </main>
            </div>
        </div>
    );
};

export default Settings;
