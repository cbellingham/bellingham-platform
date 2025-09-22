import React, { useCallback, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from "../context";

const NotificationPopup = () => {
    const [notifications, setNotifications] = useState([]);

    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const res = await api.get(`/api/notifications`);
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            setNotifications([]);
            return undefined;
        }

        fetchNotifications();

        if (typeof window === "undefined" || typeof window.EventSource === "undefined") {
            return undefined;
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        let streamUrl;

        try {
            streamUrl = new URL(
                "/api/notifications/stream",
                baseUrl || window.location.origin
            ).toString();
        } catch (err) {
            console.error("Failed to construct notification stream URL", err);
            streamUrl = "/api/notifications/stream";
        }

        const eventSource = new EventSource(streamUrl, {
            withCredentials: true,
        });

        const handleNotification = (event) => {
            try {
                const notification = JSON.parse(event.data);
                setNotifications((prev) => {
                    const existingIndex = prev.findIndex((n) => n.id === notification.id);
                    if (existingIndex !== -1) {
                        const updated = [...prev];
                        updated[existingIndex] = { ...prev[existingIndex], ...notification };
                        return updated;
                    }
                    return [notification, ...prev];
                });
            } catch (err) {
                console.error("Failed to parse notification event", err);
            }
        };

        eventSource.addEventListener("notification", handleNotification);
        eventSource.onerror = (err) => {
            console.error("Notification stream error", err);
        };

        return () => {
            eventSource.removeEventListener("notification", handleNotification);
            eventSource.close();
        };
    }, [fetchNotifications, isAuthenticated]);

    const markRead = useCallback(
        async (id) => {
            if (!isAuthenticated) return;
            try {
                await api.post(`/api/notifications/${id}/read`);
                setNotifications((prev) =>
                    prev.map((notification) =>
                        notification.id === id
                            ? { ...notification, readFlag: true }
                            : notification
                    )
                );
            } catch (err) {
                console.error("Failed to mark notification read", err);
            }
        },
        [isAuthenticated]
    );

    const unreadNotifications = notifications.filter(
        (notification) => !notification.readFlag
    );

    const handleViewContracts = useCallback(
        async (id) => {
            await markRead(id);
            navigate("/sell");
        },
        [markRead, navigate]
    );

    const handleDismiss = useCallback(
        async (id) => {
            await markRead(id);
        },
        [markRead]
    );

    if (!unreadNotifications.length) return null;

    return (
        <div className="pointer-events-none fixed top-28 right-6 z-40 flex max-w-xs flex-col gap-3">
            {unreadNotifications.map((notification) => (
                <div
                    key={notification.id}
                    className="pointer-events-auto w-full rounded-lg bg-gray-800 p-4 text-white shadow-xl"
                >
                    <p className="text-sm font-semibold">
                        {notification.title || "New activity"}
                    </p>
                    {notification.message && (
                        <p className="mt-1 text-sm text-gray-300">
                            {notification.message}
                        </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
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
                </div>
            ))}
        </div>
    );
};

export default NotificationPopup;
