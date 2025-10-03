import React from "react";
import { NavLink } from "react-router-dom";

const baseClasses = {
    header:
        "group relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
    sidebar:
        "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D1FF]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
};

const activeClasses = {
    header:
        "bg-gradient-to-r from-[#00D1FF]/20 via-[#7465A8]/20 to-transparent text-[#00D1FF] shadow-[0_18px_45px_rgba(0,209,255,0.25)]",
    sidebar:
        "bg-gradient-to-r from-[#00D1FF]/18 via-[#7465A8]/14 to-transparent text-white shadow-[inset_0_0_0_1px_rgba(0,209,255,0.35)]",
};

const inactiveClasses = {
    header:
        "text-slate-300 hover:text-[#9CD8D6]",
    sidebar:
        "text-slate-300 hover:bg-slate-900/60 hover:text-white",
};

const NavMenuItem = ({ item, layout = "header", onNavigate }) => {
    const { path, label } = item;

    return (
        <NavLink
            key={path}
            to={path}
            end={path === "/"}
            onClick={() => onNavigate?.(path)}
            className={({ isActive }) =>
                `${baseClasses[layout]} ${isActive ? activeClasses[layout] : inactiveClasses[layout]}`
            }
        >
            {({ isActive }) => (
                <span className="flex w-full items-center gap-3">
                    {layout === "sidebar" && (
                        <span
                            className={`h-2 w-2 rounded-full transition-colors ${
                                isActive
                                    ? "bg-[#00D1FF]"
                                    : "bg-slate-600 group-hover:bg-[#00D1FF]"
                            }`}
                            aria-hidden="true"
                        />
                    )}
                    <span>{label}</span>
                </span>
            )}
        </NavLink>
    );
};

export default NavMenuItem;
