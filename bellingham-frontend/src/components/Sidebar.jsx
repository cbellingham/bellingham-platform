import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = ({ onLogout }) => {
    const navigate = useNavigate();
    return (
        <aside className="w-64 bg-base p-6 flex flex-col justify-between border-r border-border">
            <nav className="flex flex-col space-y-4">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `text-left hover:bg-success px-4 py-2 rounded text-contrast ${isActive ? "bg-surface-secondary" : ""}`
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="/buy"
                    className={({ isActive }) =>
                        `text-left hover:bg-success px-4 py-2 rounded text-contrast ${isActive ? "bg-surface-secondary" : ""}`
                    }
                >
                    Buy
                </NavLink>
                <NavLink
                    to="/sell"
                    className={({ isActive }) =>
                        `text-left hover:bg-success px-4 py-2 rounded text-contrast ${isActive ? "bg-surface-secondary" : ""}`
                    }
                >
                    Sell
                </NavLink>
                <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                        `text-left hover:bg-success px-4 py-2 rounded text-contrast ${isActive ? "bg-surface-secondary" : ""}`
                    }
                >
                    Reports
                </NavLink>
                <NavLink
                    to="/sales"
                    className={({ isActive }) =>
                        `text-left hover:bg-success px-4 py-2 rounded text-contrast ${isActive ? "bg-surface-secondary" : ""}`
                    }
                >
                    Sales
                </NavLink>
                <NavLink
                    to="/calendar"
                    className={({ isActive }) =>
                        `text-left hover:bg-success px-4 py-2 rounded text-contrast ${isActive ? "bg-surface-secondary" : ""}`
                    }
                >
                    Calendar
                </NavLink>
                <NavLink
                    to="/history"
                    className={({ isActive }) =>
                        `text-left hover:bg-success px-4 py-2 rounded text-contrast ${isActive ? "bg-surface-secondary" : ""}`
                    }
                >
                    History
                </NavLink>
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `text-left hover:bg-success px-4 py-2 rounded text-contrast ${isActive ? "bg-surface-secondary" : ""}`
                    }
                >
                    Settings
                </NavLink>
                <NavLink
                    to="/account"
                    className={({ isActive }) =>
                        `text-left hover:bg-success px-4 py-2 rounded text-contrast ${isActive ? "bg-surface-secondary" : ""}`
                    }
                >
                    Account
                </NavLink>
            </nav>
            <div className="mt-6 flex flex-col space-y-2">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-surface-secondary hover:bg-surface-tertiary px-4 py-2 rounded text-left text-contrast"
                >
                    Back
                </button>
                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="bg-danger hover:bg-danger-dark px-4 py-2 rounded text-contrast"
                    >
                        Log Out
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
