import React from "react";
import { NavLink } from "react-router-dom";

const baseClasses = {
    header: "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
    sidebar: "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
};

const activeClasses = {
    header: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25",
    sidebar: "bg-slate-800 text-white",
};

const inactiveClasses = {
    header: "text-slate-200 hover:bg-slate-700/70 hover:text-white",
    sidebar: "text-slate-200 hover:bg-slate-800/70",
};

const iconClasses = {
    header: "h-5 w-5 text-white/90 transition-transform duration-200 group-hover:scale-110",
    sidebar: "h-5 w-5 text-emerald-300",
};

const NavMenuItem = ({ item, layout = "header", onNavigate }) => {
    const { path, label, icon: Icon } = item;

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
            {Icon && <Icon aria-hidden="true" className={iconClasses[layout]} />}
            <span>{label}</span>
        </NavLink>
    );
};

export default NavMenuItem;
