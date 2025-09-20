import React, { useContext } from "react";
import { Link } from "react-router-dom";

import logoImage from "../assets/login.png";
import { AuthContext } from "../context";
import navItems from "../config/navItems";
import NavMenuItem from "./ui/NavMenuItem";

const Header = ({ onLogout }) => {
    const { username } = useContext(AuthContext);

    return (
        <header className="relative z-20 border-b border-slate-800/70 bg-slate-950/95 shadow-[0_16px_40px_rgba(8,20,45,0.65)]">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-3">
                        <img
                            src={logoImage}
                            alt="Bellingham Data Futures logo"
                            className="h-12 w-12 rounded-full border border-emerald-400/40 bg-slate-900/80 p-2 shadow-[0_6px_18px_rgba(16,185,129,0.25)]"
                        />
                        <div className="hidden flex-col leading-tight sm:flex">
                            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200/80">
                                Bellingham
                            </span>
                            <span className="text-lg font-semibold text-white">Markets Platform</span>
                        </div>
                    </Link>

                    {username && (
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.38em] text-slate-400">
                                    Logged in as
                                </p>
                                <p className="text-sm font-semibold text-white">{username}</p>
                            </div>
                            {onLogout && (
                                <button
                                    type="button"
                                    onClick={onLogout}
                                    className="rounded-lg border border-emerald-400/50 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100 transition-colors hover:bg-emerald-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                                >
                                    Log Out
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-inner shadow-black/20">
                    <nav className="flex flex-wrap items-center gap-2">
                        {navItems.map((item) => (
                            <NavMenuItem key={item.path} item={item} layout="header" />
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
