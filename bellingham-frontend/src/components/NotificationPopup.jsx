import React, { useCallback, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from "../context";

const NotificationPopup = () => {
    const [notifications, setNotifications] = useState([]);

    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const res = await api.get(`/api/notifications`);
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    }, [token]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markRead = useCallback(
        async (id) => {
            if (!token) return;
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
        [token]
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
