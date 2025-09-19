import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import navItems from "../config/navItems";
import NavMenuItem from "./ui/NavMenuItem";

const Sidebar = ({ onLogout }) => {
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const groupedNavItems = useMemo(() => {
        const sections = new Map();

        navItems.forEach((item) => {
            const section = item.section || "General";
            if (!sections.has(section)) {
                sections.set(section, []);
            }
            sections.get(section).push(item);
        });

        return sections;
    }, []);

    const toggleMobile = () => setIsMobileOpen((prev) => !prev);
    const closeMobile = () => setIsMobileOpen(false);

    const handleNavigate = (path) => {
        navigate(path);
        closeMobile();
    };

    return (
        <div className="relative flex-shrink-0 md:w-64">
            <button
                type="button"
                onClick={toggleMobile}
                className="md:hidden fixed top-20 left-4 z-50 inline-flex items-center justify-center rounded-full bg-slate-900 p-3 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-emerald-400"
                aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={isMobileOpen}
            >
                <span className="sr-only">{isMobileOpen ? "Close navigation" : "Open navigation"}</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    {isMobileOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {isMobileOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 md:hidden" role="presentation" onClick={closeMobile} />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col justify-between border-r border-slate-800 bg-slate-950/95 p-6 shadow-xl shadow-black/20 backdrop-blur transition-transform duration-300 ease-in-out md:static md:z-auto md:translate-x-0 md:transform-none md:w-64 ${
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between pb-4 md:hidden">
                    <h2 className="text-base font-semibold text-white">Navigation</h2>
                    <button
                        type="button"
                        onClick={closeMobile}
                        className="inline-flex items-center justify-center rounded-full bg-slate-800 p-2 text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                        <span className="sr-only">Close navigation</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex flex-1 flex-col gap-6 overflow-y-auto pr-2">
                    {Array.from(groupedNavItems.entries()).map(([section, items]) => (
                        <div key={section} className="flex flex-col gap-2">
                            <p className="px-1 text-xs font-semibold uppercase tracking-widest text-slate-400/90">{section}</p>
                            <div className="flex flex-col gap-1">
                                {items.map((item) => (
                                    <NavMenuItem key={item.path} item={item} layout="sidebar" onNavigate={handleNavigate} />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
                <div className="mt-6 flex flex-col space-y-2 border-t border-slate-800 pt-4">
                    <Button
                        variant="success"
                        className="w-full"
                        onClick={() => handleNavigate("/sell")}
                    >
                        New Listing
                    </Button>
                    {onLogout && (
                        <Button
                            variant="danger"
                            className="w-full"
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
