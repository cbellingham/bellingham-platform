import React from "react";
import { NavLink } from "react-router-dom";

const baseClasses = {
    header:
        "group relative inline-flex rounded-lg px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
    sidebar:
        "group flex rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
};

const activeClasses = {
    header:
        "border border-emerald-400/80 bg-emerald-500/20 text-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.25)]",
    sidebar: "bg-slate-800 text-white",
};

const inactiveClasses = {
    header:
        "border border-transparent text-slate-300 hover:border-emerald-400/50 hover:bg-slate-800/60 hover:text-white",
    sidebar: "text-slate-200 hover:bg-slate-800/70",
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
            {() => <span>{label}</span>}
        </NavLink>
    );
};

export default NavMenuItem;
