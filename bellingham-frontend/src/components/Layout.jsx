import React, { useState } from "react";
import Header from "./Header";
import NotificationPopup from "./NotificationPopup";
import Sidebar from "./Sidebar";

const sidebarWidth = "clamp(220px, 11.111vw, 280px)";

const layoutStyles = {
    root: {
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        backgroundColor: "#050912",
        color: "#E4EBFF",
        fontFamily: "'Inter', 'Inter var', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "clamp(2rem, 4vw, 6rem)",
        backgroundImage: [
            "radial-gradient(circle at 15% 20%, rgba(0, 209, 255, 0.16), transparent 55%)",
            "radial-gradient(circle at 85% 10%, rgba(116, 101, 168, 0.18), transparent 60%)",
            "radial-gradient(circle at 50% 75%, rgba(59, 174, 171, 0.12), transparent 65%)",
            "linear-gradient(180deg, #0A1021 0%, #050912 60%, #03050D 100%)",
        ].join(", "),
    },
    skipLink: {
        position: "absolute",
        top: 0,
        left: 0,
        transform: "translateY(-120%)",
        padding: "0.75rem 1.25rem",
        backgroundColor: "rgba(27, 38, 59, 0.95)",
        color: "inherit",
        fontWeight: 600,
        borderBottomRightRadius: "0.75rem",
        boxShadow: "0 10px 30px rgba(13, 27, 42, 0.45)",
        transition: "transform 0.2s ease",
        zIndex: 50,
        textDecoration: "none",
    },
    skipLinkFocused: {
        transform: "translateY(0)",
    },
    shell: {
        position: "relative",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "1620px",
        padding: "clamp(2rem, 3vw, 4rem)",
        boxSizing: "border-box",
    },
    cardWrapper: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        borderRadius: "28px",
        border: "1px solid rgba(27, 37, 67, 0.7)",
        backgroundImage: "linear-gradient(160deg, rgba(23,34,58,0.95) 0%, rgba(9,14,27,0.92) 100%)",
        boxShadow: "0 50px 140px rgba(5, 9, 20, 0.55)",
        backdropFilter: "blur(24px)",
        minHeight: 0,
    },
    main: {
        flex: 1,
        overflowY: "auto",
        outline: "none",
    },
    mainInner: {
        width: "100%",
        padding: "clamp(2rem, 3vw, 3.5rem) clamp(2rem, 4vw, 5rem) clamp(2.5rem, 4vw, 4.5rem)",
        boxSizing: "border-box",
    },
};

const Layout = ({ children, onLogout }) => {
    const [skipLinkFocused, setSkipLinkFocused] = useState(false);

    return (
        <div style={layoutStyles.root}>
            <a
                href="#main-content"
                style={{
                    ...layoutStyles.skipLink,
                    ...(skipLinkFocused ? layoutStyles.skipLinkFocused : {}),
                }}
                onFocus={() => setSkipLinkFocused(true)}
                onBlur={() => setSkipLinkFocused(false)}
            >
                Skip to main content
            </a>
            <div style={{ ...layoutStyles.shell, "--sidebar-width": sidebarWidth }}>
                <Sidebar onLogout={onLogout} sidebarWidth={sidebarWidth} />
                <div style={layoutStyles.cardWrapper}>
                    <Header onLogout={onLogout} showNavigation={false} />
                    <main id="main-content" tabIndex="-1" style={layoutStyles.main}>
                        <div style={layoutStyles.mainInner}>{children}</div>
                    </main>
                </div>
            </div>
            <NotificationPopup />
        </div>
    );
};

export default Layout;
