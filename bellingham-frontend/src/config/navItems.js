const navItems = [
    { path: "/", label: "Home" },
    { path: "/buy", label: "Buy", requiresPermission: "BUY" },
    { path: "/reports", label: "Reports" },
    { path: "/sell", label: "Sell", requiresPermission: "SELL" },
    { path: "/sales", label: "Sales" },
    { path: "/calendar", label: "Calendar" },
    { path: "/history", label: "History" },
    { path: "/settings", label: "Settings" },
    { path: "/account", label: "Account" },
    { path: "/notifications", label: "Notifications" },
    { path: "/admin/users", label: "User Access", section: "Administration", requiresRole: "ROLE_ADMIN" },
];

export default navItems;
