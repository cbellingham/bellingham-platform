import React from "react";
import Header from "./Header";
import NotificationPopup from "./NotificationPopup";
import Sidebar from "./Sidebar";

const sidebarWidth = "clamp(220px, 11.111vw, 280px)";

const Layout = ({ children, onLogout }) => (
    <div
        className="relative min-h-screen overflow-hidden bg-[#050912] px-4 py-6 font-sans text-contrast sm:px-6 sm:py-8 lg:px-12 lg:py-12"
        style={{
            backgroundImage:
                "radial-gradient(circle at 15% 20%, rgba(0, 209, 255, 0.16), transparent 55%), " +
                "radial-gradient(circle at 85% 10%, rgba(116, 101, 168, 0.18), transparent 60%), " +
                "radial-gradient(circle at 50% 75%, rgba(59, 174, 171, 0.12), transparent 65%), " +
                "linear-gradient(180deg, #0A1021 0%, #050912 60%, #03050D 100%)",
        }}
    >
        <a href="#main-content" className="skip-link">
            Skip to main content
        </a>
        <div
            className="relative mx-auto flex min-h-screen w-full max-w-[1620px] flex-col gap-6 px-4 py-8 lg:flex-row lg:gap-8 lg:px-10 lg:py-12"
            style={{ "--sidebar-width": sidebarWidth }}
        >
            <Sidebar onLogout={onLogout} sidebarWidth={sidebarWidth} />
            <div className="flex flex-1 flex-col rounded-[28px] border border-[#1B2543]/70 bg-[linear-gradient(160deg,rgba(23,34,58,0.95)_0%,rgba(9,14,27,0.92)_100%)] shadow-[0_50px_140px_rgba(5,9,20,0.55)] backdrop-blur-xl">
                <Header onLogout={onLogout} showNavigation={false} />
                <main id="main-content" tabIndex="-1" className="flex-1 overflow-y-auto">
                    <div
                        className="w-full px-6 pb-12 pt-8 sm:px-9 lg:px-14 [&_.grid]:px-3 [&_.grid]:py-3 [&_.grid]:sm:px-4 [&_.grid]:sm:py-4 [&_.grid]:lg:px-6 [&_.grid]:lg:py-6"
                    >
                        {children}
                    </div>
                </main>
            </div>
        </div>
        <NotificationPopup />
    </div>
);

export default Layout;
