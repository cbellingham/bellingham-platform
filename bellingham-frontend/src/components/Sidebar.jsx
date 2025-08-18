import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import navItems from "../config/navItems";

const Sidebar = ({ onLogout }) => {
    const navigate = useNavigate();
    return (
        <aside className="w-64 bg-gray-900 p-6 flex flex-col justify-between border-r border-gray-700">
            <nav className="flex flex-col space-y-4">
                {navItems.map(({ path, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === "/"}
                        className={({ isActive }) =>
                            `text-left hover:bg-green-600 px-4 py-2 rounded text-white ${isActive ? "bg-gray-700" : ""}`
                        }
                    >
                        {label}
                    </NavLink>
                ))}
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
