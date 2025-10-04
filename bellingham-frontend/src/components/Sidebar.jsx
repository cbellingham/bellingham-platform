import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import navItems from "../config/navItems";
import NavMenuItem from "./ui/NavMenuItem";
import { AuthContext } from "../context";

const Sidebar = ({ onLogout, sidebarWidth }) => {
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { permissions = [], role } = useContext(AuthContext);

    const filteredNavItems = useMemo(() => navItems.filter((item) => {
        if (item.requiresRole && item.requiresRole !== role) {
            return false;
        }
        if (item.requiresPermission && !permissions.includes(item.requiresPermission)) {
            return false;
        }
        return true;
    }), [permissions, role]);

    const groupedNavItems = useMemo(() => {
        const sections = new Map();

        filteredNavItems.forEach((item) => {
            const section = item.section || "General";
            if (!sections.has(section)) {
                sections.set(section, []);
            }
            sections.get(section).push(item);
        });

        return sections;
    }, [filteredNavItems]);

    const toggleMobile = () => setIsMobileOpen((prev) => !prev);
    const closeMobile = () => setIsMobileOpen(false);

    const handleNavigate = (path) => {
        navigate(path);
        closeMobile();
    };

    return (
        <div
            className="relative z-40 flex-shrink-0"
            style={{ "--sidebar-width": sidebarWidth }}
        >
            <button
                type="button"
                onClick={toggleMobile}
                className="fixed left-4 top-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#20355E]/70 bg-[linear-gradient(145deg,rgba(28,46,83,0.92),rgba(16,27,52,0.88))] text-[#A9C9FF] shadow-[0_25px_60px_rgba(12,22,42,0.65)] backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DD1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050912] lg:hidden"
                aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={isMobileOpen}
            >
                <span className="sr-only">{isMobileOpen ? "Close navigation" : "Open navigation"}</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    {isMobileOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 6.75h15M4.5 12h15M4.5 17.25h15" />
                    )}
                </svg>
            </button>

            {isMobileOpen && (
                <div className="fixed inset-0 z-40 bg-slate-900/70 backdrop-blur-sm lg:hidden" role="presentation" onClick={closeMobile} />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex h-full transform flex-col overflow-hidden border-r border-[#1B2744]/80 bg-[linear-gradient(185deg,rgba(20,33,60,0.95)_0%,rgba(10,18,36,0.92)_100%)] px-6 pb-9 pt-10 text-slate-100 shadow-[0_55px_140px_rgba(5,10,25,0.7)] backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 lg:rounded-[28px] lg:border lg:border-[#1B2744]/80 lg:px-8 lg:py-11 lg:shadow-[0_45px_120px_rgba(5,10,25,0.6)] ${
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                style={{ width: "var(--sidebar-width)", flexBasis: "var(--sidebar-width)" }}
            >
                <div className="flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => handleNavigate("/")}
                        className="group flex items-center gap-3 rounded-2xl border border-transparent bg-[linear-gradient(145deg,rgba(22,38,70,0.85),rgba(12,22,46,0.75))] px-3 py-2 text-left transition-colors hover:border-[#4DD1FF]/50 hover:bg-[rgba(22,38,70,0.95)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DD1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050912]"
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(77,209,255,0.85),rgba(116,101,168,0.65))] text-base font-bold text-slate-950 shadow-[0_16px_40px_rgba(45,130,210,0.6)]">
                            BM
                        </span>
                        <span className="flex flex-col leading-tight">
                            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.42em] text-[#8BB8FF]">Bellingham</span>
                            <span className="text-sm font-semibold text-white">Markets Platform</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={closeMobile}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#24395F]/70 bg-[#111D36]/80 text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DD1FF] lg:hidden"
                    >
                        <span className="sr-only">Close navigation</span>
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mt-8 flex-1 space-y-8 overflow-y-auto pr-1">
                    {Array.from(groupedNavItems.entries()).map(([section, items]) => (
                        <div key={section} className="space-y-3">
                            <p className="px-1 text-[0.6rem] font-semibold uppercase tracking-[0.44em] text-[#4C6FA8]/80">{section}</p>
                            <div className="space-y-1.5">
                                {items.map((item) => (
                                    <NavMenuItem key={item.path} item={item} layout="sidebar" onNavigate={handleNavigate} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 space-y-3 border-t border-[#1B2744]/80 pt-6">
                    <div className="rounded-2xl border border-[#2F4F78]/70 bg-[linear-gradient(150deg,rgba(34,64,109,0.28),rgba(25,44,78,0.2))] p-4 text-sm text-slate-200 shadow-[0_20px_60px_rgba(10,18,36,0.55)]">
                        <p className="font-semibold text-white">Need to move quickly?</p>
                        <p className="mt-1 text-xs text-slate-300/85">
                            Launch a new marketplace listing right from here.
                        </p>
                        <Button
                            variant="primary"
                            className="mt-4 w-full border border-[#4DD1FF]/30 bg-[linear-gradient(145deg,rgba(35,70,120,0.9),rgba(20,40,75,0.85))] text-[#9BD8FF] shadow-[0_20px_45px_rgba(34,64,109,0.45)] hover:border-[#4DD1FF]/60"
                            onClick={() => handleNavigate("/sell")}
                        >
                            Create Listing
                        </Button>
                    </div>
                    {onLogout && (
                        <Button
                            variant="ghost"
                            className="w-full justify-center border border-[#22365A]/70 bg-[#111D36]/85 text-slate-200 hover:border-[#4DD1FF]/60 hover:text-white"
                            onClick={() => {
                                closeMobile();
                                onLogout();
                            }}
                        >
                            Log Out
                        </Button>
                    )}
                </div>
            </aside>
        </div>
    );
};

export default Sidebar;
