import React from "react";
import { NavLink } from "react-router-dom";

const baseClasses = {
    header:
        "group relative inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-0",
    sidebar:
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
};

const activeClasses = {
    header:
        "border-transparent bg-gradient-to-br from-emerald-400 via-cyan-500 to-indigo-500 text-white shadow-[0_12px_28px_rgba(12,142,227,0.45)]",
    sidebar: "bg-slate-800 text-white",
};

const inactiveClasses = {
    header:
        "border-slate-700/60 bg-slate-900/40 text-slate-300/80 hover:border-slate-500/70 hover:text-white hover:shadow-[0_10px_22px_rgba(16,185,129,0.35)]",
    sidebar: "text-slate-200 hover:bg-slate-800/70",
};

const iconClasses = {
    header: {
        base: "h-4 w-4 transition-transform duration-300",
        active: "text-white",
        inactive: "text-emerald-200",
    },
    sidebar: {
        base: "h-5 w-5 text-emerald-300",
        active: "",
        inactive: "",
    },
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
            {({ isActive }) => (
                <>
                    {Icon && (
                        <Icon
                            aria-hidden="true"
                            className={`${iconClasses[layout].base} ${isActive ? iconClasses[layout].active : iconClasses[layout].inactive}`}
                        />
                    )}
                    <span>{label}</span>
                </>
            )}
        </NavLink>
    );
};

export default NavMenuItem;
