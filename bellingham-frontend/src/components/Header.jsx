import React, { useContext, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

import { AuthContext, useNotifications } from "../context";
import navItems from "../config/navItems";
import NavMenuItem from "./ui/NavMenuItem";
import Logo from "./Logo";

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

const headerStyles = {
    root: {
        position: "sticky",
        top: 0,
        zIndex: 20,
        borderBottom: "1px solid rgba(27, 37, 67, 0.8)",
        backgroundImage: "linear-gradient(180deg, rgba(24,34,61,0.95) 0%, rgba(10,16,30,0.9) 100%)",
        boxShadow: "0 38px 110px rgba(5, 9, 20, 0.7)",
        backdropFilter: "blur(20px)",
    },
    inner: {
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        width: "100%",
        maxWidth: "1440px",
        padding: "2rem clamp(1.5rem, 4vw, 3rem)",
        boxSizing: "border-box",
    },
    topRow: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "1.5rem",
    },
    brandBlock: {
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
        textAlign: "left",
    },
    brandGroup: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        minHeight: "3.5rem",
    },
    brandLabel: {
        fontSize: "1.2rem",
        fontWeight: 600,
        letterSpacing: "0.48em",
        textTransform: "uppercase",
        color: "rgba(77, 209, 255, 0.8)",
        margin: 0,
    },
    brandTitle: {
        fontSize: "2rem",
        fontWeight: 600,
        color: "#FFFFFF",
        margin: 0,
        textShadow: "0 10px 25px rgba(0, 0, 0, 0.45)",
    },
    brandDescription: {
        maxWidth: "38rem",
        fontSize: "0.95rem",
        color: "rgba(226, 234, 255, 0.85)",
        margin: 0,
    },
    actions: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
    },
    notificationButton: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "3rem",
        width: "3rem",
        borderRadius: "1rem",
        border: "1px solid rgba(33, 65, 111, 0.8)",
        backgroundImage: "linear-gradient(145deg, rgba(34,64,109,0.95), rgba(19,35,64,0.85))",
        color: "#4DD1FF",
        boxShadow: "0 22px 48px rgba(20, 70, 120, 0.55)",
        textDecoration: "none",
    },
    notificationBadge: {
        position: "absolute",
        top: "-0.4rem",
        right: "-0.4rem",
        minWidth: "1.5rem",
        borderRadius: "999px",
        backgroundColor: "#7465A8",
        padding: "0.25rem 0.4rem",
        fontSize: "0.65rem",
        fontWeight: 600,
        color: "#FFFFFF",
        boxShadow: "0 10px 30px rgba(116, 101, 168, 0.6)",
        textAlign: "center",
        lineHeight: 1.2,
        fontFamily: "'Roboto Mono', 'JetBrains Mono', monospace",
    },
    accountBlock: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
    },
    accountMeta: {
        textAlign: "right",
    },
    accountLabel: {
        fontSize: "0.6rem",
        fontWeight: 600,
        letterSpacing: "0.4em",
        textTransform: "uppercase",
        color: "rgba(148, 163, 184, 0.9)",
        margin: 0,
    },
    accountName: {
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "#FFFFFF",
        margin: 0,
    },
    logoutButton: {
        borderRadius: "1.25rem",
        border: "1px solid rgba(47, 79, 120, 0.7)",
        backgroundImage: "linear-gradient(145deg, rgba(30,60,95,0.85), rgba(24,42,70,0.7))",
        padding: "0.6rem 1.25rem",
        fontSize: "0.6rem",
        fontWeight: 600,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color: "#9BD8FF",
        cursor: "pointer",
    },
    quickLinks: {
        display: "flex",
        flexWrap: "nowrap",
        alignItems: "stretch",
        gap: "0.5rem",
        overflowX: "auto",
        borderRadius: "1.5rem",
        border: "1px solid rgba(30, 47, 83, 0.6)",
        backgroundImage: "linear-gradient(140deg, rgba(20,36,70,0.78), rgba(12,22,42,0.7))",
        padding: "0.5rem",
        boxShadow: "0 24px 60px rgba(5, 9, 20, 0.55)",
    },
    quickLink: {
        minWidth: "6.5rem",
        flex: 1,
        textAlign: "center",
        borderRadius: "1rem",
        border: "1px solid rgba(47, 79, 120, 0.6)",
        backgroundImage: "linear-gradient(145deg, rgba(30,60,95,0.78), rgba(20,38,68,0.68))",
        padding: "0.5rem 0.75rem",
        fontSize: "0.6rem",
        fontWeight: 600,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        color: "#C7E7FF",
        textDecoration: "none",
    },
    navBar: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.75rem",
        overflowX: "auto",
        borderRadius: "1.5rem",
        border: "1px solid rgba(30, 47, 83, 0.7)",
        backgroundImage: "linear-gradient(140deg, rgba(20,36,70,0.9), rgba(12,22,42,0.85))",
        padding: "0.75rem 1rem",
        boxShadow: "0 30px 70px rgba(5, 9, 20, 0.55)",
    },
};

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
        <header style={headerStyles.root}>
            <div style={headerStyles.inner}>
                <div style={headerStyles.topRow}>
                    <div style={headerStyles.brandBlock}>
                        <div style={headerStyles.brandGroup}>
                            <Logo size={60} style={{ flexShrink: 0 }} />
                            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                                <p style={headerStyles.brandLabel}>Bellingham Data Futures</p>
                                <p style={headerStyles.brandTitle}>{pageTitle}</p>
                            </Link>
                        </div>
                        <p style={headerStyles.brandDescription}>{pageDescription}</p>
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
