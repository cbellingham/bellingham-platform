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

    const markRead = useCallback(async (id) => {
        if (!token) return;
        try {
            await api.post(`/api/notifications/${id}/read`);
        } catch (err) {
            console.error("Failed to mark notification read", err);
        }
    }, [token]);

    const markAllUnreadAsRead = useCallback(async () => {
        const unreadIds = notifications
            .filter((notification) => !notification.readFlag)
            .map((notification) => notification.id);

        if (!unreadIds.length) return;

        await Promise.all(unreadIds.map((id) => markRead(id)));
        setNotifications((prev) =>
            prev.map((notification) =>
                unreadIds.includes(notification.id)
                    ? { ...notification, readFlag: true }
                    : notification
            )
        );
    }, [markRead, notifications]);

    const unreadNotifications = notifications.filter((notification) => !notification.readFlag);

    const handleViewContracts = useCallback(async () => {
        await markAllUnreadAsRead();
        navigate("/sell");
    }, [markAllUnreadAsRead, navigate]);

    const handleDismiss = useCallback(async () => {
        await markAllUnreadAsRead();
    }, [markAllUnreadAsRead]);

    if (!unreadNotifications.length) return null;

    const unreadCount = unreadNotifications.length;
    const latest = unreadNotifications[0];

    return (
        <div className="fixed top-24 left-4 right-4 md:left-72 md:right-8 z-40 pointer-events-none">
            <div className="bg-gray-800 text-white p-4 rounded shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3 pointer-events-auto">
                <p className="font-semibold">
                    You have {unreadCount === 1 ? "1 unread notification" : `${unreadCount} unread notifications`}.
                </p>
                {latest?.message && (
                    <p className="text-sm text-gray-300 flex-1">
                        Latest: {latest.message}
                    </p>
                )}
                <div className="flex gap-2 flex-wrap">
                    <Button variant="success" className="px-3 py-1" onClick={handleViewContracts}>
                        View my contracts
                    </Button>
                    <Button variant="ghost" className="px-3 py-1" onClick={handleDismiss}>
                        Dismiss
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotificationPopup;
