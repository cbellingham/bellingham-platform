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
        <header className="relative z-20 border-b border-slate-800 bg-slate-950/95 shadow-[0_12px_30px_rgba(2,12,32,0.55)]">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
                <Link to="/" className="flex items-center gap-3">
                    <img
                        src={logoImage}
                        alt="Bellingham Data Futures logo"
                        className="h-12 w-12 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow"
                    />
                    <div className="text-left">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Bellingham Platform</p>
                        <p className="text-base font-semibold text-white">Data Futures</p>
                    </div>
                </Link>
                <nav className="flex flex-1 justify-center">
                    <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 p-2">
                        {navItems.map((item) => (
                            <NavMenuItem key={item.path} item={item} layout="header" />
                        ))}
                    </div>
                </nav>
                {username && (
                    <div className="flex items-center gap-3 text-sm text-white">
                        <Link
                            to="/notifications"
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                        >
                            <BellAlertIcon aria-hidden="true" className="h-5 w-5" />
                            Notifications
                        </Link>
                        <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-right">
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">User</span>
                            <span className="text-sm font-semibold text-white">{username}</span>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
