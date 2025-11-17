import React, { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import { useNotifications } from "../context";

const popupStyles = {
    root: {
        pointerEvents: "none",
        position: "fixed",
        top: "6rem",
        right: "1rem",
        zIndex: 40,
        maxHeight: "calc(100vh - 6rem)",
        width: "100%",
        maxWidth: "22rem",
        overflowY: "auto",
        paddingRight: "0.25rem",
    },
    list: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        listStyle: "none",
        margin: 0,
        padding: 0,
    },
    listItem: {
        pointerEvents: "auto",
    },
    article: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        borderRadius: "1rem",
        backgroundColor: "#1f2937",
        color: "#f8fafc",
        padding: "1.25rem",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.35)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
    },
    messageBlock: {
        display: "flex",
        flexDirection: "column",
        gap: "0.35rem",
    },
    title: {
        fontSize: "0.95rem",
        fontWeight: 600,
        margin: 0,
    },
    message: {
        margin: 0,
        fontSize: "0.9rem",
        color: "rgba(226, 232, 240, 0.9)",
    },
    actions: {
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
    },
    primaryButton: {
        padding: "0.35rem 0.75rem",
        fontSize: "0.9rem",
    },
    secondaryButton: {
        padding: "0.35rem 0.75rem",
        fontSize: "0.9rem",
    },
};

const NotificationPopup = () => {
    const navigate = useNavigate();
    const { unreadNotifications, markRead } = useNotifications();
    const autoDismissTimers = useRef({});

    useEffect(() => {
        const timers = autoDismissTimers.current;

        unreadNotifications.forEach((notification) => {
            const id = String(notification.id);

            if (timers[id]) return;

            timers[id] = window.setTimeout(() => {
                markRead(notification.id);
                delete timers[id];
            }, notification.autoDismissMs ?? 8000);
        });

        Object.keys(timers).forEach((id) => {
            const stillVisible = unreadNotifications.some(
                (notification) => String(notification.id) === id,
            );

            if (!stillVisible) {
                clearTimeout(timers[id]);
                delete timers[id];
            }
        });
    }, [markRead, unreadNotifications]);

    useEffect(
        () => () => {
            Object.values(autoDismissTimers.current).forEach((timeoutId) =>
                clearTimeout(timeoutId),
            );
            autoDismissTimers.current = {};
        },
        [],
    );

    const handleViewContracts = useCallback(
        async (id) => {
            await markRead(id);
            navigate("/sell");
        },
        [markRead, navigate],
    );

    const handleDismiss = useCallback(
        (id) => {
            markRead(id);
        },
        [markRead],
    );

    if (!unreadNotifications.length) return null;

    return (
        <section style={popupStyles.root} aria-live="assertive" aria-label="Notifications" role="region">
            <ol style={popupStyles.list} role="list">
                {unreadNotifications.map((notification) => (
                    <li key={notification.id} role="listitem" style={popupStyles.listItem}>
                        <article style={popupStyles.article} role="status" aria-atomic="true">
                            <div style={popupStyles.messageBlock}>
                                <p style={popupStyles.title}>{notification.title || "New activity"}</p>
                                {notification.message && (
                                    <p style={popupStyles.message}>{notification.message}</p>
                                )}
                            </div>
                            <div style={popupStyles.actions}>
                                <Button
                                    variant="success"
                                    style={popupStyles.primaryButton}
                                    onClick={() => handleViewContracts(notification.id)}
                                >
                                    View contracts
                                </Button>
                                <Button
                                    variant="ghost"
                                    style={popupStyles.secondaryButton}
                                    onClick={() => handleDismiss(notification.id)}
                                >
                                    Dismiss
                                </Button>
                            </div>
                        </article>
                    </li>
                ))}
            </ol>
        </section>
    );
};

export default NotificationPopup;
