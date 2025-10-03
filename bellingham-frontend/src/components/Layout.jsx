import React from "react";
import Header from "./Header";
import NotificationPopup from "./NotificationPopup";
import Sidebar from "./Sidebar";

const sidebarWidth = "clamp(220px, 11.111vw, 280px)";

const Layout = ({ children, onLogout }) => (
    <div
        className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(0,209,255,0.12),_transparent_55%),_var(--bg-gradient)] font-sans text-contrast"
        style={{
            backgroundColor: "var(--bg-color)",
        }}
    >
        <a href="#main-content" className="skip-link">
            Skip to main content
        </a>
        <div
            className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8 lg:py-10"
            style={{ "--sidebar-width": sidebarWidth }}
        >
            <Sidebar onLogout={onLogout} sidebarWidth={sidebarWidth} />
            <div className="flex flex-1 flex-col rounded-3xl border border-slate-800/60 bg-slate-950/70 backdrop-blur-xl shadow-[0_45px_140px_rgba(8,20,45,0.45)]">
                <Header onLogout={onLogout} showNavigation={false} />
                <main id="main-content" tabIndex="-1" className="flex-1 overflow-y-auto">
                    <div className="w-full px-6 pb-12 pt-8 sm:px-8 lg:px-12">
                        {children}
                    </div>
                </main>
            </div>
        </div>
        <NotificationPopup />
    </div>
);

export default Layout;
