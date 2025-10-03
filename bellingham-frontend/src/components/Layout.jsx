import React from "react";
import Header from "./Header";
import NotificationPopup from "./NotificationPopup";
import Sidebar from "./Sidebar";

const Layout = ({ children, onLogout }) => (
    <div
        className="min-h-screen font-sans text-contrast"
        style={{
            backgroundColor: 'var(--bg-color)',
            backgroundImage: 'var(--bg-gradient)',
        }}
    >
        <a href="#main-content" className="skip-link">
            Skip to main content
        </a>
        <div className="flex min-h-screen">
            <Sidebar onLogout={onLogout} />
            <div className="flex flex-1 flex-col">
                <Header onLogout={onLogout} showNavigation={false} />
                <main id="main-content" tabIndex="-1" className="flex-1">
                    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10 lg:py-12">
                        {children}
                    </div>
                </main>
            </div>
        </div>
        <NotificationPopup />
    </div>
);

export default Layout;
