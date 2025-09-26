import React, { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import { useNotifications } from "../context";

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
                (notification) => String(notification.id) === id
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
                clearTimeout(timeoutId)
            );
            autoDismissTimers.current = {};
        },
        []
    );

    const handleViewContracts = useCallback(
        async (id) => {
            await markRead(id);
            navigate("/sell");
        },
        [markRead, navigate]
    );

    const handleDismiss = useCallback(
        (id) => {
            markRead(id);
        },
        [markRead]
    );

    if (!unreadNotifications.length) return null;

    return (
        <section
            className="pointer-events-none fixed top-24 right-4 z-40 max-h-[calc(100vh-6rem)] w-full max-w-sm overflow-y-auto pr-1 sm:right-6"
            aria-live="assertive"
            aria-label="Notifications"
            role="region"
        >
            <ol className="flex flex-col gap-4" role="list">
                {unreadNotifications.map((notification) => (
                    <li key={notification.id} role="listitem" className="pointer-events-auto">
                        <article
                            className="flex flex-col space-y-4 rounded-lg bg-gray-800 p-5 text-white shadow-xl ring-1 ring-black/10 lg:p-6"
                            role="status"
                            aria-atomic="true"
                        >
                            <div className="space-y-2">
                                <p className="text-sm font-semibold">
                                    {notification.title || "New activity"}
                                </p>
                                {notification.message && (
                                    <p className="text-sm text-gray-300">
                                        {notification.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="success"
                                    className="px-3 py-1 text-sm"
                                    onClick={() => handleViewContracts(notification.id)}
                                >
                                    View contracts
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="px-3 py-1 text-sm"
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
