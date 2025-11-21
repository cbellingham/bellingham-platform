import React, { useContext, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

import { AuthContext, useNotifications } from "../context";
import navItems from "../config/navItems";
import NavMenuItem from "./ui/NavMenuItem";

const headerButtons = [
    { label: "Home", path: "/" },
    { label: "Buy", path: "/buy" },
    { label: "Sell", path: "/sell" },
    { label: "Reports", path: "/reports" },
    { label: "Sales", path: "/sales" },
    { label: "Calendar", path: "/calendar" },
    { label: "History", path: "/history" },
    { label: "Settings", path: "/settings" },
    { label: "Account", path: "/account" },
    { label: "Notifications", path: "/notifications" },
];

const NotificationBellIcon = ({ style, ...props }) => (
    <svg
        aria-hidden="true"
        style={{ width: "20px", height: "20px", color: "currentColor", ...(style || {}) }}
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
    "/sell": "The Forwards Data Contracts Market",
    "/reports": "Visualise platform performance and compliance insights.",
    "/sales": "Track pipeline health and completed market activity.",
    "/calendar": "Coordinate market events, closings, and settlement windows.",
    "/history": "Review historical transactions and audit-ready activity logs.",
    "/settings": "Fine-tune platform preferences to suit your workflow.",
    "/account": "Manage account details, security, and collaboration settings.",
    "/notifications": "Stay ahead with timely alerts from across the exchange.",
    "/admin/users": "Curate access controls for your organisation.",
};

const shellClassName =
    "sticky top-0 z-20 border-b border-[rgba(27,37,67,0.8)] bg-[linear-gradient(180deg,rgba(24,34,61,0.95)_0%,rgba(10,16,30,0.9)_100%)] shadow-[0_38px_110px_rgba(5,9,20,0.7)] backdrop-blur-[20px]";

const innerClassName =
    "mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-[clamp(1.5rem,4vw,3rem)] py-8";

const topRowClassName = "flex flex-wrap items-start justify-between gap-6";

const quickLinksClassName =
    "flex items-stretch gap-2 overflow-x-auto rounded-3xl border border-[rgba(30,47,83,0.6)] bg-[linear-gradient(140deg,rgba(20,36,70,0.78),rgba(12,22,42,0.7))] p-2 shadow-[0_24px_60px_rgba(5,9,20,0.55)]";

const quickLinkClassName =
    "flex-1 min-w-[6.5rem] rounded-2xl border border-[rgba(47,79,120,0.6)] bg-[linear-gradient(145deg,rgba(30,60,95,0.78),rgba(20,38,68,0.68))] px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-[#C7E7FF] transition-colors hover:border-[#4DD1FF]/70 hover:text-[#9BD8FF]";

const Header = ({ onLogout, showNavigation = true }) => {
    const { username, permissions = [], role } = useContext(AuthContext);
    const { unreadCount } = useNotifications();
    const location = useLocation();

    const filteredNavItems = useMemo(
        () =>
            navItems.filter((item) => {
                if (item.requiresRole && item.requiresRole !== role) {
                    return false;
                }
                if (item.requiresPermission && !permissions.includes(item.requiresPermission)) {
                    return false;
                }
                return true;
            }),
        [permissions, role],
    );

    const shouldRenderNavigation = showNavigation && filteredNavItems.length > 0;

    const activeItem = useMemo(() => {
        const pathName = location.pathname;
        return filteredNavItems.find((item) =>
            item.path === "/"
                ? pathName === "/"
                : pathName.startsWith(item.path),
        );
    }, [filteredNavItems, location.pathname]);

    const pageTitle = activeItem?.label || "Bellingham Markets Platform";
    const pageDescription =
        pageDescriptions[activeItem?.path ?? location.pathname] ||
        "A modern trading experience tailored for the Bellingham marketplace.";

    return (
        <header className={shellClassName}>
            <div className={innerClassName}>
                <div className={topRowClassName}>
                    <div className="flex flex-col gap-1 text-left">
                        <Link to="/" className="no-underline">
                            <p className="text-[12px] font-semibold uppercase tracking-[0.48em] text-[#4DD1FF]/80">
                                Bellingham Data Futures
                            </p>
                            <p className="text-[32px] font-semibold text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.45)]">
                                {pageTitle}
                            </p>
                        </Link>
                        <p className="max-w-[38rem] text-[15px] text-slate-200">{pageDescription}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/notifications"
                            className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(33,65,111,0.8)] bg-[linear-gradient(145deg,rgba(34,64,109,0.95),rgba(19,35,64,0.85))] text-[#4DD1FF] shadow-[0_22px_48px_rgba(20,70,120,0.55)] transition-colors hover:border-[#4DD1FF]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DD1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1222]"
                            aria-label={
                                unreadCount > 0
                                    ? `${unreadCount} unread notifications`
                                    : "Notifications"
                            }
                        >
                            <NotificationBellIcon />
                            <span className="sr-only">Open notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute -right-1 -top-1 min-w-[1.5rem] rounded-full bg-[#7465A8] px-1.5 py-0.5 text-center text-[0.65rem] font-semibold leading-none text-white shadow-[0_10px_30px_rgba(116,101,168,0.6)] font-mono tabular-nums">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </Link>

                        {username && (
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-300">Logged in as</p>
                                    <p className="text-[15px] font-semibold text-white">{username}</p>
                                </div>
                                {onLogout && (
                                    <button
                                        type="button"
                                        onClick={onLogout}
                                        className="rounded-2xl border border-[rgba(47,79,120,0.7)] bg-[linear-gradient(145deg,rgba(30,60,95,0.85),rgba(24,42,70,0.7))] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9BD8FF] shadow-[0_16px_38px_rgba(24,42,70,0.45)] transition-colors hover:border-[#4DD1FF]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DD1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1222]"
                                    >
                                        Log Out
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <nav aria-label="Quick links" className={quickLinksClassName}>
                    {headerButtons.map((button) => (
                        <Link key={button.path} to={button.path} className={quickLinkClassName}>
                            {button.label}
                        </Link>
                    ))}
                </nav>

                {shouldRenderNavigation && (
                    <nav
                        id="primary-navigation"
                        className="flex flex-wrap items-center gap-3 overflow-x-auto rounded-3xl border border-[rgba(30,47,83,0.7)] bg-[linear-gradient(140deg,rgba(20,36,70,0.9),rgba(12,22,42,0.85))] px-4 py-3 shadow-[0_30px_70px_rgba(5,9,20,0.55)]"
                    >
                        {filteredNavItems.map((item) => (
                            <NavMenuItem key={item.path} item={item} layout="header" />
                        ))}
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;
