import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import navItems from "../config/navItems";
import NavMenuItem from "./ui/NavMenuItem";
import { AuthContext } from "../context";

const useIsDesktop = () => {
    const getIsDesktop = () => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return true;
        }

        return window.matchMedia("(min-width: 1024px)").matches;
    };

    const [isDesktop, setIsDesktop] = useState(getIsDesktop);

    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return undefined;
        }

        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        const handler = (event) => setIsDesktop(event.matches);

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handler);
        } else {
            mediaQuery.addListener(handler);
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener("change", handler);
            } else {
                mediaQuery.removeListener(handler);
            }
        };
    }, []);

    return isDesktop;
};

const sidebarShellClass =
    "relative z-40 hidden w-[var(--sidebar-width)] flex-shrink-0 lg:block";

const asideClass =
    "relative flex h-full flex-col overflow-hidden rounded-[28px] border border-[rgba(27,39,68,0.5)] bg-[linear-gradient(185deg,rgba(20,33,60,0.95)_0%,rgba(10,18,36,0.92)_100%)] px-8 py-11 text-[#F7FAFF] shadow-[0_45px_120px_rgba(5,10,25,0.6)] backdrop-blur-[24px]";

const brandButtonClass =
    "flex items-center gap-3 rounded-[20px] border border-transparent bg-[linear-gradient(145deg,rgba(22,38,70,0.85),rgba(12,22,46,0.75))] px-3.5 py-2 text-left text-inherit no-underline transition-colors hover:border-[#4DD1FF]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DD1FF]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050912]";

const brandMarkClass =
    "flex h-11 w-11 items-center justify-center rounded-[20px] bg-[radial-gradient(circle_at_30%_20%,rgba(77,209,255,0.85),rgba(116,101,168,0.65))] text-[16px] font-bold text-[#0B1426] shadow-[0_16px_40px_rgba(45,130,210,0.6)]";

const brandLabelClass = "text-[10px] font-semibold uppercase tracking-[0.42em] text-[#8BB8FF]";
const brandNameClass = "text-[15px] font-semibold text-white";

const navSectionsClass = "mt-8 flex flex-1 flex-col gap-8 overflow-y-auto pr-1";
const sectionHeadingClass = "pl-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[rgba(76,111,168,0.8)]";
const navGroupClass = "flex flex-col gap-1.5";

const footerClass = "mt-8 flex flex-col gap-3 border-t border-[rgba(27,39,68,0.5)] pt-6";

const ctaCardClass =
    "rounded-[20px] border border-[rgba(47,79,120,0.45)] bg-[linear-gradient(150deg,rgba(34,64,109,0.28),rgba(25,44,78,0.2))] p-5 text-[14px] text-[#E4EBFF] shadow-[0_20px_60px_rgba(10,18,36,0.55)]";
const ctaTitleClass = "m-0 text-[15px] font-semibold text-white";
const ctaBodyClass = "mb-0 mt-1.5 text-[13px] text-[rgba(226,234,255,0.85)]";

const createListingButtonClass =
    "mt-4 w-full border border-[rgba(77,209,255,0.3)] bg-[linear-gradient(145deg,rgba(35,70,120,0.9),rgba(20,40,75,0.85))] text-[#9BD8FF] shadow-[0_20px_45px_rgba(34,64,109,0.45)]";
const logoutButtonClass = "w-full justify-center border border-[rgba(34,54,90,0.7)] bg-[rgba(17,29,54,0.85)] text-[#E4EBFF]";

const Sidebar = ({ onLogout, sidebarWidth }) => {
    const navigate = useNavigate();
    const { permissions = [], role } = useContext(AuthContext);
    const isDesktop = useIsDesktop();

    const filteredNavItems = useMemo(
        () =>
            navItems.filter((item) => {
                if (item.requiresRole && item.requiresRole !== role) {
                    return false;
                }
                if (item.requiresPermission && !permissions.includes(item.requiresPermission)) {
                    return false;
                }
                return true;
            }),
        [permissions, role],
    );

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

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className={isDesktop ? sidebarShellClass : "hidden"} style={{ "--sidebar-width": sidebarWidth }}>
            <aside className={asideClass}>
                <button type="button" onClick={() => handleNavigate("/")} className={brandButtonClass}>
                    <span className={brandMarkClass}>BM</span>
                    <span className="flex flex-col leading-none">
                        <span className={brandLabelClass}>Bellingham</span>
                        <span className={brandNameClass}>Markets Platform</span>
                    </span>
                </button>

                <div className={navSectionsClass}>
                    {Array.from(groupedNavItems.entries()).map(([section, items]) => (
                        <div key={section} className="flex flex-col gap-3">
                            <p className={sectionHeadingClass}>{section}</p>
                            <div className={navGroupClass}>
                                {items.map((item) => (
                                    <NavMenuItem key={item.path} item={item} layout="sidebar" onNavigate={handleNavigate} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={footerClass}>
                    <div className={ctaCardClass}>
                        <p className={ctaTitleClass}>Need to move quickly?</p>
                        <p className={ctaBodyClass}>
                            Launch a new marketplace listing right from here.
                        </p>
                        <Button
                            variant="primary"
                            className={createListingButtonClass}
                            onClick={() => handleNavigate("/sell")}
                        >
                            Create Listing
                        </Button>
                    </div>
                    {onLogout && (
                        <Button variant="ghost" className={logoutButtonClass} onClick={onLogout}>
                            Log Out
                        </Button>
                    )}
                </div>
            </aside>
        </div>
    );
};

export default Sidebar;
