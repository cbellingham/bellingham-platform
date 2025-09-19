import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { BellAlertIcon } from "@heroicons/react/24/outline";

import logoImage from "../assets/login.png";
import { AuthContext } from "../context";
import navItems from "../config/navItems";
import NavMenuItem from "./ui/NavMenuItem";

const Header = () => {
    const { username } = useContext(AuthContext);

    return (
        <header className="bg-slate-950/90 px-6 py-4 backdrop-blur border-b border-slate-800 shadow-sm">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                    <img
                        src={logoImage}
                        alt="Bellingham Data Futures logo"
                        className="h-[72px] w-[72px] rounded-xl border border-white/10 bg-white/10 p-2 shadow-inner shadow-black/30 md:h-[90px] md:w-[90px]"
                    />
                    {username && (
                        <nav className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 shadow-inner shadow-black/20">
                            {navItems.map((item) => (
                                <NavMenuItem key={item.path} item={item} layout="header" />
                            ))}
                        </nav>
                    )}
                </div>
                {username && (
                    <div className="flex items-center gap-3 text-white text-sm">
                        <Link
                            to="/notifications"
                            className="flex items-center gap-2 rounded-full border border-emerald-500/60 bg-emerald-500/90 px-4 py-2 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                        >
                            <BellAlertIcon aria-hidden="true" className="h-5 w-5" />
                            Notifications
                        </Link>
                        <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-wider text-slate-100 shadow-inner shadow-black/20">
                            Logged in as: <strong className="text-white">{username}</strong>
                        </span>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
