import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import NotificationPopup from "./NotificationPopup";

const Layout = ({ children, onLogout }) => (
    <div className="flex flex-col min-h-screen font-sans bg-base text-contrast">
        <Header />
        <div className="flex flex-1 relative gap-0 md:gap-6 flex-col md:flex-row">
            <Sidebar onLogout={onLogout} />
            {children}
            <NotificationPopup />
        </div>
    </div>
);

export default Layout;
