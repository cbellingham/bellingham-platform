import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import navItems from "../config/navItems";
import NavMenuItem from "./ui/NavMenuItem";
import { AuthContext } from "../context";

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
        gap: "0.75rem",
        borderRadius: "20px",
        border: "1px solid transparent",
        backgroundImage: "linear-gradient(145deg, rgba(22,38,70,0.85), rgba(12,22,46,0.75))",
        padding: "0.5rem 0.75rem",
        cursor: "pointer",
        textAlign: "left",
        color: "inherit",
        textDecoration: "none",
    },
    brandMark: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "2.75rem",
        width: "2.75rem",
        borderRadius: "20px",
        backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(77,209,255,0.85), rgba(116,101,168,0.65))",
        fontSize: "1rem",
        fontWeight: 700,
        color: "#0B1426",
        boxShadow: "0 16px 40px rgba(45, 130, 210, 0.6)",
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
        <>
            {!isDesktop && !isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: "fixed",
                        top: "1.25rem",
                        left: "1.25rem",
                        zIndex: 45,
                        padding: "0.65rem 1rem",
                        borderRadius: "14px",
                        border: "1px solid rgba(40, 68, 118, 0.7)",
                        backgroundImage: "linear-gradient(140deg, rgba(20,34,68,0.92), rgba(8,16,32,0.9))",
                        color: "#B7D8FF",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        boxShadow: "0 18px 42px rgba(6, 12, 28, 0.65)",
                    }}
                >
                    Open navigation
                </button>
            )}
            <div style={{ ...sidebarStyles.wrapper(isDesktop, isOpen), "--sidebar-width": sidebarWidth }}>
                <aside style={sidebarStyles.aside}>
                    {!isDesktop && (
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            style={{
                                alignSelf: "flex-end",
                                marginBottom: "1rem",
                                padding: "0.35rem 0.75rem",
                                borderRadius: "12px",
                                border: "1px solid rgba(34, 54, 90, 0.65)",
                                backgroundColor: "rgba(10, 18, 36, 0.8)",
                                color: "#9BD8FF",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                letterSpacing: "0.04em",
                            }}
                        >
                            Close
                        </button>
                    )}
                    <button type="button" onClick={() => handleNavigate("/")} style={sidebarStyles.brandButton}>
                        <span style={sidebarStyles.brandMark}>BM</span>
                        <span style={sidebarStyles.brandText}>
                        <span style={sidebarStyles.brandLabel}>Bellingham</span>
                        <span style={sidebarStyles.brandName}>Markets Platform</span>
                    </span>
                </button>

                <div style={sidebarStyles.navSections}>
                    {Array.from(groupedNavItems.entries()).map(([section, items]) => (
                        <div key={section} style={sidebarStyles.section}>
                            <p style={sidebarStyles.sectionHeading}>{section}</p>
                            <div style={sidebarStyles.navGroup}>
                                {items.map((item) => (
                                    <NavMenuItem key={item.path} item={item} layout="sidebar" onNavigate={handleNavigate} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={sidebarStyles.footer}>
                    <div style={sidebarStyles.ctaCard}>
                        <p style={sidebarStyles.ctaTitle}>Need to move quickly?</p>
                        <p style={sidebarStyles.ctaBody}>
                            Launch a new marketplace listing right from here.
                        </p>
                        <Button variant="primary" style={sidebarStyles.createListingButton} onClick={() => handleNavigate("/sell")}>
                            Create Listing
                        </Button>
                    </div>
                    {onLogout && (
                        <Button variant="ghost" style={sidebarStyles.logoutButton} onClick={onLogout}>
                            Log Out
                        </Button>
                    )}
                </div>
            </aside>
            </div>
        </>
    );
};

export default Sidebar;
