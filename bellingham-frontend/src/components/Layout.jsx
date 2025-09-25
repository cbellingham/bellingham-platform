import React from "react";
import Header from "./Header";
import NotificationPopup from "./NotificationPopup";

const Layout = ({ children, onLogout }) => (
    <div
        className="flex min-h-screen flex-col font-sans text-contrast"
        style={{
            backgroundColor: 'var(--bg-color)',
            backgroundImage: 'var(--bg-gradient)',
        }}
    >
        <a href="#main-content" className="skip-link">
            Skip to main content
        </a>
        <Header onLogout={onLogout} />
        <main id="main-content" tabIndex="-1" className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-6 py-8">
                {children}
            </div>
        </main>
        <NotificationPopup />
    </div>
);

export default Layout;
