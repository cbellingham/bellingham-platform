import React, { useContext, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { AuthContext, useNotifications } from "../context";
import navItems from "../config/navItems";
import NavMenuItem from "./ui/NavMenuItem";

const NotificationBellIcon = ({ className = "", ...props }) => (
    <svg
        aria-hidden="true"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 9.5a5.25 5.25 0 1 1 10.5 0v4.21l1.27 1.9c.58.86-.04 2.04-1.07 2.04H6.55c-1.03 0-1.65-1.18-1.07-2.04l1.27-1.9z"
        />
        <path strokeLinecap="round" d="M9.75 18.75a2.25 2.25 0 0 0 4.5 0" />
    </svg>
);

const pageDescriptions = {
    "/": "Live market intelligence and real-time execution metrics.",
    "/buy": "Discover opportunities that match your sourcing strategy.",
    "/sell": "Craft competitive listings and reach active buyers instantly.",
    "/reports": "Visualise platform performance and compliance insights.",
    "/sales": "Track pipeline health and completed market activity.",
    "/calendar": "Coordinate market events, closings, and settlement windows.",
    "/history": "Review historical transactions and audit-ready activity logs.",
    "/settings": "Fine-tune platform preferences to suit your workflow.",
    "/account": "Manage account details, security, and collaboration settings.",
    "/notifications": "Stay ahead with timely alerts from across the exchange.",
    "/admin/users": "Curate access controls for your organisation.",
};

const Header = ({ onLogout, showNavigation = true }) => {
    const { username, permissions = [], role } = useContext(AuthContext);
    const { unreadCount } = useNotifications();
    const [isNavOpen, setIsNavOpen] = useState(false);
    const location = useLocation();

    const filteredNavItems = useMemo(() => navItems.filter((item) => {
        if (item.requiresRole && item.requiresRole !== role) {
            return false;
        }
        if (item.requiresPermission && !permissions.includes(item.requiresPermission)) {
            return false;
        }
        return true;
    }), [permissions, role]);

    const shouldRenderNavigation = showNavigation && filteredNavItems.length > 0;

    const activeItem = useMemo(() => {
        const pathName = location.pathname;
        return filteredNavItems.find((item) =>
            item.path === "/"
                ? pathName === "/"
                : pathName.startsWith(item.path)
        );
    }, [filteredNavItems, location.pathname]);

    const pageTitle = activeItem?.label || "Bellingham Markets Platform";
    const pageDescription = pageDescriptions[activeItem?.path ?? location.pathname] ||
        "A modern trading experience tailored for the Bellingham marketplace.";

    const toggleNavigation = () => {
        setIsNavOpen((prev) => !prev);
    };

    const handleNavigate = () => {
        setIsNavOpen(false);
    };

    return (
        <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-gradient-to-b from-slate-950/80 via-slate-950/65 to-slate-950/40 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-6 sm:px-8">
                <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="space-y-2">
                        <Link to="/" className="group flex flex-col leading-tight text-left">
                            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-[#00D1FF]/75">
                                Bellingham Markets
                            </span>
                            <span className="text-2xl font-semibold text-white">
                                {pageTitle}
                            </span>
                        </Link>
                        <p className="max-w-xl text-sm text-slate-300/90">
                            {pageDescription}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/notifications"
                            className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[#00D1FF]/40 bg-slate-900/70 text-[#00D1FF] shadow-[0_18px_48px_rgba(0,209,255,0.32)] transition-all hover:-translate-y-0.5 hover:bg-slate-900/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                            aria-label={
                                unreadCount > 0
                                    ? `${unreadCount} unread notifications`
                                    : "Notifications"
                            }
                        >
                            <NotificationBellIcon className="h-5 w-5" />
                            <span className="sr-only">Open notifications</span>
                            {unreadCount > 0 && (
                                <span className="numeric-text absolute -right-1 -top-1 min-w-[1.5rem] rounded-full bg-[#7465A8] px-1.5 py-0.5 text-center text-[0.65rem] font-semibold leading-none text-white shadow-lg">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
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
                                        className="rounded-2xl border border-[#3BAEAB]/50 bg-[#3BAEAB]/10 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#9CD8D6] transition-all hover:-translate-y-0.5 hover:bg-[#3BAEAB]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                                    >
                                        Log Out
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {shouldRenderNavigation && (
                    <div className="rounded-2xl border border-slate-800/60 bg-slate-950/60 px-3 py-4 shadow-[0_24px_60px_rgba(8,20,45,0.4)]">
                        <div className="flex items-center justify-between gap-4 lg:hidden">
                            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-slate-400">
                                Navigation
                            </span>
                            <button
                                type="button"
                                onClick={toggleNavigation}
                                aria-expanded={isNavOpen}
                                aria-controls="primary-navigation"
                                className="inline-flex items-center gap-2 rounded-xl border border-[#00D1FF]/40 bg-slate-900/70 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-[#00D1FF] transition-colors hover:bg-slate-900/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D1FF]"
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
                            } flex-col items-stretch gap-3 pt-3 lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:gap-4 lg:pt-0`}
                        >
                            {filteredNavItems.map((item) => (
                                <NavMenuItem key={item.path} item={item} layout="header" onNavigate={handleNavigate} />
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
