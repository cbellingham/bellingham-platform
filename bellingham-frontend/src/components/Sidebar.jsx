import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "./ui/Button";

const Sidebar = ({ onLogout }) => {
    const navigate = useNavigate();
    return (
        <aside className="w-64 bg-gray-900 p-6 flex flex-col justify-between border-r border-gray-700">
            <nav className="flex flex-col space-y-4">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `text-left hover:bg-green-600 px-4 py-2 rounded text-white ${isActive ? "bg-gray-700" : ""}`
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="/buy"
                    className={({ isActive }) =>
                        `text-left hover:bg-green-600 px-4 py-2 rounded text-white ${isActive ? "bg-gray-700" : ""}`
                    }
                >
                    Buy
                </NavLink>
                <NavLink
                    to="/sell"
                    className={({ isActive }) =>
                        `text-left hover:bg-green-600 px-4 py-2 rounded text-white ${isActive ? "bg-gray-700" : ""}`
                    }
                >
                    Sell
                </NavLink>
                <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                        `text-left hover:bg-green-600 px-4 py-2 rounded text-white ${isActive ? "bg-gray-700" : ""}`
                    }
                >
                    Reports
                </NavLink>
                <NavLink
                    to="/sales"
                    className={({ isActive }) =>
                        `text-left hover:bg-green-600 px-4 py-2 rounded text-white ${isActive ? "bg-gray-700" : ""}`
                    }
                >
                    Sales
                </NavLink>
                <NavLink
                    to="/calendar"
                    className={({ isActive }) =>
                        `text-left hover:bg-green-600 px-4 py-2 rounded text-white ${isActive ? "bg-gray-700" : ""}`
                    }
                >
                    Calendar
                </NavLink>
                <NavLink
                    to="/history"
                    className={({ isActive }) =>
                        `text-left hover:bg-green-600 px-4 py-2 rounded text-white ${isActive ? "bg-gray-700" : ""}`
                    }
                >
                    History
                </NavLink>
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `text-left hover:bg-green-600 px-4 py-2 rounded text-white ${isActive ? "bg-gray-700" : ""}`
                    }
                >
                    Settings
                </NavLink>
                <NavLink
                    to="/account"
                    className={({ isActive }) =>
                        `text-left hover:bg-green-600 px-4 py-2 rounded text-white ${isActive ? "bg-gray-700" : ""}`
                    }
                >
                    Account
                </NavLink>
            </nav>
            <div className="mt-6 flex flex-col space-y-2">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="text-left"
                >
                    Back
                </Button>
                {onLogout && (
                    <Button variant="danger" onClick={onLogout}>
                        Log Out
                    </Button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
