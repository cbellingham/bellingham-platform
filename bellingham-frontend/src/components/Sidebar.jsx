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
                className="fixed left-4 top-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-950/90 text-white shadow-[0_18px_45px_rgba(8,20,45,0.55)] backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 lg:hidden"
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
                className={`fixed inset-y-0 left-0 z-50 flex h-full transform flex-col overflow-hidden border-r border-slate-800/60 bg-slate-950/95 px-6 pb-8 pt-10 text-slate-100 shadow-[0_45px_120px_rgba(8,20,45,0.55)] backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 lg:rounded-3xl lg:border lg:border-slate-800/60 lg:bg-slate-950/60 lg:px-7 lg:py-10 lg:shadow-[0_35px_110px_rgba(8,20,45,0.45)] ${
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                style={{ width: "var(--sidebar-width)", flexBasis: "var(--sidebar-width)" }}
            >
                <div className="flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => handleNavigate("/")}
                        className="group flex items-center gap-3 rounded-2xl border border-transparent bg-slate-900/70 px-3 py-2 text-left transition-colors hover:border-[#00D1FF]/40 hover:bg-slate-900/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00D1FF]/80 to-[#7465A8]/70 text-base font-bold text-slate-950 shadow-[0_12px_35px_rgba(0,209,255,0.45)]">
                            BM
                        </span>
                        <span className="flex flex-col leading-tight">
                            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.38em] text-[#9CD8D6]">Bellingham</span>
                            <span className="text-sm font-semibold text-white">Markets Platform</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={closeMobile}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/60 text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D1FF] lg:hidden"
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
                            <p className="px-1 text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-slate-400/80">{section}</p>
                            <div className="space-y-1.5">
                                {items.map((item) => (
                                    <NavMenuItem key={item.path} item={item} layout="sidebar" onNavigate={handleNavigate} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 space-y-3 border-t border-slate-800/70 pt-6">
                    <div className="rounded-2xl border border-[#00D1FF]/25 bg-gradient-to-br from-[#00D1FF]/10 via-transparent to-[#7465A8]/20 p-4 text-sm text-slate-200 shadow-[0_12px_45px_rgba(0,209,255,0.35)]">
                        <p className="font-semibold text-white">Need to move quickly?</p>
                        <p className="mt-1 text-xs text-slate-300/80">
                            Launch a new marketplace listing right from here.
                        </p>
                        <Button
                            variant="primary"
                            className="mt-4 w-full"
                            onClick={() => handleNavigate("/sell")}
                        >
                            Create Listing
                        </Button>
                    </div>
                    {onLogout && (
                        <Button
                            variant="ghost"
                            className="w-full justify-center border border-slate-800/60 bg-slate-900/70 text-slate-200 hover:border-[#00D1FF]/50 hover:text-white"
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
