import React from "react";
import Header from "./Header";
import NotificationPopup from "./NotificationPopup";

const Layout = ({ children, onLogout }) => (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
        <Header onLogout={onLogout} />
        <div className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-6 py-8">
                {children}
            </div>
        </div>
        <NotificationPopup />
    </div>
);

export default Layout;
