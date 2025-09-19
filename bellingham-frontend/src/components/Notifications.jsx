import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from "../context";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { token, logout } = useContext(AuthContext);

    const handleLogout = useCallback(() => {
        logout();
        navigate("/login");
    }, [logout, navigate]);

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError("");
        try {
            const res = await api.get(`/api/notifications`);
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Failed to load notifications", err);
            setError("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchNotifications();
    }, [fetchNotifications, navigate, token]);

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

    const markAllRead = useCallback(async () => {
        const unreadIds = notifications
            .filter((notification) => !notification.readFlag)
            .map((notification) => notification.id);

        if (!unreadIds.length) return;

        await Promise.all(unreadIds.map((id) => markRead(id)));
    }, [markRead, notifications]);

    const unreadCount = notifications.filter(
        (notification) => !notification.readFlag
    ).length;

    return (
        <Layout onLogout={handleLogout}>
            <main className="flex-1 space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Notifications</h1>
                        <p className="text-sm text-gray-300">
                            Review recent activity and mark items as read.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            className="px-4"
                            onClick={fetchNotifications}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="success"
                            className="px-4"
                            onClick={markAllRead}
                            disabled={unreadCount === 0}
                        >
                            Mark all read
                        </Button>
                    </div>
                </div>
                {loading ? (
                    <p className="text-sm text-gray-300">Loading notifications…</p>
                ) : error ? (
                    <p className="text-sm text-red-400">{error}</p>
                ) : notifications.length === 0 ? (
                    <p className="text-sm text-gray-300">You do not have any notifications yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {notifications.map((notification) => (
                            <li
                                key={notification.id}
                                className="rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-sm"
                            >
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {notification.title || "Notification"}
                                        </p>
                                        {notification.message && (
                                            <p className="text-sm text-gray-300">
                                                {notification.message}
                                            </p>
                                        )}
                                        {notification.createdAt && (
                                            <p className="text-xs text-gray-500">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {!notification.readFlag ? (
                                            <Button
                                                variant="success"
                                                className="px-3 py-1 text-sm"
                                                onClick={() => markRead(notification.id)}
                                            >
                                                Mark read
                                            </Button>
                                        ) : (
                                            <span className="rounded-full bg-gray-700 px-3 py-1 text-xs font-semibold uppercase text-gray-300">
                                                Read
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </Layout>
    );
};

export default Notifications;
