import React, { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import navItems from "../config/navItems";

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
    }, [navItems]);

    const toggleMobile = () => setIsMobileOpen((prev) => !prev);
    const closeMobile = () => setIsMobileOpen(false);

    const handleNavigate = (path) => {
        navigate(path);
        closeMobile();
    };

    return (
        <div className="relative md:w-64 flex-shrink-0">
            <button
                type="button"
                onClick={toggleMobile}
                className="md:hidden fixed top-24 left-4 z-50 inline-flex items-center justify-center p-2 rounded-md bg-gray-900 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
                aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={isMobileOpen}
            >
                <span className="sr-only">
                    {isMobileOpen ? "Close navigation" : "Open navigation"}
                </span>
                <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    {isMobileOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    role="presentation"
                    onClick={closeMobile}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-900 p-6 flex flex-col justify-between border-r border-gray-700 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:transform-none md:w-64 ${
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <nav className="flex flex-col space-y-6 overflow-y-auto">
                    {Array.from(groupedNavItems.entries()).map(([section, items], index) => (
                        <div key={section} className="flex flex-col space-y-2">
                            <p
                                className={`px-4 text-xs font-semibold uppercase tracking-wide text-gray-400 ${
                                    index === 0 ? "" : "mt-2"
                                }`}
                            >
                                {section}
                            </p>
                            {items.map(({ path, label }) => (
                                <NavLink
                                    key={path}
                                    to={path}
                                    end={path === "/"}
                                    onClick={closeMobile}
                                    className={({ isActive }) =>
                                        `block text-left px-4 py-2 rounded text-white transition-colors duration-150 hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
                                            isActive ? "bg-gray-700" : "bg-transparent"
                                        }`
                                    }
                                >
                                    {label}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>
                <div className="mt-6 flex flex-col space-y-2">
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
