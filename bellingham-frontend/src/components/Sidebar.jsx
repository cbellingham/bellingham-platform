import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import navItems from "../config/navItems";
import NavMenuItem from "./ui/NavMenuItem";
import { AuthContext } from "../context";
import Logo from "./Logo";

const SIDEBAR_BREAKPOINT = 900;

const useIsDesktop = () => {
    const getIsDesktop = () => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return true;
        }

        return window.matchMedia(`(min-width: ${SIDEBAR_BREAKPOINT}px)`).matches;
    };

    const [isDesktop, setIsDesktop] = useState(getIsDesktop);

    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return undefined;
        }

        const mediaQuery = window.matchMedia(`(min-width: ${SIDEBAR_BREAKPOINT}px)`);
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

const sidebarStyles = {
    wrapper: (isDesktop, isOpen) => ({
        position: isDesktop ? "relative" : "fixed",
        top: isDesktop ? undefined : "1.25rem",
        left: isDesktop ? undefined : "1rem",
        right: isDesktop ? undefined : "1rem",
        maxHeight: isDesktop ? "none" : "calc(100vh - 2.5rem)",
        zIndex: 40,
        flexShrink: 0,
        display: isDesktop || isOpen ? "block" : "none",
        width: isDesktop ? "var(--sidebar-width)" : "min(90vw, 360px)",
        margin: isDesktop ? undefined : "0 auto",
    }),
    aside: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        borderRadius: "28px",
        border: "1px solid rgba(27, 39, 68, 0.5)",
        backgroundImage:
            "linear-gradient(185deg, rgba(20,33,60,0.95) 0%, rgba(10,18,36,0.92) 100%)",
        padding: "2.75rem 2rem",
        color: "#F7FAFF",
        boxShadow: "0 45px 120px rgba(5, 10, 25, 0.6)",
        backdropFilter: "blur(24px)",
        boxSizing: "border-box",
    },
    brandButton: {
        display: "flex",
        alignItems: "center",
        gap: "0.8rem",
        borderRadius: "20px",
        border: "1px solid transparent",
        backgroundImage: "linear-gradient(145deg, rgba(22,38,70,0.85), rgba(12,22,46,0.75))",
        padding: "0.55rem 0.9rem",
        cursor: "pointer",
        textAlign: "left",
        color: "inherit",
        textDecoration: "none",
    },
    brandMark: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "3rem",
        width: "3rem",
        borderRadius: "20px",
        backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(77,209,255,0.85), rgba(116,101,168,0.65))",
        boxShadow: "0 16px 40px rgba(45, 130, 210, 0.6)",
        padding: "0.35rem",
    },
    brandText: {
        display: "flex",
        flexDirection: "column",
        lineHeight: 1.1,
    },
    brandLabel: {
        fontSize: "0.6rem",
        fontWeight: 600,
        letterSpacing: "0.42em",
        textTransform: "uppercase",
        color: "#8BB8FF",
    },
    brandName: {
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "#FFFFFF",
    },
    navSections: {
        marginTop: "2rem",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        overflowY: "auto",
        paddingRight: "0.25rem",
    },
    section: {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
    },
    sectionHeading: {
        fontSize: "0.6rem",
        fontWeight: 600,
        letterSpacing: "0.44em",
        textTransform: "uppercase",
        color: "rgba(76, 111, 168, 0.8)",
        paddingLeft: "0.25rem",
    },
    navGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
    },
    footer: {
        marginTop: "2rem",
        borderTop: "1px solid rgba(27, 39, 68, 0.5)",
        paddingTop: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
    },
    ctaCard: {
        borderRadius: "20px",
        border: "1px solid rgba(47, 79, 120, 0.45)",
        backgroundImage: "linear-gradient(150deg, rgba(34,64,109,0.28), rgba(25,44,78,0.2))",
        padding: "1.25rem",
        fontSize: "0.9rem",
        color: "#E4EBFF",
        boxShadow: "0 20px 60px rgba(10, 18, 36, 0.55)",
    },
    ctaTitle: {
        margin: 0,
        fontWeight: 600,
        color: "#FFFFFF",
    },
    ctaBody: {
        marginTop: "0.35rem",
        marginBottom: 0,
        fontSize: "0.8rem",
        color: "rgba(226, 234, 255, 0.85)",
    },
    createListingButton: {
        width: "100%",
        border: "1px solid rgba(77, 209, 255, 0.3)",
        backgroundImage: "linear-gradient(145deg, rgba(35,70,120,0.9), rgba(20,40,75,0.85))",
        color: "#9BD8FF",
        boxShadow: "0 20px 45px rgba(34, 64, 109, 0.45)",
        marginTop: "1rem",
    },
    logoutButton: {
        width: "100%",
        justifyContent: "center",
        border: "1px solid rgba(34, 54, 90, 0.7)",
        backgroundColor: "rgba(17, 29, 54, 0.85)",
        color: "#E4EBFF",
    },
};

const navSectionsClass =
    "mt-8 flex flex-1 flex-col gap-8 overflow-y-auto pr-1 text-slate-100";
const sectionHeadingClass =
    "pl-1 text-[0.6rem] font-semibold uppercase tracking-[0.44em] text-slate-400/80";
const navGroupClass = "flex flex-col gap-2";
const footerClass = "mt-8 flex flex-col gap-4 border-t border-slate-800/60 pt-6";
const ctaCardClass =
    "rounded-2xl border border-slate-700/50 bg-gradient-to-br from-[#223f6c]/30 to-[#182c4c]/25 p-5 text-sm text-slate-100 shadow-[0_20px_60px_rgba(10,18,36,0.55)]";
const ctaTitleClass = "text-base font-semibold text-white";
const ctaBodyClass = "mt-1 text-sm text-slate-200/80";
const createListingButtonClass =
    "mt-4 w-full border border-[#4dd1ff]/30 bg-gradient-to-br from-[#234678]/90 to-[#14284b]/85 text-[#9bd8ff] shadow-[0_20px_45px_rgba(34,64,109,0.45)]";
const logoutButtonClass =
    "w-full justify-center border border-slate-700/70 bg-slate-900/70 text-slate-100";

const Sidebar = ({ onLogout, sidebarWidth }) => {
    const navigate = useNavigate();
    const { permissions = [], role } = useContext(AuthContext);
    const isDesktop = useIsDesktop();
    const [isOpen, setIsOpen] = useState(isDesktop);

    useEffect(() => {
        setIsOpen(isDesktop);
    }, [isDesktop]);

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
        if (!isDesktop) {
            setIsOpen(false);
        }
    };

    return (
        <div style={{ ...sidebarStyles.wrapper(isDesktop, isOpen), "--sidebar-width": sidebarWidth }}>
            <aside style={sidebarStyles.aside}>
                <button type="button" onClick={() => handleNavigate("/")} style={sidebarStyles.brandButton}>
                    <span style={sidebarStyles.brandMark} aria-hidden>
                        <Logo size={40} />
                    </span>
                    <span style={sidebarStyles.brandText}>
                        <span style={sidebarStyles.brandLabel}>Bellingham</span>
                        <span style={sidebarStyles.brandName}>Markets Platform</span>
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
