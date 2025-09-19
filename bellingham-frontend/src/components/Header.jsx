import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { BellAlertIcon } from "@heroicons/react/24/outline";

import logoImage from "../assets/login.png";
import { AuthContext } from "../context";
import navItems from "../config/navItems";

const Header = () => {
    const { username } = useContext(AuthContext);

    return (
        <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-4 flex flex-col gap-4 border-b border-gray-800/80 shadow-lg shadow-black/30 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                <img
                    src={logoImage}
                    alt="Bellingham Data Futures logo"
                    className="h-[100px] w-[100px] rounded-xl border border-white/10 bg-white/5 p-2 shadow-inner shadow-black/40 backdrop-blur-sm md:h-[130px] md:w-[130px]"
                />
                {username && (
                    <nav className="flex flex-wrap gap-2 rounded-2xl border border-white/5 bg-white/5 px-2 py-2 shadow-inner shadow-black/30 backdrop-blur">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <NavLink
                                key={path}
                                to={path}
                                end={path === "/"}
                                className={({ isActive }) =>
                                    `group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
                                        isActive
                                            ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                                            : "text-gray-200 hover:bg-gray-800/80 hover:text-white"
                                    }`
                                }
                            >
                                {Icon && (
                                    <Icon
                                        aria-hidden="true"
                                        className="h-5 w-5 text-white/80 transition-transform duration-200 group-hover:scale-110"
                                    />
                                )}
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </nav>
                )}
            </div>
            {username && (
                <div className="flex items-center gap-3 text-white text-sm">
                    <Link
                        to="/notifications"
                        className="flex items-center gap-2 rounded-full border border-green-500/60 bg-green-500/90 px-4 py-2 font-semibold text-white shadow-lg shadow-green-500/30 transition-colors hover:bg-green-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                    >
                        <BellAlertIcon aria-hidden="true" className="h-5 w-5" />
                        Notifications
                    </Link>
                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-wider text-gray-200 shadow-inner shadow-black/30">
                        Logged in as: <strong className="text-white">{username}</strong>
                    </span>
                </div>
            )}
        </header>
    );
};

export default Header;
