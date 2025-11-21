import React from "react";
import Header from "./Header";
import NotificationPopup from "./NotificationPopup";
import Sidebar from "./Sidebar";

const sidebarWidth = "clamp(220px, 11.111vw, 280px)";

const Layout = ({ children, onLogout, showNavigation = true }) => (
    <div
        className="relative min-h-screen overflow-hidden bg-[#050912] px-8 py-10 font-sans text-contrast sm:px-12 sm:py-16 lg:px-24 lg:py-24"
        style={{
            backgroundImage:
                "radial-gradient(circle at 15% 20%, rgba(0, 209, 255, 0.16), transparent 55%), " +
                "radial-gradient(circle at 85% 10%, rgba(116, 101, 168, 0.18), transparent 60%), " +
                "radial-gradient(circle at 50% 75%, rgba(59, 174, 171, 0.12), transparent 65%), " +
                "linear-gradient(180deg, #0A1021 0%, #050912 60%, #03050D 100%)",
        }}
    >
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:z-50 focus:translate-y-0 focus:rounded-br-2xl focus:bg-[#1B263B]/95 focus:px-5 focus:py-3 focus:text-contrast focus:shadow-[0_18px_45px_rgba(5,9,20,0.45)]"
        >
            Skip to main content
        </a>
        <div
            className="relative mx-auto flex min-h-screen w-full max-w-[1620px] flex-col gap-6 px-6 py-12 lg:flex-row lg:gap-8 lg:px-16 lg:py-16"
            style={{ "--sidebar-width": sidebarWidth }}
        >
            <Sidebar onLogout={onLogout} sidebarWidth={sidebarWidth} />
            <div className="flex flex-1 flex-col rounded-[28px] border border-[#1B2543]/70 bg-[linear-gradient(160deg,rgba(23,34,58,0.95)_0%,rgba(9,14,27,0.92)_100%)] shadow-[0_50px_140px_rgba(5,9,20,0.55)] backdrop-blur-xl">
                <Header onLogout={onLogout} showNavigation={showNavigation} />
                <main id="main-content" tabIndex="-1" className="flex-1 overflow-y-auto">
                    <div
                        className="w-full px-8 pb-12 pt-8 sm:px-12 lg:px-20 [&_.grid]:px-3 [&_.grid]:py-3 [&_.grid]:sm:px-4 [&_.grid]:sm:py-4 [&_.grid]:lg:px-6 [&_.grid]:lg:py-6"
                    >
                        {children}
                    </div>
                </main>
            </div>
            <NotificationPopup />
        </div>
    </div>
);
export default Layout;
