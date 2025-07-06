import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ onLogout }) => {
    const navigate = useNavigate();
    return (
        <aside className="w-64 bg-gray-900 p-6 flex flex-col justify-between">
            <nav className="flex flex-col space-y-4">
                <button
                    onClick={() => navigate("/")}
                    className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                >
                    Home
                </button>
                <button
                    onClick={() => navigate("/buy")}
                    className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                >
                    Buy
                </button>
                <button
                    onClick={() => navigate("/sell")}
                    className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                >
                    Sell
                </button>
                <button
                    onClick={() => navigate("/reports")}
                    className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                >
                    Reports
                </button>
                <button
                    onClick={() => navigate("/calendar")}
                    className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                >
                    Calendar
                </button>
                <button
                    onClick={() => alert("Settings screen not implemented yet")}
                    className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                >
                    Settings
                </button>
                <button
                    onClick={() => navigate("/account")}
                    className="text-left hover:bg-gray-700 px-4 py-2 rounded"
                >
                    Account
                </button>
            </nav>
            <div className="mt-6 flex flex-col space-y-2">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-left text-white"
                >
                    Back
                </button>
                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
                    >
                        Log Out
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
