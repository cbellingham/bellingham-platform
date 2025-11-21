import React from "react";
import { NavLink } from "react-router-dom";

const baseClasses = {
    header:
        "group relative inline-flex items-center gap-2 rounded-2xl border border-transparent bg-transparent px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DD1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1222]",
    sidebar:
        "group relative flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium tracking-[0.02em] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DD1FF]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050912]",
};

const activeClasses = {
    header:
        "border-[#294E86]/70 bg-[linear-gradient(140deg,rgba(34,64,109,0.45),rgba(22,38,70,0.35))] text-[#9BD8FF] shadow-[0_18px_45px_rgba(34,64,109,0.45)]",
    sidebar:
        "border-[#294E86]/70 bg-[linear-gradient(120deg,rgba(34,64,109,0.35),rgba(22,38,70,0.28))] text-white shadow-[inset_0_0_0_1px_rgba(77,209,255,0.35)]",
};

const inactiveClasses = {
    header:
        "text-slate-300 hover:text-[#9BD8FF] hover:bg-[rgba(20,36,70,0.25)]",
    sidebar:
        "text-slate-300 hover:border-[#2C4B7D]/50 hover:bg-[rgba(20,36,70,0.22)] hover:text-white",
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
