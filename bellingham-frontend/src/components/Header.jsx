import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";

import logoImage from "../assets/login.png";
import { AuthContext } from '../context';
import navItems from "../config/navItems";

const Header = () => {
    const { username } = useContext(AuthContext);

    return (
        <header className="bg-gray-800 p-4 flex flex-col gap-4 border-b border-gray-700 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                <img
                    src={logoImage}
                    alt="Bellingham Data Futures logo"
                    className="h-[120px] w-[120px] md:h-[150px] md:w-[150px]"
                />
                {username && (
                    <nav className="flex flex-wrap gap-2 text-sm">
                        {navItems.map(({ path, label }) => (
                            <NavLink
                                key={path}
                                to={path}
                                end={path === "/"}
                                className={({ isActive }) =>
                                    `rounded px-3 py-1 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 ${
                                        isActive
                                            ? "bg-green-600 text-white"
                                            : "text-gray-200 hover:bg-gray-700"
                                    }`
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                    </nav>
                )}
            </div>
            {username && (
                <div className="flex items-center gap-3 text-white text-sm">
                    <Link
                        to="/notifications"
                        className="rounded bg-green-600 px-3 py-1 font-semibold text-white transition-colors hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
                    >
                        Notifications
                    </Link>
                    <span>Logged in as: {username}</span>
                </div>
            )}
        </header>
    );
};

export default Header;
