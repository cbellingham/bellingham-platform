import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { BellAlertIcon } from "@heroicons/react/24/outline";

import { AuthContext, useNotifications } from "../context";
import navItems from "../config/navItems";
import NavMenuItem from "./ui/NavMenuItem";

const Header = ({ onLogout }) => {
    const { username } = useContext(AuthContext);
    const { unreadCount } = useNotifications();
    const [isNavOpen, setIsNavOpen] = useState(false);

    const toggleNavigation = () => {
        setIsNavOpen((prev) => !prev);
    };

    const handleNavigate = () => {
        setIsNavOpen(false);
    };

    return (
        <header className="relative z-20 border-b border-slate-800/70 bg-slate-950/95 shadow-[0_16px_40px_rgba(8,20,45,0.65)]">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link to="/" className="flex flex-col leading-tight">
                        <span className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200/80">
                            Bellingham
                        </span>
                        <span className="text-lg font-semibold text-white">Markets Platform</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/notifications"
                            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/40 bg-slate-900/80 text-emerald-100 shadow-[0_6px_18px_rgba(16,185,129,0.25)] transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                            aria-label={
                                unreadCount > 0
                                    ? `${unreadCount} unread notifications`
                                    : "Notifications"
                            }
                        >
                            <BellAlertIcon aria-hidden="true" className="h-5 w-5" />
                            <span className="sr-only">Open notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute -right-1 -top-1 min-w-[1.5rem] rounded-full bg-emerald-400 px-1.5 py-0.5 text-center text-[0.65rem] font-semibold leading-none text-slate-950 shadow-lg">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </Link>

                        {username && (
                            <>
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
                            </>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-inner shadow-black/20">
                    <div className="flex items-center justify-between gap-4 lg:hidden">
                        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-slate-400">
                            Navigation
                        </span>
                        <button
                            type="button"
                            onClick={toggleNavigation}
                            aria-expanded={isNavOpen}
                            aria-controls="primary-navigation"
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-slate-900/80 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-emerald-100 transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        >
                            <span>{isNavOpen ? "Close" : "Menu"}</span>
                            <svg
                                aria-hidden="true"
                                className={`h-4 w-4 transition-transform ${isNavOpen ? "rotate-180" : ""}`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                    </div>
                    <nav
                        id="primary-navigation"
                        className={`${
                            isNavOpen ? "flex" : "hidden"
                        } flex-col items-stretch gap-2 pt-3 lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:gap-2 lg:pt-0`}
                    >
                        {navItems.map((item) => (
                            <NavMenuItem key={item.path} item={item} layout="header" onNavigate={handleNavigate} />
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
