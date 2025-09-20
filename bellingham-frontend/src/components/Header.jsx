import React, { useContext, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { BellAlertIcon } from "@heroicons/react/24/outline";

import logoImage from "../assets/login.png";
import { AuthContext } from "../context";
import navItems from "../config/navItems";
import NavMenuItem from "./ui/NavMenuItem";

const Header = () => {
    const { username } = useContext(AuthContext);
    const location = useLocation();

    const groupedNavItems = useMemo(() => {
        return navItems.reduce((acc, item) => {
            if (!acc[item.section]) {
                acc[item.section] = [];
            }
            acc[item.section].push(item);
            return acc;
        }, {});
    }, []);

    const activeItem = useMemo(() => {
        const currentPath = location.pathname;
        const matched = navItems.find((item) =>
            item.path === "/" ? currentPath === "/" : currentPath.startsWith(item.path),
        );
        return matched ?? navItems[0];
    }, [location.pathname]);

    return (
        <header className="relative z-20 border-b border-slate-800/80 bg-[#0b1120]/95 px-6 py-5 shadow-[0_20px_45px_rgba(3,10,24,0.65)] backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/30 via-sky-500/20 to-indigo-500/20 blur-lg opacity-80" />
                            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_10px_30px_rgba(2,8,23,0.6)]">
                                <img
                                    src={logoImage}
                                    alt="Bellingham Data Futures logo"
                                    className="h-[68px] w-[68px] rounded-xl border border-white/10 bg-slate-900/80 p-2 shadow-inner shadow-black/40 md:h-[82px] md:w-[82px]"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.45em] text-slate-400/80">Active Module</p>
                            <div className="flex flex-wrap items-baseline gap-3">
                                <h1 className="text-2xl font-semibold text-white drop-shadow">{activeItem?.label ?? "Overview"}</h1>
                                {activeItem?.section && (
                                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/90">
                                        {activeItem.section}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {username && (
                        <div className="flex items-center gap-4 text-white text-sm">
                            <Link
                                to="/notifications"
                                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/80 via-cyan-500/80 to-sky-500/80 px-5 py-2 font-semibold text-white shadow-[0_15px_40px_rgba(14,165,233,0.35)] transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1120]"
                            >
                                <span className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-400/40 via-cyan-400/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <BellAlertIcon aria-hidden="true" className="h-5 w-5" />
                                Notifications
                            </Link>
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right shadow-[0_12px_30px_rgba(2,10,26,0.45)]">
                                <span className="block text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-400/80">
                                    User
                                </span>
                                <span className="text-sm font-semibold text-white">{username}</span>
                            </div>
                        </div>
                    )}
                </div>
                {username && (
                    <nav className="flex flex-wrap items-center gap-4 rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#101b32]/95 via-[#0d1628]/90 to-[#0b1224]/90 p-4 shadow-[0_18px_40px_rgba(3,16,36,0.65)]">
                        {Object.entries(groupedNavItems).map(([section, items]) => (
                            <div
                                key={section}
                                className="flex flex-wrap items-center gap-3 border-slate-800/70 pb-1 last:border-none last:pb-0 md:border-r md:pb-0 md:pr-6 last:md:border-r-0 last:md:pr-0"
                            >
                                <div className="flex flex-col justify-center">
                                    <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500/70">Section</span>
                                    <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">
                                        {section}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {items.map((item) => (
                                        <NavMenuItem key={item.path} item={item} layout="header" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;
